import type { Metadata } from "next";
import { withPermission } from "@/lib/auth/guards";
import { parseFinancialFilters } from "@/lib/financial/filters";
import {
  getClientsFinancialSummary,
  getFinancialClients,
} from "@/lib/financial/queries";
import { ClientsFinancialBoard } from "@/components/modules/financial/clients-financial-board";

export const metadata: Metadata = {
  title: "Financeiro por Cliente",
};

export default async function FinanceiroClientesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withPermission("financeiro:read");
  const params = await searchParams;
  const filters = parseFinancialFilters(params);

  const [clients, clientOptions] = await Promise.all([
    getClientsFinancialSummary(user.officeId, filters),
    getFinancialClients(user.officeId),
  ]);

  return (
    <ClientsFinancialBoard
      clients={clients}
      filters={filters}
      clientOptions={clientOptions}
    />
  );
}
