import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { withAuth } from "@/lib/auth/guards";
import { canAccessReportType } from "@/lib/reports/permissions";
import { parseReportFilters } from "@/lib/reports/filters";
import { getLeadsConversionReport } from "@/lib/reports/queries";
import {
  LeadConversionStats,
  ReportView,
} from "@/components/modules/reports/report-view";
import { LEAD_STATUS_LABELS } from "@/constants/crm";
import { DEFAULT_REDIRECT } from "@/constants/roles";

export const metadata: Metadata = {
  title: "Relatório | Conversão de Leads",
};

export default async function RelatorioLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withAuth();
  if (!canAccessReportType(user.role, "leads")) {
    redirect(DEFAULT_REDIRECT[user.role]);
  }

  const params = await searchParams;
  const filters = parseReportFilters(params);
  const data = await getLeadsConversionReport(user.officeId, filters);

  const statusOptions = Object.entries(LEAD_STATUS_LABELS).map(
    ([value, label]) => ({ value, label })
  );

  return (
    <ReportView
      title="Conversão de Leads"
      description="Funil comercial, taxas por origem e tempo até conversão"
      type="leads"
      filters={filters}
      summary={data.summary}
      rows={data.rows}
      columns={[
        { key: "name", label: "Nome" },
        { key: "source", label: "Origem" },
        { key: "status", label: "Status" },
        { key: "interestArea", label: "Área" },
        { key: "assignedToName", label: "Responsável" },
        { key: "convertedClientName", label: "Cliente" },
        { key: "createdAt", label: "Criado em" },
        { key: "convertedAt", label: "Convertido em" },
        { key: "daysToConvert", label: "Dias" },
      ]}
      filterProps={{ showStatus: true, statusOptions }}
      extra={
        <LeadConversionStats
          bySource={data.bySource}
          byStatus={data.byStatus}
        />
      }
    />
  );
}
