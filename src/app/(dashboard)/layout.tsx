import type { Metadata } from "next";
import { DASHBOARD_ROLES } from "@/constants/roles";
import { AppSidebar } from "@/components/layout/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard/dashboard-header";
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

  return (
    <div className="flex min-h-screen bg-muted/20">
      <div className="hidden lg:block">
        <AppSidebar user={user} />
      </div>

      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={user.name} userRole={user.role} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
