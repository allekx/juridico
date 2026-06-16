"use server";

import { DEFAULT_REDIRECT } from "@/constants/roles";
import { syncUserRoleMetadata } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { prisma } from "@/lib/prisma/client";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { logLogin, logLoginFailed } from "@/lib/audit/service";
import { loginSchema } from "@/schemas/auth";
import type { ActionResult } from "@/types/auth";
import type { SupabaseClient } from "@supabase/supabase-js";

async function safeSignOut(supabase: SupabaseClient) {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[login] signOut:", error);
  }
}

function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials")
  ) {
    return "E-mail ou senha incorretos";
  }

  if (normalized.includes("email not confirmed")) {
    return "E-mail ainda não confirmado. Verifique sua caixa de entrada.";
  }

  if (normalized.includes("invalid api key")) {
    return "Chave do Supabase inválida na Vercel. Verifique NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";
  }

  return `Falha na autenticação: ${message}`;
}

function mapUnexpectedError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    const normalized = error.message.toLowerCase();

    if (normalized.includes("invalid api key")) {
      return "Chave do Supabase inválida na Vercel.";
    }

    if (normalized.includes("fetch failed") || normalized.includes("network")) {
      return "Não foi possível conectar ao Supabase. Tente novamente.";
    }

    return `Erro ao entrar: ${error.message}`;
  }

  return "Erro ao entrar. Tente novamente em instantes.";
}

export async function loginAction(
  _prevState: ActionResult<{ redirectTo: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error:
          "Supabase não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY na Vercel.",
      };
    }

    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = loginSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Dados inválidos",
      };
    }

    const { email, password } = parsed.data;

    let supabase: SupabaseClient;
    try {
      supabase = await createClient();
    } catch (error) {
      console.error("[login] createClient:", error);
      return {
        success: false,
        error: "Erro ao iniciar sessão. Recarregue a página e tente novamente.",
      };
    }

    let authError: { message: string } | null = null;

    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authError = result?.error ?? null;
    } catch (error) {
      console.error("[login] signInWithPassword:", error);
      return {
        success: false,
        error: mapUnexpectedError(error),
      };
    }

    if (authError) {
      void logLoginFailed(email, authError.message, "dashboard");
      return {
        success: false,
        error: mapAuthError(authError.message),
      };
    }

    let dbUser;
    try {
      dbUser = await prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
          isActive: true,
        },
      });
    } catch (error) {
      console.error("[login] Prisma findFirst:", error);
      await safeSignOut(supabase);
      return {
        success: false,
        error:
          "Banco de dados indisponível. Verifique DATABASE_URL na Vercel e execute npm run db:seed.",
      };
    }

    if (!dbUser) {
      await safeSignOut(supabase);
      void logLoginFailed(email, "Usuário não cadastrado", "dashboard");
      return {
        success: false,
        error:
          "Usuário autenticado, mas não cadastrado no banco. Execute npm run db:push e npm run db:seed.",
      };
    }

    await syncUserRoleMetadata(dbUser.id, dbUser.role, dbUser.officeId);

    try {
      await supabase.auth.refreshSession();
    } catch (error) {
      console.error("[login] refreshSession:", error);
    }

    try {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { lastLogin: new Date() },
      });

      void logLogin(
        {
          id: dbUser.id,
          officeId: dbUser.officeId,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        },
        "dashboard"
      );
    } catch (error) {
      console.error("[login] pós-auth:", error);
    }

    const redirectTo = safeRedirectPath(
      (formData.get("redirect") as string) || DEFAULT_REDIRECT[dbUser.role],
      DEFAULT_REDIRECT[dbUser.role]
    );

    return {
      success: true,
      data: { redirectTo },
    };
  } catch (error) {
    console.error("[login] Erro inesperado:", error);
    return {
      success: false,
      error: mapUnexpectedError(error),
    };
  }
}
