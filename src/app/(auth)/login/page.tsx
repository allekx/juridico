import type { Metadata } from "next";
import { LoginForm } from "@/components/shared/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Login",
};

export const dynamic = "force-dynamic";

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
          Falha na autenticação. Verifique as URLs de redirect no Supabase e
          tente novamente.
        </div>
      )}
      {params.error === "user_not_registered" && (
        <div className="w-full max-w-md rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
          Usuário autenticado, mas não cadastrado no sistema. Execute o seed do
          banco ou contate o administrador.
        </div>
      )}
      {params.error === "db_unavailable" && (
        <div className="w-full max-w-md rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
          Banco de dados indisponível. Verifique DATABASE_URL na Vercel e se o
          seed foi executado.
        </div>
      )}
      <LoginForm redirectTo={params.redirect} />
    </div>
  );
}
