"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { withPermission } from "@/lib/auth/guards";
import {
  createLeadSchema,
  updateLeadStatusSchema,
} from "@/schemas/crm";
import { logCreate, logUpdate } from "@/lib/audit/service";
import {
  notifyLeadConverted,
  notifyNewLead,
} from "@/lib/notifications/service";
import {
  createLegalCaseFromTriage,
} from "@/lib/kanban/create-case-from-triage";
import type { ActionResult } from "@/types/auth";

function revalidateCrm() {
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/crm/leads");
  revalidatePath("/dashboard/crm/kanban");
  revalidatePath("/dashboard/crm/historico");
}

export async function sendLeadToLegalKanbanAction(
  leadId: string
): Promise<ActionResult<{ caseId: string; created: boolean }>> {
  const user = await withPermission("crm:write");

  try {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, officeId: user.officeId, deletedAt: null },
      include: {
        triageSession: {
          include: {
            lawyer: true,
          },
        },
      },
    });

    if (!lead) return { success: false, error: "Lead não encontrado" };

    const result = await createLegalCaseFromTriage({
      officeId: user.officeId,
      leadId: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      cpfCnpj: lead.triageSession?.cpfCnpj ?? null,
      city: lead.triageSession?.city ?? null,
      state: lead.triageSession?.state ?? null,
      areaTitle: lead.interestArea ?? "Triagem",
      summary: lead.notes,
      lawyerUserId: lead.assignedToId,
      lawyerRecordId: lead.triageSession?.lawyerId ?? null,
    });

    if (result.created) {
      await logCreate(
        user,
        "case",
        result.caseId,
        `Caso criado no Kanban Jurídico a partir do lead: ${lead.name}`,
        { leadId: lead.id }
      );
    }

    revalidateCrm();
    revalidatePath(`/dashboard/crm/leads/${leadId}`);
    revalidatePath("/dashboard/kanban");

    return { success: true, data: result };
  } catch {
    return { success: false, error: "Erro ao enviar lead ao Kanban Jurídico" };
  }
}

export async function sendLeadToKanbanAction(
  leadId: string
): Promise<ActionResult<{ status: string }>> {
  const user = await withPermission("crm:write");

  try {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, officeId: user.officeId, deletedAt: null },
    });

    if (!lead) return { success: false, error: "Lead não encontrado" };

    const nextStatus = lead.status === "NEW" ? "CONTACTED" : lead.status;

    if (nextStatus !== lead.status) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: nextStatus },
      });

      await logUpdate(
        user,
        "lead",
        lead.id,
        `Lead enviado ao funil: ${lead.name}`,
        { from: lead.status, to: nextStatus }
      );
    }

    revalidateCrm();
    revalidatePath(`/dashboard/crm/leads/${leadId}`);

    return { success: true, data: { status: nextStatus } };
  } catch {
    return { success: false, error: "Erro ao enviar lead ao funil" };
  }
}

export async function updateLeadStatusAction(
  leadId: string,
  status: string
): Promise<ActionResult> {
  const user = await withPermission("crm:write");
  const parsed = updateLeadStatusSchema.safeParse({ leadId, status });
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" };
  }

  try {
    const lead = await prisma.lead.findFirst({
      where: {
        id: parsed.data.leadId,
        officeId: user.officeId,
        deletedAt: null,
      },
    });

    if (!lead) return { success: false, error: "Lead não encontrado" };

    const updated = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.status === "CONVERTED" && {
          convertedAt: new Date(),
        }),
      },
      include: { convertedClient: { select: { name: true } } },
    });

    await logUpdate(
      user,
      "lead",
      lead.id,
      `Status do lead alterado: ${lead.name}`,
      { from: lead.status, to: parsed.data.status }
    );

    if (parsed.data.status === "CONVERTED" && lead.status !== "CONVERTED") {
      await notifyLeadConverted(
        user.officeId,
        {
          id: updated.id,
          name: updated.name,
          convertedClientId: updated.convertedClientId,
        },
        updated.convertedClient?.name
      );
    }

    revalidateCrm();
    revalidatePath(`/dashboard/crm/leads/${lead.id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar lead" };
  }
}

export async function createLeadAction(
  data: {
    name: string;
    email?: string;
    phone: string;
    source: string;
    interestArea?: string;
    notes?: string;
    assignedToId?: string;
  }
): Promise<ActionResult<{ id: string }>> {
  const user = await withPermission("crm:write");
  const parsed = createLeadSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        officeId: user.officeId,
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone,
        source: parsed.data.source,
        interestArea: parsed.data.interestArea || null,
        notes: parsed.data.notes || null,
        assignedToId: parsed.data.assignedToId || null,
        status: "NEW",
      },
    });

    await notifyNewLead(user.officeId, {
      id: lead.id,
      name: lead.name,
      source: lead.source,
      interestArea: lead.interestArea,
      assignedToId: lead.assignedToId,
    });

    await logCreate(user, "lead", lead.id, `Lead criado: ${lead.name}`, {
      source: lead.source,
    });

    revalidateCrm();
    return { success: true, data: { id: lead.id } };
  } catch {
    return { success: false, error: "Erro ao criar lead" };
  }
}
