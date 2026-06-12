"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  MessageSquare,
  FileText,
  User,
  Scale,
  Menu,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/shared/auth/logout-button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";

const PORTAL_NAV = [
  { href: "/portal", label: "Início", icon: LayoutDashboard, exact: true },
  { href: "/portal/processos", label: "Andamento", icon: Briefcase },
  { href: "/portal/timeline", label: "Acompanhamento", icon: Clock },
  { href: "/portal/mensagens", label: "Mensagens", icon: MessageSquare },
  { href: "/portal/documentos", label: "Documentos", icon: FileText },
  { href: "/portal/perfil", label: "Meus Dados", icon: User },
];

interface PortalSidebarProps {
  user: AuthUser;
}

export function PortalSidebar({ user }: PortalSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <>
      {PORTAL_NAV.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "ds-sidebar-item",
              isActive && "bg-sidebar-accent text-sidebar-foreground"
            )}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "ds-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
          <Scale className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <span className="font-display text-lg font-semibold tracking-tight">
            Área do Cliente
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">{nav}</nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 rounded-md bg-sidebar-accent px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60">Cliente</p>
          </div>
          <Separator className="mb-3 bg-sidebar-border" />
          <LogoutButton variant="ghost" sidebar />
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
