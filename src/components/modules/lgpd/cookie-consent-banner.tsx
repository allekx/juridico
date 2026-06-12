"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { recordCookieConsentAction } from "@/actions/lgpd";

const STORAGE_KEY = "lgpd-cookie-consent-v1";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setVisible(false);
    startTransition(async () => {
      await recordCookieConsentAction();
    });
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-4 shadow-lg backdrop-blur md:p-6">
      <div className="ds-container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl text-sm text-muted-foreground">
          Utilizamos cookies e tecnologias semelhantes para melhorar sua
          experiência, analisar o uso do site e cumprir obrigações legais.
          Ao continuar, você concorda com nossa{" "}
          <Link href="/privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </Link>{" "}
          e{" "}
          <Link href="/termos" className="text-primary hover:underline">
            Termos de Uso
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" onClick={accept} disabled={isPending}>
            Aceitar
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/privacidade">Saiba mais</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
