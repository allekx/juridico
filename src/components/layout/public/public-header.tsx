"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, OFFICE_INFO } from "@/constants/home-content";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="ds-container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Scale className="h-6 w-6 text-gold" strokeWidth={1.5} />
          <div className="flex flex-col">
            <span className="font-display text-lg font-semibold leading-tight tracking-tight text-primary">
              {OFFICE_INFO.name}
            </span>
            <span className="hidden text-2xs text-muted-foreground sm:block">
              {OFFICE_INFO.tagline}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/triagem">Triagem Gratuita</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
            <Link href="/portal/acesso">Área do Cliente</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background transition-all duration-300 lg:hidden",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <nav className="ds-container flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-4">
            <Button asChild>
              <Link href="/triagem" onClick={() => setMobileOpen(false)}>
                Triagem Gratuita
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/portal/acesso" onClick={() => setMobileOpen(false)}>
                Área do Cliente
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Entrar
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
