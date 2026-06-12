import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { DEFAULT_REDIRECT } from "@/constants/roles";
import { hasPermission } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import type { AuthUser } from "@/types/auth";

type Permission = Parameters<typeof hasPermission>[1];

export async function withAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function withRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await withAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect(DEFAULT_REDIRECT[user.role]);
  }

  return user;
}

export async function withPermission(permission: Permission): Promise<AuthUser> {
  const user = await withAuth();

  if (!hasPermission(user.role, permission)) {
    redirect(DEFAULT_REDIRECT[user.role]);
  }

  return user;
}
