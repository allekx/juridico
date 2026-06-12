import type { Metadata } from "next";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { parseFinancialFilters } from "@/lib/financial/filters";
import {
  getContracts,
  getFinancialCases,
  getFinancialClients,
} from "@/lib/financial/queries";
import { ContractsBoard } from "@/components/modules/financial/contracts-board";

export const metadata: Metadata = {
  title: "Contratos",
};

export default async function ContratosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withPermission("financeiro:read");
  const canWrite = hasPermission(user.role, "financeiro:write");
  const params = await searchParams;
  const filters = parseFinancialFilters(params);

  const [contracts, clients, cases] = await Promise.all([
    getContracts(user.officeId, filters),
    getFinancialClients(user.officeId),
    getFinancialCases(user.officeId),
  ]);

  return (
    <ContractsBoard
      contracts={contracts}
      filters={filters}
      clients={clients}
      cases={cases}
      canWrite={canWrite}
    />
  );
}
