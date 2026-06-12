import type { Metadata } from "next";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { parseFinancialFilters } from "@/lib/financial/filters";
import {
  getFinancialCases,
  getFinancialClients,
  getFinancialContractsOptions,
  getReceipts,
} from "@/lib/financial/queries";
import { PaymentsBoard } from "@/components/modules/financial/payments-board";

export const metadata: Metadata = {
  title: "Recebimentos",
};

export default async function RecebimentosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withPermission("financeiro:read");
  const canWrite = hasPermission(user.role, "financeiro:write");
  const params = await searchParams;
  const filters = parseFinancialFilters(params);

  const [payments, clients, contracts, cases] = await Promise.all([
    getReceipts(user.officeId, filters),
    getFinancialClients(user.officeId),
    getFinancialContractsOptions(user.officeId, filters.clientId),
    getFinancialCases(user.officeId, filters.clientId),
  ]);

  return (
    <PaymentsBoard
      payments={payments}
      direction="RECEIPT"
      filters={filters}
      clients={clients}
      contracts={contracts}
      cases={cases}
      canWrite={canWrite}
    />
  );
}
