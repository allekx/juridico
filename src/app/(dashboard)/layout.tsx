import type { Metadata } from "next";
import { DASHBOARD_ROLES } from "@/constants/roles";
import { DashboardShell } from "@/components/layout/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(DASHBOARD_ROLES);

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
