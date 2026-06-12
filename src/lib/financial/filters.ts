import type { FinancialListFilters } from "@/types/financial";

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseFinancialFilters(
  params: Record<string, string | string[] | undefined>
): FinancialListFilters {
  return {
    clientId: first(params.clientId),
    contractId: first(params.contractId),
    status: first(params.status),
    dateFrom: first(params.dateFrom),
    dateTo: first(params.dateTo),
    q: first(params.q),
  };
}
