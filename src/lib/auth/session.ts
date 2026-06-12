import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { DEFAULT_REDIRECT } from "@/constants/roles";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { extractRoleFromUser } from "@/lib/auth/roles";
import type { AuthUser, SessionUser } from "@/types/auth";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const user = await getSession();
  if (!user) return null;

  const role = extractRoleFromUser(user);
  if (!role) return null;

  return {
    id: user.id,
    email: user.email!,
    role,
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  try {
    const dbUser = await prisma.user.findFirst({
      where: {
        id: sessionUser.id,
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        officeId: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    if (!dbUser) return null;

    return dbUser;
  } catch (error) {
    console.error("[auth] getCurrentUser:", error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect(DEFAULT_REDIRECT[user.role]);
  }

  return user;
}

export async function redirectIfAuthenticated() {
  try {
    const user = await getCurrentUser();
    if (user) {
      redirect(DEFAULT_REDIRECT[user.role]);
    }
  } catch {
    // Banco indisponível — mantém na tela de login
  }
}
