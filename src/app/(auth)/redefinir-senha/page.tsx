import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/shared/auth/reset-password-form";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Redefinir Senha",
};

export default async function ResetPasswordPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <ResetPasswordForm />;
}
