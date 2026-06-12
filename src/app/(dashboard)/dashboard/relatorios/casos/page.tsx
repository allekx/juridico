import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { withAuth } from "@/lib/auth/guards";
import { canAccessReportType } from "@/lib/reports/permissions";
import { parseReportFilters } from "@/lib/reports/filters";
import { getCasesReport, getReportLawyerOptions } from "@/lib/reports/queries";
import { getCaseStatuses } from "@/lib/crm/queries";
import { ReportView } from "@/components/modules/reports/report-view";
import { DEFAULT_REDIRECT } from "@/constants/roles";

export const metadata: Metadata = {
  title: "Relatório — Casos",
};

export default async function RelatorioCasosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withAuth();
  if (!canAccessReportType(user.role, "casos")) {
    redirect(DEFAULT_REDIRECT[user.role]);
  }

  const params = await searchParams;
  const filters = parseReportFilters(params);

  const [data, lawyers, statuses] = await Promise.all([
    getCasesReport(user.officeId, filters),
    getReportLawyerOptions(user.officeId),
    getCaseStatuses(user.officeId),
  ]);

  return (
    <ReportView
      title="Relatório de Casos"
      description="Processos por status, advogado, prioridade e período de abertura"
      type="casos"
      filters={filters}
      summary={data.summary}
      rows={data.rows}
      columns={[
        { key: "title", label: "Título" },
        { key: "caseNumber", label: "Número" },
        { key: "clientName", label: "Cliente" },
        { key: "lawyerName", label: "Advogado" },
        { key: "statusName", label: "Status" },
        { key: "priority", label: "Prioridade" },
        { key: "court", label: "Tribunal" },
        { key: "openedAt", label: "Abertura" },
        { key: "closedAt", label: "Encerramento" },
      ]}
      filterProps={{
        showLawyer: true,
        showStatus: true,
        lawyers: lawyers.map((l) => ({ id: l.userId, name: l.name })),
        statusOptions: statuses.map((s) => ({ value: s.id, label: s.name })),
      }}
    />
  );
}
