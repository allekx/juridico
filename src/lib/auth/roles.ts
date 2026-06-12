import type { UserRole } from "@prisma/client";
import type { User } from "@supabase/supabase-js";

const VALID_ROLES: UserRole[] = [
  "ADMIN",
  "LAWYER",
  "ASSISTANT",
  "FINANCIAL",
  "CLIENT",
];

export function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

export function extractRoleFromUser(user: User): UserRole | null {
  const role = user.app_metadata?.role as string | undefined;

  if (role && isValidRole(role)) {
    return role;
  }

  return null;
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

export function isInternal(role: UserRole): boolean {
  return role !== "CLIENT";
}

export function isClient(role: UserRole): boolean {
  return role === "CLIENT";
}
