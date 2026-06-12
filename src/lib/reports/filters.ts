import type { ReportFilters } from "@/types/reports";
import type { Prisma } from "@prisma/client";

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseReportFilters(
  params: Record<string, string | string[] | undefined>
): ReportFilters {
  return {
    dateFrom: first(params.dateFrom),
    dateTo: first(params.dateTo),
    q: first(params.q),
    lawyerId: first(params.lawyerId),
    status: first(params.status),
  };
}

export function buildDateRange(
  dateFrom?: string,
  dateTo?: string
): Prisma.DateTimeFilter | undefined {
  if (!dateFrom && !dateTo) return undefined;
  const filter: Prisma.DateTimeFilter = {};
  if (dateFrom) filter.gte = new Date(`${dateFrom}T00:00:00`);
  if (dateTo) filter.lte = new Date(`${dateTo}T23:59:59`);
  return filter;
}
