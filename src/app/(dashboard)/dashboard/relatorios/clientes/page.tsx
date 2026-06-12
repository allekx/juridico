import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { withAuth } from "@/lib/auth/guards";
import { canAccessReportType } from "@/lib/reports/permissions";
import { parseReportFilters } from "@/lib/reports/filters";
import {
  getClientsReport,
  getReportLawyerOptions,
} from "@/lib/reports/queries";
import { ReportView } from "@/components/modules/reports/report-view";
import { DEFAULT_REDIRECT } from "@/constants/roles";

export const metadata: Metadata = {
  title: "Relatório — Clientes",
};

export default async function RelatorioClientesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withAuth();
  if (!canAccessReportType(user.role, "clientes")) {
    redirect(DEFAULT_REDIRECT[user.role]);
  }

  const params = await searchParams;
  const filters = parseReportFilters(params);

  const [data, lawyers] = await Promise.all([
    getClientsReport(user.officeId, filters),
    getReportLawyerOptions(user.officeId),
  ]);

  return (
    <ReportView
      title="Relatório de Clientes"
      description="Listagem completa com status, advogado responsável e volume de casos"
      type="clientes"
      filters={filters}
      summary={data.summary}
      rows={data.rows}
      columns={[
        { key: "name", label: "Nome" },
        { key: "type", label: "Tipo" },
        { key: "cpfCnpj", label: "CPF/CNPJ" },
        { key: "email", label: "E-mail" },
        { key: "phone", label: "Telefone" },
        { key: "city", label: "Cidade" },
        { key: "lawyerName", label: "Advogado" },
        { key: "casesCount", label: "Casos" },
        { key: "isActive", label: "Status" },
        { key: "createdAt", label: "Cadastro" },
      ]}
      filterProps={{
        showLawyer: true,
        lawyers: lawyers.map((l) => ({ id: l.lawyerId, name: l.name })),
      }}
    />
  );
}
