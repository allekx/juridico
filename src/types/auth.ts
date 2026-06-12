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

/** Compatível com useActionState quando actions retornam tipos diferentes de data */
export type ServerFormAction = (
  state: ActionResult | null,
  payload: FormData
) => Promise<ActionResult | null>;

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}
