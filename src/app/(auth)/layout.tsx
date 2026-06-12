import type { Metadata } from "next";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/20 to-gold-muted/30 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.04),_transparent_60%)]" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-md">
            <Scale className="h-6 w-6 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-primary">
            Sistema Jurídico
          </h1>
          <p className="text-sm text-muted-foreground">
            Acesso seguro à plataforma
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
