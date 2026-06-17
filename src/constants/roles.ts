import type { UserRole } from "@prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  LAWYER: "Advogado",
  ASSISTANT: "Assistente",
  FINANCIAL: "Financeiro",
  CLIENT: "Cliente",
};

export const INTERNAL_ROLES: UserRole[] = [
  "ADMIN",
  "LAWYER",
  "ASSISTANT",
  "FINANCIAL",
];

export const DASHBOARD_ROLES: UserRole[] = INTERNAL_ROLES;

export const ADMIN_ROLES: UserRole[] = ["ADMIN"];

export const FINANCIAL_ROLES: UserRole[] = ["ADMIN", "FINANCIAL"];

export const CLIENT_ROLES: UserRole[] = ["CLIENT"];

export const DEFAULT_REDIRECT: Record<UserRole, string> = {
  ADMIN: "/dashboard",
  LAWYER: "/dashboard",
  ASSISTANT: "/dashboard",
  FINANCIAL: "/dashboard/financeiro",
  CLIENT: "/consulta",
};
