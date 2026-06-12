"use server";

import { forgotPasswordSchema, resetPasswordSchema } from "@/schemas/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/auth";

export async function forgotPasswordAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = { email: formData.get("email") };
  const parsed = forgotPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${appUrl}/auth/callback?type=recovery&next=/redefinir-senha`,
    }
  );

  if (error) {
    return {
      success: false,
      error: "Não foi possível enviar o e-mail de recuperação",
    };
  }

  return {
    success: true,
    data: undefined,
  };
}

export async function updatePasswordAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = resetPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: "Não foi possível atualizar a senha",
    };
  }

  return {
    success: true,
    data: undefined,
  };
}
