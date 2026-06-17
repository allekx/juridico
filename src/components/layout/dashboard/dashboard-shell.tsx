"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NavProgressProvider } from "@/components/shared/navigation/nav-progress";
import { AppSidebar } from "@/components/layout/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard/dashboard-header";
import type { AuthUser } from "@/types/auth";

const PREFETCH_ROUTES = [
  "/dashboard",
  "/dashboard/crm",
  "/dashboard/kanban",
  "/dashboard/agenda",
  "/dashboard/tarefas",
  "/dashboard/documentos",
  "/dashboard/financeiro",
  "/dashboard/relatorios",
  "/dashboard/blog",
  "/dashboard/admin",
];

interface DashboardShellProps {
  user: AuthUser;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const router = useRouter();

  useEffect(() => {
    for (const href of PREFETCH_ROUTES) {
      router.prefetch(href);
    }
  }, [router]);

  return (
    <NavProgressProvider>
      <div className="flex min-h-screen bg-muted/20">
        <div className="hidden shrink-0 lg:sticky lg:top-0 lg:block lg:h-screen">
          <AppSidebar user={user} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader userName={user.name} userRole={user.role} />
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </NavProgressProvider>
  );
}
