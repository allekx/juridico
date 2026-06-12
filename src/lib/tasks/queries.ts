import { prisma } from "@/lib/prisma/client";
import type { TaskListFilters, TaskRow, TaskStats } from "@/types/tasks";
import type { Prisma } from "@prisma/client";

function buildWhere(
  officeId: string,
  filters: TaskListFilters
): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {
    officeId,
    deletedAt: null,
    status: { not: "CANCELLED" },
  };

  if (filters.status) {
    where.status = filters.status as Prisma.EnumTaskStatusFilter;
  }

  if (filters.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  if (filters.clientId) {
    where.clientId = filters.clientId;
  }

  if (filters.caseId) {
    where.caseId = filters.caseId;
  }

  if (filters.priority) {
    where.priority = filters.priority as Prisma.EnumTaskPriorityFilter;
  }

  if (filters.dueFrom || filters.dueTo) {
    where.dueDate = {};
    if (filters.dueFrom) {
      where.dueDate.gte = new Date(`${filters.dueFrom}T00:00:00`);
    }
    if (filters.dueTo) {
      where.dueDate.lte = new Date(`${filters.dueTo}T23:59:59`);
    }
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { client: { name: { contains: filters.q, mode: "insensitive" } } },
      { case: { title: { contains: filters.q, mode: "insensitive" } } },
      { case: { caseNumber: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function getTasks(
  officeId: string,
  filters: TaskListFilters = {}
): Promise<TaskRow[]> {
  const tasks = await prisma.task.findMany({
    where: buildWhere(officeId, filters),
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
      client: { select: { id: true, name: true } },
      case: { select: { id: true, title: true } },
    },
    orderBy: [
      { status: "asc" },
      { priority: "desc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
    take: 200,
  });

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString() ?? null,
    completedAt: t.completedAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    assignedToId: t.assignedTo.id,
    assignedToName: t.assignedTo.name,
    clientId: t.client?.id ?? null,
    clientName: t.client?.name ?? null,
    caseId: t.case?.id ?? null,
    caseTitle: t.case?.title ?? null,
    createdByName: t.createdBy.name,
  }));
}

export async function getTaskStats(
  officeId: string,
  filters: Omit<TaskListFilters, "status"> = {}
): Promise<TaskStats> {
  const baseWhere = buildWhere(officeId, filters);

  const [pending, inProgress, completed, total] = await Promise.all([
    prisma.task.count({
      where: { ...baseWhere, status: "PENDING" },
    }),
    prisma.task.count({
      where: { ...baseWhere, status: "IN_PROGRESS" },
    }),
    prisma.task.count({
      where: { ...baseWhere, status: "COMPLETED" },
    }),
    prisma.task.count({ where: baseWhere }),
  ]);

  return { pending, inProgress, completed, total };
}
