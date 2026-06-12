"use server";

import { redirect } from "next/navigation";
import { syncUserRoleMetadata } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { cpfToPortalEmail } from "@/lib/auth/cpf";
import { logLogin, logLoginFailed } from "@/lib/audit/service";
import { clientLoginSchema } from "@/schemas/auth";
import type { ActionResult } from "@/types/auth";

export async function clientLoginAction(
  _prevState: ActionResult<{ redirectTo: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = clientLoginSchema.safeParse({
    cpf: formData.get("cpf"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const portalEmail = cpfToPortalEmail(parsed.data.cpf);
  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: portalEmail,
    password: parsed.data.password,
  });

  if (authError) {
    await logLoginFailed(parsed.data.cpf, "Credenciais inválidas", "portal");
    return { success: false, error: "CPF ou senha incorretos" };
  }

  const dbUser = await prisma.user.findFirst({
    where: {
      email: portalEmail,
      role: "CLIENT",
      deletedAt: null,
      isActive: true,
    },
    include: { clientProfile: true },
  });

  if (!dbUser?.clientProfile) {
    await supabase.auth.signOut();
    await logLoginFailed(parsed.data.cpf, "Cliente não vinculado", "portal");
    return {
      success: false,
      error: "Conta de cliente não vinculada. Contate o escritório.",
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
    "portal"
  );

  redirect("/portal");
}
