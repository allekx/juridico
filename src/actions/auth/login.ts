"use server";

import { redirect } from "next/navigation";
import { DEFAULT_REDIRECT } from "@/constants/roles";
import { syncUserRoleMetadata } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { logLogin, logLoginFailed } from "@/lib/audit/service";
import { loginSchema } from "@/schemas/auth";
import type { ActionResult } from "@/types/auth";

export async function loginAction(
  _prevState: ActionResult<{ redirectTo: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
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

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    await logLoginFailed(email, "Credenciais inválidas", "dashboard");
    return {
      success: false,
      error: "E-mail ou senha incorretos",
    };
  }

  const dbUser = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
      isActive: true,
    },
  });

  if (!dbUser) {
    await supabase.auth.signOut();
    await logLoginFailed(email, "Usuário não cadastrado", "dashboard");
    return {
      success: false,
      error: "Usuário não cadastrado no sistema",
    };
  }

  await syncUserRoleMetadata(dbUser.id, dbUser.role, dbUser.officeId);

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

  const redirectTo = safeRedirectPath(
    (formData.get("redirect") as string) || DEFAULT_REDIRECT[dbUser.role],
    DEFAULT_REDIRECT[dbUser.role]
  );

  redirect(redirectTo);
}
