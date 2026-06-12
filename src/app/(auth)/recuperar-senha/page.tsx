import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/shared/auth/forgot-password-form";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Recuperar Senha",
};

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();

  return <ForgotPasswordForm />;
}
