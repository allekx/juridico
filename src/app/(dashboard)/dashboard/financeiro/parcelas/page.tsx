import type { Metadata } from "next";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { parseFinancialFilters } from "@/lib/financial/filters";
import {
  getContracts,
  getFinancialClients,
  getFinancialContractsOptions,
  getInstallments,
} from "@/lib/financial/queries";
import { InstallmentsBoard } from "@/components/modules/financial/installments-board";

export const metadata: Metadata = {
  title: "Parcelas",
};

export default async function ParcelasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withPermission("financeiro:read");
  const canWrite = hasPermission(user.role, "financeiro:write");
  const params = await searchParams;
  const filters = parseFinancialFilters(params);

  const [installments, contracts, clients, contractOptions] = await Promise.all([
    getInstallments(user.officeId, filters),
    getContracts(user.officeId, filters),
    getFinancialClients(user.officeId),
    getFinancialContractsOptions(user.officeId, filters.clientId),
  ]);

  return (
    <InstallmentsBoard
      installments={installments}
      contracts={contracts}
      filters={filters}
      clients={clients}
      contractOptions={contractOptions}
      canWrite={canWrite}
    />
  );
}
