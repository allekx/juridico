import { redirect } from "next/navigation";
import { withAuth } from "@/lib/auth/guards";
import {
  canAccessReports,
  getVisibleReportTypes,
} from "@/lib/reports/permissions";
import { ReportsNav } from "@/components/modules/reports/reports-nav";
import { DEFAULT_REDIRECT } from "@/constants/roles";

export default async function RelatoriosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await withAuth();

  if (!canAccessReports(user.role)) {
    redirect(DEFAULT_REDIRECT[user.role]);
  }

  const visibleTypes = getVisibleReportTypes(user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Relatórios Administrativos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Análises operacionais com exportação CSV
        </p>
      </div>

      <ReportsNav visibleTypes={visibleTypes} />

      {children}
    </div>
  );
}
