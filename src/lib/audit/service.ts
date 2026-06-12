import type { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { getPublicOfficeId } from "@/lib/blog/office";
import { getRequestMetadata } from "@/lib/lgpd/request-meta";
import type { AuthUser } from "@/types/auth";

export interface AuditEventInput {
  officeId: string;
  actorId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

async function resolveRequestMeta(
  ipAddress?: string,
  userAgent?: string
): Promise<{ ipAddress?: string; userAgent?: string }> {
  if (ipAddress || userAgent) {
    return { ipAddress, userAgent };
  }

  try {
    return await getRequestMetadata();
  } catch {
    return {};
  }
}

export async function logAuditEvent(input: AuditEventInput): Promise<void> {
  try {
    const meta = await resolveRequestMeta(input.ipAddress, input.userAgent);

    await prisma.auditLog.create({
      data: {
        officeId: input.officeId,
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        description: input.description.slice(0, 500),
        metadata: input.metadata ?? undefined,
        ipAddress: meta.ipAddress ?? null,
        userAgent: meta.userAgent?.slice(0, 500) ?? null,
      },
    });
  } catch (error) {
    console.error("[audit] Falha ao registrar evento:", error);
  }
}

export async function logLogin(
  user: Pick<AuthUser, "id" | "officeId" | "name" | "email" | "role">,
  context: "dashboard" | "portal" = "dashboard"
): Promise<void> {
  await logAuditEvent({
    officeId: user.officeId,
    actorId: user.id,
    action: "LOGIN",
    entityType: "user",
    entityId: user.id,
    description: `Login realizado: ${user.name}`,
    metadata: { email: user.email, role: user.role, context },
  });
}

export async function logLoginFailed(
  identifier: string,
  reason: string,
  context: "dashboard" | "portal" = "dashboard"
): Promise<void> {
  try {
    const officeId = await getPublicOfficeId();

    let actorId: string | null = null;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { email: { contains: identifier } }],
        deletedAt: null,
      },
      select: { id: true, officeId: true },
    });

    if (existingUser) {
      actorId = existingUser.id;
    }

    await logAuditEvent({
      officeId: existingUser?.officeId ?? officeId,
      actorId,
      action: "LOGIN_FAILED",
      entityType: "session",
      description: `Tentativa de login falhou (${context})`,
      metadata: { identifier, reason, context },
    });
  } catch (error) {
    console.error("[audit] Falha ao registrar login inválido:", error);
  }
}

export async function logLogout(
  user: Pick<AuthUser, "id" | "officeId" | "name">
): Promise<void> {
  await logAuditEvent({
    officeId: user.officeId,
    actorId: user.id,
    action: "LOGOUT",
    entityType: "user",
    entityId: user.id,
    description: `Logout realizado: ${user.name}`,
  });
}

export async function logCreate(
  user: Pick<AuthUser, "id" | "officeId">,
  entityType: string,
  entityId: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    officeId: user.officeId,
    actorId: user.id,
    action: "CREATE",
    entityType,
    entityId,
    description,
    metadata,
  });
}

export async function logUpdate(
  user: Pick<AuthUser, "id" | "officeId">,
  entityType: string,
  entityId: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    officeId: user.officeId,
    actorId: user.id,
    action: "UPDATE",
    entityType,
    entityId,
    description,
    metadata,
  });
}

export async function logDelete(
  user: Pick<AuthUser, "id" | "officeId">,
  entityType: string,
  entityId: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    officeId: user.officeId,
    actorId: user.id,
    action: "DELETE",
    entityType,
    entityId,
    description,
    metadata,
  });
}

export async function logUpload(
  user: Pick<AuthUser, "id" | "officeId">,
  entityType: string,
  entityId: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    officeId: user.officeId,
    actorId: user.id,
    action: "UPLOAD",
    entityType,
    entityId,
    description,
    metadata,
  });
}
