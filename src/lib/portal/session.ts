import { redirect } from "next/navigation";
import { CLIENT_ROLES } from "@/constants/roles";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import type { AuthUser } from "@/types/auth";
import type { Client } from "@prisma/client";

export interface PortalContext {
  user: AuthUser;
  client: Client;
}

export async function requirePortalClient(): Promise<PortalContext> {
  const user = await requireRole(CLIENT_ROLES);

  const client = await prisma.client.findFirst({
    where: { userId: user.id, deletedAt: null, isActive: true },
  });

  if (!client) {
    redirect("/portal/acesso?error=sem_cadastro");
  }

  return { user, client };
}
