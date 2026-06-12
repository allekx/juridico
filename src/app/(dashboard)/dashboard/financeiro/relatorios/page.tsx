import type { Metadata } from "next";
import { withPermission } from "@/lib/auth/guards";
import { parseFinancialFilters } from "@/lib/financial/filters";
import {
  getFinancialClients,
  getFinancialReports,
} from "@/lib/financial/queries";
import { ReportsBoard } from "@/components/modules/financial/reports-board";

export const metadata: Metadata = {
  title: "Relatórios Financeiros",
};

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withPermission("financeiro:read");
  const params = await searchParams;
  const filters = parseFinancialFilters(params);

  const [charts, clients] = await Promise.all([
    getFinancialReports(user.officeId, filters),
    getFinancialClients(user.officeId),
  ]);

  return (
    <ReportsBoard charts={charts} filters={filters} clients={clients} />
  );
}
