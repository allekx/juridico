"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { withPermission } from "@/lib/auth/guards";
import { updateCaseStatusSchema } from "@/schemas/crm";
import { logUpdate } from "@/lib/audit/service";
import { notifyStatusChanged } from "@/lib/notifications/service";
import type { ActionResult } from "@/types/auth";

function revalidateKanban() {
  revalidatePath("/dashboard/kanban");
  revalidatePath("/dashboard/crm/kanban");
  revalidatePath("/dashboard/crm/casos");
  revalidatePath("/dashboard/crm/historico");
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  revalidatePath("/portal/processos");
  revalidatePath("/portal/timeline");
}

export async function moveKanbanCaseAction(
  caseId: string,
  statusId: string
): Promise<ActionResult> {
  const user = await withPermission("crm:write");
  const parsed = updateCaseStatusSchema.safeParse({ caseId, statusId });
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
        where: { id: parsed.data.statusId, officeId: user.officeId, isActive: true },
      }),
    ]);

    if (!caseRecord) return { success: false, error: "Caso não encontrado" };
    if (!status) return { success: false, error: "Coluna inválida" };
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
          notes: `Movido para ${status.name} via Kanban`,
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

    await logUpdate(
      user,
      "case",
      caseRecord.id,
      `Processo movido no Kanban: ${caseRecord.title}`,
      { statusName: status.name }
    );

    revalidateKanban();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao mover card" };
  }
}
