import { redirect } from "next/navigation";
import {
  canAccessReports,
  getVisibleReportTypes,
} from "@/lib/reports/permissions";
import { getSessionUser } from "@/lib/auth/session";
import { ReportsNav } from "@/components/modules/reports/reports-nav";
import { DEFAULT_REDIRECT } from "@/constants/roles";

export default async function RelatoriosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser || !canAccessReports(sessionUser.role)) {
    redirect(sessionUser ? DEFAULT_REDIRECT[sessionUser.role] : "/login");
  }

  const visibleTypes = getVisibleReportTypes(sessionUser.role);

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
