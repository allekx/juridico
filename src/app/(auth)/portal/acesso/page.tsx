import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";
import { ClientLoginForm } from "@/components/shared/auth/client-login-form";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Área do Cliente",
};

interface ClientAccessPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ClientAccessPage({
  searchParams,
}: ClientAccessPageProps) {
  const session = await getSessionUser();
  if (session?.role === "CLIENT") {
    redirect("/portal");
  }

  const params = await searchParams;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-primary">
        <Scale className="h-6 w-6 text-gold" />
        <span className="font-display text-lg font-semibold">Portal do Cliente</span>
      </div>

      {params.error === "sem_cadastro" && (
        <div className="w-full max-w-md rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
          Sua conta não está vinculada a um cadastro de cliente.
        </div>
      )}

      <ClientLoginForm />

      <p className="text-center text-sm text-muted-foreground">
        É da equipe do escritório?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Acessar sistema interno
        </Link>
      </p>
    </div>
  );
}
