import { hasPermission } from "@/lib/auth/permissions";
import type { UserRole } from "@prisma/client";
import type { ReportType } from "@/types/reports";

export function canAccessReports(role: UserRole): boolean {
  return hasPermission(role, "relatorios:read");
}

export function canAccessReportType(role: UserRole, type: ReportType): boolean {
  if (!canAccessReports(role)) return false;

  switch (type) {
    case "financeiro":
      return hasPermission(role, "financeiro:read");
    case "clientes":
    case "casos":
    case "advogados":
    case "leads":
      return hasPermission(role, "crm:read");
    default:
      return false;
  }
}

export function getVisibleReportTypes(role: UserRole): ReportType[] {
  const types: ReportType[] = [];
  if (canAccessReportType(role, "clientes")) types.push("clientes");
  if (canAccessReportType(role, "casos")) types.push("casos");
  if (canAccessReportType(role, "advogados")) types.push("advogados");
  if (canAccessReportType(role, "financeiro")) types.push("financeiro");
  if (canAccessReportType(role, "leads")) types.push("leads");
  return types;
}
