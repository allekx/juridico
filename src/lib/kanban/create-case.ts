import type { CasePriority, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { ensureKanbanStatuses } from "@/lib/kanban/queries";
import type { KanbanColumnSlug } from "@/constants/kanban";

const LEAD_MARKER_PREFIX = "[[lead:";
const LEAD_MARKER_SUFFIX = "]]";

export function buildLeadCaseMarker(leadId: string) {
  return `${LEAD_MARKER_PREFIX}${leadId}${LEAD_MARKER_SUFFIX}`;
}

export async function findLegalCaseForLead(officeId: string, leadId: string) {
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
    clientNotes?: string;
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
    if (byCpf) return { client: byCpf, created: false };
  }

  if (data.email) {
    const byEmail = await tx.client.findFirst({
      where: {
        officeId: data.officeId,
        email: data.email,
        deletedAt: null,
      },
    });
    if (byEmail) return { client: byEmail, created: false };
  }

  const client = await tx.client.create({
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
      notes: data.clientNotes ?? "Cliente criado ao abrir novo caso.",
    },
  });

  return { client, created: true };
}

interface CreateLegalCaseCoreInput {
  officeId: string;
  clientName: string;
  email?: string | null;
  phone?: string | null;
  cpfCnpj?: string | null;
  city?: string | null;
  state?: string | null;
  title: string;
  caseType: string;
  description?: string | null;
  lawyerUserId?: string | null;
  lawyerRecordId?: string | null;
  priority?: CasePriority;
  initialStatusSlug?: KanbanColumnSlug;
  historyNote: string;
  clientNotes?: string;
  leadId?: string;
}

async function createLegalCaseCore(
  input: CreateLegalCaseCoreInput
): Promise<{
  caseId: string;
  clientId: string;
  clientCreated: boolean;
  created: boolean;
}> {
  if (input.leadId) {
    const existing = await findLegalCaseForLead(input.officeId, input.leadId);
    if (existing) {
      const existingCase = await prisma.case.findUnique({
        where: { id: existing.id },
        select: { clientId: true },
      });
      return {
        caseId: existing.id,
        clientId: existingCase!.clientId,
        clientCreated: false,
        created: false,
      };
    }
  }

  await ensureKanbanStatuses(input.officeId);

  const statusSlug = input.initialStatusSlug ?? "novo";
  const status = await prisma.caseStatus.findFirst({
    where: {
      officeId: input.officeId,
      slug: statusSlug,
      isActive: true,
    },
  });

  if (!status) {
    throw new Error(`Status "${statusSlug}" não configurado no Kanban Jurídico`);
  }

  const lawyerUserId = await resolveLawyerUserId(
    input.officeId,
    input.lawyerUserId
  );

  const marker = input.leadId ? buildLeadCaseMarker(input.leadId) : null;
  const description = [input.description?.trim(), marker]
    .filter(Boolean)
    .join("\n\n");

  const result = await prisma.$transaction(async (tx) => {
    const { client, created: clientCreated } = await findOrCreateClient(tx, {
      officeId: input.officeId,
      name: input.clientName,
      email: input.email,
      phone: input.phone,
      cpfCnpj: input.cpfCnpj,
      city: input.city,
      state: input.state,
      assignedLawyerId: input.lawyerRecordId || null,
      clientNotes: input.clientNotes,
    });

    const caseRecord = await tx.case.create({
      data: {
        officeId: input.officeId,
        clientId: client.id,
        lawyerId: lawyerUserId,
        statusId: status.id,
        caseType: input.caseType,
        title: input.title,
        description: description || null,
        priority: input.priority ?? "MEDIUM",
      },
    });

    await tx.caseHistory.create({
      data: {
        caseId: caseRecord.id,
        statusId: status.id,
        changedById: lawyerUserId,
        notes: input.historyNote,
      },
    });

    return {
      caseId: caseRecord.id,
      clientId: client.id,
      clientCreated,
    };
  });

  return { ...result, created: true };
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
) {
  return createLegalCaseCore({
    officeId: input.officeId,
    leadId: input.leadId,
    clientName: input.name,
    email: input.email,
    phone: input.phone,
    cpfCnpj: input.cpfCnpj,
    city: input.city,
    state: input.state,
    title: `Triagem | ${input.name}`,
    caseType: input.areaTitle,
    description: input.summary,
    lawyerUserId: input.lawyerUserId,
    lawyerRecordId: input.lawyerRecordId,
    initialStatusSlug: "triagem",
    historyNote: "Caso aberto a partir do lead da triagem.",
    clientNotes: "Cliente criado ao converter lead da triagem em caso.",
  });
}

export interface CreateLegalCaseInput {
  officeId: string;
  clientName: string;
  email?: string | null;
  phone?: string | null;
  cpfCnpj?: string | null;
  title: string;
  caseType: string;
  description?: string | null;
  lawyerUserId: string;
  priority?: CasePriority;
}

export async function createLegalCase(input: CreateLegalCaseInput) {
  return createLegalCaseCore({
    officeId: input.officeId,
    clientName: input.clientName,
    email: input.email,
    phone: input.phone,
    cpfCnpj: input.cpfCnpj,
    title: input.title,
    caseType: input.caseType,
    description: input.description,
    lawyerUserId: input.lawyerUserId,
    priority: input.priority,
    initialStatusSlug: "novo",
    historyNote: "Caso aberto manualmente no Kanban Jurídico.",
    clientNotes: "Cliente criado ao abrir novo caso.",
  });
}
