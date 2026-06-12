import type { Metadata } from "next";
import { LoginForm } from "@/components/shared/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Login",
};

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectIfAuthenticated();

  const params = await searchParams;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {params.error === "perfil_invalido" && (
        <div className="w-full max-w-md rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
          Perfil de usuário inválido. Entre em contato com o administrador.
        </div>
      )}
      {params.error === "auth_callback_failed" && (
        <div className="w-full max-w-md rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
          Falha na autenticação. Tente novamente.
        </div>
      )}
      <LoginForm redirectTo={params.redirect} />
    </div>
  );
}
