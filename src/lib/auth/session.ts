import { cache } from "react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { DEFAULT_REDIRECT } from "@/constants/roles";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { extractRoleFromUser } from "@/lib/auth/roles";
import type { AuthUser, SessionUser } from "@/types/auth";

async function readAuthUserFromSession() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.user ?? null;
  } catch (error) {
    console.error("[auth] readAuthUserFromSession:", error);
    return null;
  }
}

const getCachedDbUser = (authUserId: string, email?: string | null) =>
  unstable_cache(
    async () => {
      try {
        return await prisma.user.findFirst({
          where: {
            deletedAt: null,
            isActive: true,
            OR: [
              { id: authUserId },
              ...(email ? [{ email }] : []),
            ],
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
      } catch (error) {
        console.error("[auth] getCachedDbUser:", error);
        return null;
      }
    },
    ["auth-db-user", authUserId, email ?? ""],
    { revalidate: 120 }
  )();

export async function getSession() {
  return readAuthUserFromSession();
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

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const authUser = await readAuthUserFromSession();
  if (!authUser?.id) return null;

  return getCachedDbUser(authUser.id, authUser.email);
});

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
    // Banco indisponível | mantém na tela de login
  }
}
