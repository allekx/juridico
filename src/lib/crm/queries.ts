import { prisma } from "@/lib/prisma/client";
import type {
  CasePriority,
  LeadSource,
  LeadStatus,
  Prisma,
} from "@prisma/client";
import type {
  CrmCaseRow,
  CrmCaseStatusOption,
  CrmClientRow,
  CrmDashboardStats,
  CrmHistoryItem,
  CrmKanbanCaseCard,
  CrmKanbanLeadCard,
  CrmLeadRow,
  CrmLeadDetail,
  CrmListFilters,
  CrmSearchResult,
  CrmTeamMember,
} from "@/types/crm";
import { LEAD_KANBAN_STATUSES } from "@/constants/crm";
import { findLegalCaseForLead } from "@/lib/kanban/create-case-from-triage";

function dateRange(
  dateFrom?: string,
  dateTo?: string
): Prisma.DateTimeFilter | undefined {
  if (!dateFrom && !dateTo) return undefined;
  const filter: Prisma.DateTimeFilter = {};
  if (dateFrom) filter.gte = new Date(dateFrom);
  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    filter.lte = end;
  }
  return filter;
}

export async function getCrmTeamMembers(
  officeId: string
): Promise<CrmTeamMember[]> {
  const users = await prisma.user.findMany({
    where: {
      officeId,
      deletedAt: null,
      isActive: true,
      role: { in: ["ADMIN", "LAWYER", "ASSISTANT"] },
    },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
  }));
}

export async function getCaseStatuses(
  officeId: string
): Promise<CrmCaseStatusOption[]> {
  return prisma.caseStatus.findMany({
    where: { officeId, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCrmDashboardStats(
  officeId: string
): Promise<CrmDashboardStats> {
  const [
    totalLeads,
    newLeads,
    totalClients,
    activeClients,
    activeCases,
    urgentCases,
    pendingTasks,
    convertedLeads,
  ] = await Promise.all([
    prisma.lead.count({ where: { officeId, deletedAt: null } }),
    prisma.lead.count({
      where: { officeId, deletedAt: null, status: "NEW" },
    }),
    prisma.client.count({ where: { officeId, deletedAt: null } }),
    prisma.client.count({
      where: { officeId, deletedAt: null, isActive: true },
    }),
    prisma.case.count({
      where: { officeId, deletedAt: null, closedAt: null },
    }),
    prisma.case.count({
      where: {
        officeId,
        deletedAt: null,
        closedAt: null,
        priority: "URGENT",
      },
    }),
    prisma.task.count({
      where: {
        officeId,
        deletedAt: null,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
    }),
    prisma.lead.count({
      where: { officeId, deletedAt: null, status: "CONVERTED" },
    }),
  ]);

  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  return {
    totalLeads,
    newLeads,
    totalClients,
    activeClients,
    activeCases,
    urgentCases,
    pendingTasks,
    conversionRate,
  };
}

export async function getCrmLeads(
  officeId: string,
  filters: CrmListFilters = {}
): Promise<CrmLeadRow[]> {
  const createdAt = dateRange(filters.dateFrom, filters.dateTo);

  const leads = await prisma.lead.findMany({
    where: {
      officeId,
      deletedAt: null,
      ...(filters.status && {
        status: filters.status as LeadStatus,
      }),
      ...(filters.source && {
        source: filters.source as LeadSource,
      }),
      ...(filters.assignedToId && { assignedToId: filters.assignedToId }),
      ...(createdAt && { createdAt }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { email: { contains: filters.q, mode: "insensitive" } },
          { phone: { contains: filters.q, mode: "insensitive" } },
          { interestArea: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    },
    include: { assignedTo: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
    interestArea: lead.interestArea,
    notes: lead.notes,
    assignedToId: lead.assignedToId,
    assignedToName: lead.assignedTo?.name ?? null,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  }));
}

export async function getCrmLeadDetail(
  officeId: string,
  leadId: string
): Promise<CrmLeadDetail | null> {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, officeId, deletedAt: null },
    include: {
      assignedTo: { select: { name: true } },
      triageSession: {
        include: {
          answers: { orderBy: { createdAt: "asc" } },
          documents: { orderBy: { createdAt: "asc" } },
          lawyer: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!lead) return null;

  const triage = lead.triageSession;
  const legalCase = await findLegalCaseForLead(officeId, leadId);

  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
    interestArea: lead.interestArea,
    notes: lead.notes,
    assignedToId: lead.assignedToId,
    assignedToName: lead.assignedTo?.name ?? null,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    legalCaseId: legalCase?.id ?? null,
    legalCaseTitle: legalCase?.title ?? null,
    triage: triage
      ? {
          id: triage.id,
          practiceAreaSlug: triage.practiceAreaSlug,
          completedAt: triage.completedAt,
          cpfCnpj: triage.cpfCnpj,
          city: triage.city,
          state: triage.state,
          additionalNotes: triage.additionalNotes,
          answers: triage.answers.map((a) => ({
            questionLabel: a.questionLabel,
            answer: a.answer,
          })),
          documents: triage.documents.map((d) => ({
            id: d.id,
            fileName: d.fileName,
            mimeType: d.mimeType,
            fileSize: d.fileSize,
            createdAt: d.createdAt,
          })),
          lawyerName: triage.lawyer?.user.name ?? null,
          lawyerOab: triage.lawyer
            ? `OAB/${triage.lawyer.oabState} ${triage.lawyer.oabNumber}`
            : null,
        }
      : null,
  };
}

export async function getCrmClients(
  officeId: string,
  filters: CrmListFilters = {}
): Promise<CrmClientRow[]> {
  const createdAt = dateRange(filters.dateFrom, filters.dateTo);

  const clients = await prisma.client.findMany({
    where: {
      officeId,
      deletedAt: null,
      ...(filters.type && { type: filters.type as "INDIVIDUAL" | "COMPANY" }),
      ...(filters.isActive === "true" && { isActive: true }),
      ...(filters.isActive === "false" && { isActive: false }),
      ...(filters.lawyerId && { assignedLawyerId: filters.lawyerId }),
      ...(createdAt && { createdAt }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { email: { contains: filters.q, mode: "insensitive" } },
          { cpfCnpj: { contains: filters.q, mode: "insensitive" } },
          { phone: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      assignedLawyer: { include: { user: { select: { name: true } } } },
      _count: { select: { cases: true } },
    },
    orderBy: { name: "asc" },
    take: 100,
  });

  return clients.map((client) => ({
    id: client.id,
    name: client.name,
    type: client.type,
    cpfCnpj: client.cpfCnpj,
    email: client.email,
    phone: client.phone,
    city: client.city,
    state: client.state,
    isActive: client.isActive,
    lawyerName: client.assignedLawyer?.user.name ?? null,
    casesCount: client._count.cases,
    createdAt: client.createdAt,
  }));
}

export async function getCrmCases(
  officeId: string,
  filters: CrmListFilters = {}
): Promise<CrmCaseRow[]> {
  const openedAt = dateRange(filters.dateFrom, filters.dateTo);

  const cases = await prisma.case.findMany({
    where: {
      officeId,
      deletedAt: null,
      ...(filters.status && { statusId: filters.status }),
      ...(filters.lawyerId && { lawyerId: filters.lawyerId }),
      ...(filters.priority && {
        priority: filters.priority as CasePriority,
      }),
      ...(openedAt && { openedAt }),
      ...(filters.q && {
        OR: [
          { title: { contains: filters.q, mode: "insensitive" } },
          { caseNumber: { contains: filters.q, mode: "insensitive" } },
          { caseType: { contains: filters.q, mode: "insensitive" } },
          { court: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      client: { select: { name: true } },
      lawyer: { select: { name: true } },
      status: { select: { name: true, color: true, slug: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return cases.map((c) => ({
    id: c.id,
    title: c.title,
    caseNumber: c.caseNumber,
    caseType: c.caseType,
    priority: c.priority,
    clientName: c.client.name,
    lawyerName: c.lawyer.name,
    statusId: c.statusId,
    statusName: c.status.name,
    statusColor: c.status.color,
    statusSlug: c.status.slug,
    openedAt: c.openedAt,
    updatedAt: c.updatedAt,
  }));
}

export async function getCrmKanbanLeads(
  officeId: string
): Promise<Record<LeadStatus, CrmKanbanLeadCard[]>> {
  const leads = await prisma.lead.findMany({
    where: {
      officeId,
      deletedAt: null,
      status: { not: "CONVERTED" },
    },
    include: { assignedTo: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const board = Object.fromEntries(
    LEAD_KANBAN_STATUSES.map((s) => [s, [] as CrmKanbanLeadCard[]])
  ) as Record<LeadStatus, CrmKanbanLeadCard[]>;

  for (const lead of leads) {
    board[lead.status].push({
      id: lead.id,
      name: lead.name,
      interestArea: lead.interestArea,
      source: lead.source,
      assignedToName: lead.assignedTo?.name ?? null,
      createdAt: lead.createdAt,
    });
  }

  return board;
}

export async function getCrmKanbanCases(
  officeId: string
): Promise<{ statuses: CrmCaseStatusOption[]; cards: CrmKanbanCaseCard[] }> {
  const statuses = await getCaseStatuses(officeId);

  const cases = await prisma.case.findMany({
    where: { officeId, deletedAt: null, closedAt: null },
    include: {
      client: { select: { name: true } },
      lawyer: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    statuses,
    cards: cases.map((c) => ({
      id: c.id,
      title: c.title,
      caseNumber: c.caseNumber,
      clientName: c.client.name,
      lawyerName: c.lawyer.name,
      priority: c.priority,
      statusId: c.statusId,
      openedAt: c.openedAt,
    })),
  };
}

export async function getCrmHistory(
  officeId: string,
  limit = 50
): Promise<CrmHistoryItem[]> {
  const [caseHistory, recentLeads, recentCases] = await Promise.all([
    prisma.caseHistory.findMany({
      where: { case: { officeId, deletedAt: null } },
      include: {
        case: { select: { id: true, title: true, caseNumber: true } },
        status: { select: { name: true, color: true } },
        changedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.lead.findMany({
      where: { officeId, deletedAt: null },
      include: { assignedTo: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.case.findMany({
      where: { officeId, deletedAt: null },
      include: {
        lawyer: { select: { name: true } },
        status: { select: { name: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const items: CrmHistoryItem[] = [];

  for (const h of caseHistory) {
    items.push({
      id: `ch-${h.id}`,
      type: "case_status",
      title: `Status alterado — ${h.case.title}`,
      description: h.notes ?? `Novo status: ${h.status.name}`,
      actorName: h.changedBy.name,
      createdAt: h.createdAt,
      meta: {
        caseId: h.case.id,
        statusColor: h.status.color,
      },
    });
  }

  for (const lead of recentLeads) {
    items.push({
      id: `lead-${lead.id}`,
      type: "lead_created",
      title: `Novo lead — ${lead.name}`,
      description: lead.interestArea ?? lead.notes?.slice(0, 120) ?? null,
      actorName: lead.assignedTo?.name ?? "Sistema",
      createdAt: lead.createdAt,
      meta: { leadId: lead.id },
    });
  }

  for (const c of recentCases) {
    items.push({
      id: `case-${c.id}`,
      type: "case_opened",
      title: `Caso aberto — ${c.title}`,
      description: c.caseNumber
        ? `Processo ${c.caseNumber} · ${c.status.name}`
        : c.status.name,
      actorName: c.lawyer.name,
      createdAt: c.createdAt,
      meta: { caseId: c.id, statusColor: c.status.color },
    });
  }

  return items
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export async function globalCrmSearch(
  officeId: string,
  query: string
): Promise<CrmSearchResult> {
  const q = query.trim();
  if (q.length < 2) {
    return { leads: [], clients: [], cases: [] };
  }

  const [leads, clients, cases] = await Promise.all([
    prisma.lead.findMany({
      where: {
        officeId,
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, status: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.client.findMany({
      where: {
        officeId,
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { cpfCnpj: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, cpfCnpj: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
    prisma.case.findMany({
      where: {
        officeId,
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { caseNumber: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, caseNumber: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { leads, clients, cases };
}

export async function getRecentLeadsForDashboard(
  officeId: string,
  limit = 5
): Promise<CrmLeadRow[]> {
  return getCrmLeads(officeId, {}).then((leads) => leads.slice(0, limit));
}

export async function getRecentCasesForDashboard(
  officeId: string,
  limit = 5
): Promise<CrmCaseRow[]> {
  return getCrmCases(officeId, {}).then((cases) => cases.slice(0, limit));
}
