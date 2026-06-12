import type { AuditAction } from "@prisma/client";

export interface AuditLogItem {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  description: string;
  actorId: string | null;
  actorName: string;
  actorEmail: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: AuditAction;
  entityType?: string;
  actorId?: string;
  q?: string;
  page?: number;
}

export interface AuditLogStats {
  total: number;
  today: number;
  logins: number;
  uploads: number;
  deletions: number;
  updates: number;
}

export interface PaginatedAuditLogs {
  items: AuditLogItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
