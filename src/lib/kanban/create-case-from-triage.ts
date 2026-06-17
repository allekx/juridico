import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { ensureKanbanStatuses } from "@/lib/kanban/queries";

const LEAD_MARKER_PREFIX = "[[lead:";
const LEAD_MARKER_SUFFIX = "]]";

export function buildLeadCaseMarker(leadId: string) {
  return `${LEAD_MARKER_PREFIX}${leadId}${LEAD_MARKER_SUFFIX}`;
}

export async function findLegalCaseForLead(
  officeId: string,
  leadId: string
) {
  return prisma.case.findFirst({
    where: {
      officeId,
      deletedAt: null,
      description: { contains: buildLeadCaseMarker(leadId) },
    },
    select: { id: true, title: true },
  });
}

async function resolveLawyerUserId(
  officeId: string,
  preferredUserId?: string | null
): Promise<string> {
  if (preferredUserId) {
    const user = await prisma.user.findFirst({
      where: {
        id: preferredUserId,
        officeId,
        deletedAt: null,
        isActive: true,
      },
      select: { id: true },
    });
    if (user) return user.id;
  }

  const lawyer = await prisma.lawyer.findFirst({
    where: { officeId, deletedAt: null },
    select: { userId: true },
    orderBy: { displayOrder: "asc" },
  });
  if (lawyer) return lawyer.userId;

  const fallback = await prisma.user.findFirst({
    where: {
      officeId,
      deletedAt: null,
      isActive: true,
      role: { in: ["ADMIN", "LAWYER"] },
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!fallback) {
    throw new Error("Nenhum advogado disponível no escritório");
  }

  return fallback.id;
}

async function findOrCreateClient(
  tx: Prisma.TransactionClient,
  data: {
    officeId: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    cpfCnpj?: string | null;
    city?: string | null;
    state?: string | null;
    assignedLawyerId?: string | null;
  }
) {
  if (data.cpfCnpj) {
    const byCpf = await tx.client.findFirst({
      where: {
        officeId: data.officeId,
        cpfCnpj: data.cpfCnpj,
        deletedAt: null,
      },
    });
    if (byCpf) return byCpf;
  }

  if (data.email) {
    const byEmail = await tx.client.findFirst({
      where: {
        officeId: data.officeId,
        email: data.email,
        deletedAt: null,
      },
    });
    if (byEmail) return byEmail;
  }

  return tx.client.create({
    data: {
      officeId: data.officeId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      cpfCnpj: data.cpfCnpj || null,
      city: data.city || null,
      state: data.state || null,
      assignedLawyerId: data.assignedLawyerId || null,
      type: "INDIVIDUAL",
      notes: "Cliente criado automaticamente a partir da triagem.",
    },
  });
}

export interface CreateLegalCaseFromTriageInput {
  officeId: string;
  leadId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  cpfCnpj?: string | null;
  city?: string | null;
  state?: string | null;
  areaTitle: string;
  summary?: string | null;
  lawyerUserId?: string | null;
  lawyerRecordId?: string | null;
}

export async function createLegalCaseFromTriage(
  input: CreateLegalCaseFromTriageInput
): Promise<{ caseId: string; clientId: string; created: boolean }> {
  const existing = await findLegalCaseForLead(input.officeId, input.leadId);
  if (existing) {
    const existingCase = await prisma.case.findUnique({
      where: { id: existing.id },
      select: { clientId: true },
    });
    return {
      caseId: existing.id,
      clientId: existingCase!.clientId,
      created: false,
    };
  }

  await ensureKanbanStatuses(input.officeId);

  const triagemStatus = await prisma.caseStatus.findFirst({
    where: {
      officeId: input.officeId,
      slug: "triagem",
      isActive: true,
    },
  });

  if (!triagemStatus) {
    throw new Error("Status de triagem não configurado no Kanban Jurídico");
  }

  const lawyerUserId = await resolveLawyerUserId(
    input.officeId,
    input.lawyerUserId
  );

  const marker = buildLeadCaseMarker(input.leadId);
  const description = [input.summary?.trim(), marker].filter(Boolean).join("\n\n");

  const result = await prisma.$transaction(async (tx) => {
    const client = await findOrCreateClient(tx, {
      officeId: input.officeId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      cpfCnpj: input.cpfCnpj,
      city: input.city,
      state: input.state,
      assignedLawyerId: input.lawyerRecordId || null,
    });

    const caseRecord = await tx.case.create({
      data: {
        officeId: input.officeId,
        clientId: client.id,
        lawyerId: lawyerUserId,
        statusId: triagemStatus.id,
        caseType: input.areaTitle,
        title: `Triagem — ${input.name}`,
        description,
        priority: "MEDIUM",
      },
    });

    await tx.caseHistory.create({
      data: {
        caseId: caseRecord.id,
        statusId: triagemStatus.id,
        changedById: lawyerUserId,
        notes: "Caso aberto automaticamente a partir da triagem do site.",
      },
    });

    return { caseId: caseRecord.id, clientId: client.id };
  });

  return { ...result, created: true };
}
