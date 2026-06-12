"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { withRole } from "@/lib/auth/guards";
import { getPublicOfficeId } from "@/lib/blog/office";
import { recordConsentBundle } from "@/lib/lgpd/consent";
import { getRequestMetadata } from "@/lib/lgpd/request-meta";
import {
  deletionRequestSchema,
  updateDeletionStatusSchema,
} from "@/schemas/lgpd";
import { ADMIN_ROLES } from "@/constants/roles";
import type { ActionResult } from "@/types/auth";

function revalidateLgpd() {
  revalidatePath("/dashboard/admin/lgpd");
  revalidatePath("/lgpd/exclusao-dados");
}

export async function submitDeletionRequestAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = deletionRequestSchema.safeParse({
    requesterName: formData.get("requesterName"),
    requesterEmail: formData.get("requesterEmail"),
    requesterPhone: formData.get("requesterPhone") || undefined,
    cpfCnpj: formData.get("cpfCnpj") || undefined,
    reason: formData.get("reason"),
    confirm: formData.get("confirm") === "on" ? true : formData.get("confirm"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    const officeId = await getPublicOfficeId();
    const requestMeta = await getRequestMetadata();
    const data = parsed.data;

    const request = await prisma.dataDeletionRequest.create({
      data: {
        officeId,
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail,
        requesterPhone: data.requesterPhone?.trim() || null,
        cpfCnpj: data.cpfCnpj?.trim() || null,
        reason: data.reason,
        ipAddress: requestMeta.ipAddress ?? null,
      },
    });

    revalidateLgpd();
    return { success: true, data: { id: request.id } };
  } catch {
    return { success: false, error: "Erro ao registrar solicitação" };
  }
}

export async function updateDeletionStatusAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await withRole(ADMIN_ROLES);

  const parsed = updateDeletionStatusSchema.safeParse({
    requestId: formData.get("requestId"),
    status: formData.get("status"),
    adminNotes: formData.get("adminNotes") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const { requestId, status, adminNotes } = parsed.data;
  const now = new Date();

  try {
    const existing = await prisma.dataDeletionRequest.findFirst({
      where: { id: requestId, officeId: user.officeId },
    });

    if (!existing) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    await prisma.dataDeletionRequest.update({
      where: { id: requestId },
      data: {
        status,
        adminNotes: adminNotes?.trim() || existing.adminNotes,
        reviewedById: user.id,
        reviewedAt: now,
        completedAt: status === "COMPLETED" ? now : existing.completedAt,
      },
    });

    revalidateLgpd();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar solicitação" };
  }
}

export async function recordCookieConsentAction(): Promise<ActionResult> {
  try {
    const officeId = await getPublicOfficeId();
    const requestMeta = await getRequestMetadata();

    await recordConsentBundle({
      officeId,
      subjectType: "VISITOR",
      source: "cookie_banner",
      request: requestMeta,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao registrar consentimento" };
  }
}
