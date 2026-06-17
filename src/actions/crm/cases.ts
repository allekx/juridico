"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { withPermission } from "@/lib/auth/guards";
import { createCaseSchema, updateCaseStatusSchema } from "@/schemas/crm";
import { createLegalCase } from "@/lib/kanban/create-case";
import { logCreate } from "@/lib/audit/service";
import { notifyStatusChanged } from "@/lib/notifications/service";
import type { ActionResult } from "@/types/auth";

function revalidateCrm() {
  revalidatePath("/dashboard/kanban");
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/crm/casos");
  revalidatePath("/dashboard/crm/kanban");
  revalidatePath("/dashboard/crm/historico");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  revalidatePath("/portal/processos");
  revalidatePath("/portal/timeline");
}

export async function createCaseAction(data: {
  clientName: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  title: string;
  caseType: string;
  description?: string;
  lawyerId: string;
  priority?: string;
}): Promise<ActionResult<{ caseId: string; clientId: string }>> {
  const user = await withPermission("crm:write");
  const parsed = createCaseSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const result = await createLegalCase({
      officeId: user.officeId,
      clientName: parsed.data.clientName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      cpfCnpj: parsed.data.cpfCnpj || null,
      title: parsed.data.title,
      caseType: parsed.data.caseType,
      description: parsed.data.description || null,
      lawyerUserId: parsed.data.lawyerId,
      priority: parsed.data.priority,
    });

    if (result.clientCreated) {
      await logCreate(
        user,
        "client",
        result.clientId,
        `Cliente criado ao abrir caso: ${parsed.data.clientName}`,
        { caseId: result.caseId }
      );
    }

    await logCreate(
      user,
      "case",
      result.caseId,
      `Caso criado: ${parsed.data.title}`,
      { clientId: result.clientId }
    );

    revalidateCrm();
    return {
      success: true,
      data: { caseId: result.caseId, clientId: result.clientId },
    };
  } catch {
    return { success: false, error: "Erro ao criar caso" };
  }
}

export async function updateCaseStatusAction(
  caseId: string,
  statusId: string,
  notes?: string
): Promise<ActionResult> {
  const user = await withPermission("crm:write");
  const parsed = updateCaseStatusSchema.safeParse({ caseId, statusId, notes });
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" };
  }

  try {
    const [caseRecord, status] = await Promise.all([
      prisma.case.findFirst({
        where: {
          id: parsed.data.caseId,
          officeId: user.officeId,
          deletedAt: null,
        },
        include: { client: { select: { name: true } } },
      }),
      prisma.caseStatus.findFirst({
        where: { id: parsed.data.statusId, officeId: user.officeId },
      }),
    ]);

    if (!caseRecord) return { success: false, error: "Caso não encontrado" };
    if (!status) return { success: false, error: "Status inválido" };
    if (caseRecord.statusId === status.id) return { success: true };

    await prisma.$transaction([
      prisma.case.update({
        where: { id: caseRecord.id },
        data: {
          statusId: status.id,
          closedAt: status.isFinal ? new Date() : null,
        },
      }),
      prisma.caseHistory.create({
        data: {
          caseId: caseRecord.id,
          statusId: status.id,
          changedById: user.id,
          notes: parsed.data.notes || null,
        },
      }),
    ]);

    await notifyStatusChanged(
      user.officeId,
      {
        caseId: caseRecord.id,
        caseTitle: caseRecord.title,
        clientName: caseRecord.client.name,
        statusName: status.name,
        lawyerId: caseRecord.lawyerId,
        changedByName: user.name,
      },
      user.id
    );

    revalidateCrm();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar caso" };
  }
}
