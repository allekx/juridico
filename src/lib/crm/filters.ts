import type { CrmListFilters } from "@/types/crm";

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseCrmFilters(
  searchParams: Record<string, string | string[] | undefined>
): CrmListFilters {
  return {
    q: first(searchParams.q)?.trim() || undefined,
    status: first(searchParams.status) || undefined,
    source: first(searchParams.source) || undefined,
    assignedToId: first(searchParams.assignedToId) || undefined,
    lawyerId: first(searchParams.lawyerId) || undefined,
    priority: first(searchParams.priority) || undefined,
    type: first(searchParams.type) || undefined,
    isActive: first(searchParams.isActive) || undefined,
    dateFrom: first(searchParams.dateFrom) || undefined,
    dateTo: first(searchParams.dateTo) || undefined,
  };
}

export function buildFilterQuery(filters: CrmListFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
