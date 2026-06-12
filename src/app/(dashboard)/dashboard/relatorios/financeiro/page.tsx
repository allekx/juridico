import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { withAuth } from "@/lib/auth/guards";
import { canAccessReportType } from "@/lib/reports/permissions";
import { parseReportFilters } from "@/lib/reports/filters";
import { getFinancialReport } from "@/lib/reports/queries";
import { ReportView } from "@/components/modules/reports/report-view";
import { formatCurrency } from "@/lib/financial/format";
import { DEFAULT_REDIRECT } from "@/constants/roles";

export const metadata: Metadata = {
  title: "Relatório — Financeiro",
};

export default async function RelatorioFinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withAuth();
  if (!canAccessReportType(user.role, "financeiro")) {
    redirect(DEFAULT_REDIRECT[user.role]);
  }

  const params = await searchParams;
  const filters = parseReportFilters(params);
  const data = await getFinancialReport(user.officeId, filters);

  return (
    <ReportView
      title="Relatório Financeiro"
      description="Recebimentos e pagamentos detalhados por período"
      type="financeiro"
      filters={filters}
      summary={data.summary}
      rows={data.rows}
      columns={[
        { key: "direction", label: "Tipo" },
        { key: "clientName", label: "Cliente" },
        { key: "description", label: "Descrição" },
        {
          key: "amount",
          label: "Valor",
          render: (row) => formatCurrency(row.amount as number),
        },
        { key: "status", label: "Status" },
        { key: "method", label: "Forma" },
        { key: "dueDate", label: "Vencimento" },
        { key: "paidAt", label: "Pagamento" },
        { key: "invoiceNumber", label: "NF" },
      ]}
      filterProps={{}}
    />
  );
}
