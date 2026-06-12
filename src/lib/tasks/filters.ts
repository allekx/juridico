import type { TaskListFilters } from "@/types/tasks";

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseTaskFilters(
  searchParams: Record<string, string | string[] | undefined>
): TaskListFilters {
  return {
    q: first(searchParams.q)?.trim() || undefined,
    status: first(searchParams.status) || undefined,
    assignedToId: first(searchParams.assignedToId) || undefined,
    clientId: first(searchParams.clientId) || undefined,
    caseId: first(searchParams.caseId) || undefined,
    priority: first(searchParams.priority) || undefined,
    dueFrom: first(searchParams.dueFrom) || undefined,
    dueTo: first(searchParams.dueTo) || undefined,
  };
}
