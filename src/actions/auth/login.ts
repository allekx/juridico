"use server";

import { DEFAULT_REDIRECT } from "@/constants/roles";
import { syncUserRoleMetadata } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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

export async function loginAction(
  _prevState: ActionResult<{ redirectTo: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  try {
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
    const supabase = await createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      await logLoginFailed(email, "Credenciais inválidas", "dashboard");
      return {
        success: false,
        error: "E-mail ou senha incorretos",
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
      await logLoginFailed(email, "Usuário não cadastrado", "dashboard");
      return {
        success: false,
        error: "Usuário não cadastrado no sistema. Execute npm run db:seed.",
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

      await logLogin(
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
      error: "Erro ao entrar. Tente novamente em instantes.",
    };
  }
}
