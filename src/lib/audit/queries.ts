import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { AUDIT_PER_PAGE } from "@/constants/audit";
import type {
  AuditLogFilters,
  AuditLogItem,
  AuditLogStats,
  PaginatedAuditLogs,
} from "@/types/audit";

function mapAuditLog(
  log: {
    id: string;
    action: AuditLogItem["action"];
    entityType: string;
    entityId: string | null;
    description: string;
    actorId: string | null;
    ipAddress: string | null;
    createdAt: Date;
    actor: { name: string; email: string } | null;
  }
): AuditLogItem {
  return {
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    description: log.description,
    actorId: log.actorId,
    actorName: log.actor?.name ?? "Sistema",
    actorEmail: log.actor?.email ?? null,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt.toISOString(),
  };
}

export async function getAuditLogs(
  officeId: string,
  filters: AuditLogFilters = {}
): Promise<PaginatedAuditLogs> {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = AUDIT_PER_PAGE;

  const where: Prisma.AuditLogWhereInput = {
    officeId,
    ...(filters.action && { action: filters.action }),
    ...(filters.entityType && { entityType: filters.entityType }),
    ...(filters.actorId && { actorId: filters.actorId }),
    ...(filters.q && {
      OR: [
        { description: { contains: filters.q, mode: "insensitive" } },
        { actor: { name: { contains: filters.q, mode: "insensitive" } } },
        { actor: { email: { contains: filters.q, mode: "insensitive" } } },
      ],
    }),
  };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        actor: { select: { name: true, email: true } },
      },
    }),
  ]);

  return {
    items: logs.map(mapAuditLog),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getAuditStats(officeId: string): Promise<AuditLogStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [total, today, logins, uploads, deletions, updates] = await Promise.all([
    prisma.auditLog.count({ where: { officeId } }),
    prisma.auditLog.count({
      where: { officeId, createdAt: { gte: startOfDay } },
    }),
    prisma.auditLog.count({
      where: { officeId, action: { in: ["LOGIN", "LOGIN_FAILED", "LOGOUT"] } },
    }),
    prisma.auditLog.count({ where: { officeId, action: "UPLOAD" } }),
    prisma.auditLog.count({ where: { officeId, action: "DELETE" } }),
    prisma.auditLog.count({ where: { officeId, action: "UPDATE" } }),
  ]);

  return { total, today, logins, uploads, deletions, updates };
}

export async function getAuditActors(officeId: string) {
  const actors = await prisma.auditLog.findMany({
    where: { officeId, actorId: { not: null } },
    distinct: ["actorId"],
    select: {
      actor: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return actors
    .map((item) => item.actor)
    .filter((actor): actor is NonNullable<typeof actor> => actor !== null);
}
