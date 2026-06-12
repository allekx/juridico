import type { UserRole } from "@prisma/client";

type Permission =
  | "dashboard:read"
  | "admin:read"
  | "admin:write"
  | "crm:read"
  | "crm:write"
  | "financeiro:read"
  | "financeiro:write"
  | "documentos:read"
  | "documentos:write"
  | "agenda:read"
  | "agenda:write"
  | "tarefas:read"
  | "tarefas:write"
  | "blog:read"
  | "blog:write"
  | "blog:publish"
  | "relatorios:read"
  | "portal:read";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "dashboard:read",
    "admin:read",
    "admin:write",
    "crm:read",
    "crm:write",
    "financeiro:read",
    "financeiro:write",
    "documentos:read",
    "documentos:write",
    "agenda:read",
    "agenda:write",
    "tarefas:read",
    "tarefas:write",
    "blog:read",
    "blog:write",
    "blog:publish",
    "relatorios:read",
  ],
  LAWYER: [
    "dashboard:read",
    "crm:read",
    "crm:write",
    "financeiro:read",
    "relatorios:read",
    "documentos:read",
    "documentos:write",
    "agenda:read",
    "agenda:write",
    "tarefas:read",
    "tarefas:write",
  ],
  ASSISTANT: [
    "dashboard:read",
    "crm:read",
    "crm:write",
    "documentos:read",
    "documentos:write",
    "agenda:read",
    "agenda:write",
    "tarefas:read",
    "tarefas:write",
  ],
  FINANCIAL: [
    "dashboard:read",
    "financeiro:read",
    "financeiro:write",
    "crm:read",
    "relatorios:read",
  ],
  CLIENT: ["portal:read"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
