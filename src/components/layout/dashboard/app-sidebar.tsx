"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Calendar,
  CheckSquare,
  FileText,
  DollarSign,
  FileBarChart,
  Settings,
  Newspaper,
  Scale,
  Menu,
  X,
} from "lucide-react";
import { ROLE_LABELS } from "@/constants/roles";
import { hasPermission } from "@/lib/auth/permissions";
import { AppNavLink } from "@/components/shared/navigation/app-nav-link";
import { LogoutButton } from "@/components/shared/auth/logout-button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  permission?: Parameters<typeof hasPermission>[1];
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />,
    permission: "dashboard:read",
    exact: true,
  },
  {
    href: "/dashboard/crm",
    label: "CRM",
    icon: <Users className="h-4 w-4" strokeWidth={1.5} />,
    permission: "crm:read",
  },
  {
    href: "/dashboard/kanban",
    label: "Kanban",
    icon: <Kanban className="h-4 w-4" strokeWidth={1.5} />,
    permission: "crm:read",
  },
  {
    href: "/dashboard/agenda",
    label: "Agenda",
    icon: <Calendar className="h-4 w-4" strokeWidth={1.5} />,
    permission: "agenda:read",
  },
  {
    href: "/dashboard/tarefas",
    label: "Tarefas",
    icon: <CheckSquare className="h-4 w-4" strokeWidth={1.5} />,
    permission: "tarefas:read",
  },
  {
    href: "/dashboard/documentos",
    label: "Documentos",
    icon: <FileText className="h-4 w-4" strokeWidth={1.5} />,
    permission: "documentos:read",
  },
  {
    href: "/dashboard/financeiro",
    label: "Financeiro",
    icon: <DollarSign className="h-4 w-4" strokeWidth={1.5} />,
    permission: "financeiro:read",
  },
  {
    href: "/dashboard/relatorios",
    label: "Relatórios",
    icon: <FileBarChart className="h-4 w-4" strokeWidth={1.5} />,
    permission: "relatorios:read",
  },
  {
    href: "/dashboard/blog",
    label: "Blog",
    icon: <Newspaper className="h-4 w-4" strokeWidth={1.5} />,
    permission: "blog:read",
  },
  {
    href: "/dashboard/admin",
    label: "Administração",
    icon: <Settings className="h-4 w-4" strokeWidth={1.5} />,
    permission: "admin:read",
  },
];

interface AppSidebarProps {
  user: AuthUser;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(user.role, item.permission)
  );

  const nav = (
    <>
      {visibleItems.map((item) => (
        <AppNavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          exact={item.exact}
          onClick={() => setMobileOpen(false)}
        />
      ))}
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

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={cn(
          "ds-sidebar flex h-screen w-64 flex-col",
          "fixed inset-y-0 left-0 z-40 transition-transform lg:relative lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
          <Scale className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <span className="font-display text-lg font-semibold tracking-tight">
            Jurídico
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">{nav}</nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 rounded-md bg-sidebar-accent px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <Separator className="mb-3 bg-sidebar-border" />
          <LogoutButton variant="ghost" sidebar />
        </div>
      </aside>
    </>
  );
}
