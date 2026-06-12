import type { UserRole } from "@prisma/client";

export type { UserRole };

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  officeId: string;
  avatarUrl: string | null;
  isActive: boolean;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}
