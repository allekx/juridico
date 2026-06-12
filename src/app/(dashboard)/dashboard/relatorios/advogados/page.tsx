import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { withAuth } from "@/lib/auth/guards";
import { canAccessReportType } from "@/lib/reports/permissions";
import { parseReportFilters } from "@/lib/reports/filters";
import { getLawyersReport } from "@/lib/reports/queries";
import { ReportView } from "@/components/modules/reports/report-view";
import { formatCurrency } from "@/lib/financial/format";
import { DEFAULT_REDIRECT } from "@/constants/roles";

export const metadata: Metadata = {
  title: "Relatório — Advogados",
};

export default async function RelatorioAdvogadosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withAuth();
  if (!canAccessReportType(user.role, "advogados")) {
    redirect(DEFAULT_REDIRECT[user.role]);
  }

  const params = await searchParams;
  const filters = parseReportFilters(params);
  const data = await getLawyersReport(user.officeId, filters);

  return (
    <ReportView
      title="Relatório de Advogados"
      description="Carga de trabalho, clientes atribuídos e receita por advogado"
      type="advogados"
      filters={filters}
      summary={data.summary}
      rows={data.rows}
      columns={[
        { key: "name", label: "Nome" },
        { key: "oab", label: "OAB" },
        { key: "specialty", label: "Especialidade" },
        { key: "isPartner", label: "Sócio" },
        { key: "clientsCount", label: "Clientes" },
        { key: "activeCases", label: "Casos ativos" },
        { key: "totalCases", label: "Casos total" },
        { key: "pendingTasks", label: "Tarefas" },
        {
          key: "receiptsTotal",
          label: "Receita",
          render: (row) => formatCurrency(row.receiptsTotal as number),
        },
      ]}
      filterProps={{}}
    />
  );
}
