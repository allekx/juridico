import { prisma } from "@/lib/prisma/client";
import { buildProcessTimeline } from "@/lib/process-timeline";
import type { ProcessTimelineStep } from "@/lib/process-timeline";
import type { CasePriority } from "@prisma/client";

export interface PortalCaseItem {
  id: string;
  title: string;
  caseNumber: string | null;
  caseType: string;
  statusName: string;
  statusSlug: string;
  statusColor: string;
  lawyerName: string;
  priority: CasePriority;
  openedAt: Date;
  updatedAt: Date;
}

export interface PortalCaseProgress {
  case: PortalCaseItem;
  steps: ProcessTimelineStep[];
}

export interface PortalTimelineItem {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  type: "case_status" | "document" | "message" | "case_opened";
}

export interface PortalDocumentItem {
  id: string;
  documentGroupId: string;
  name: string;
  mimeType: string;
  fileSize: number;
  documentType: string;
  version: number;
  versionCount: number;
  createdAt: Date;
  uploadedByName: string;
  isOwnUpload: boolean;
}

export interface PortalMessageItem {
  id: string;
  subject: string | null;
  body: string;
  authorName: string;
  isFromClient: boolean;
  createdAt: Date;
}

export async function getPortalOverview(
  officeId: string,
  clientId: string,
  userId: string
) {
  const [cases, documents, messages, lawyer] = await Promise.all([
    prisma.case.count({
      where: { officeId, clientId, deletedAt: null, closedAt: null },
    }),
    prisma.document.count({
      where: {
        officeId,
        clientId,
        deletedAt: null,
        isLatestVersion: true,
        OR: [
          { visibility: { in: ["CLIENT", "PUBLIC"] } },
          { uploadedById: userId },
        ],
      },
    }),
    prisma.clientMessage.count({
      where: { officeId, clientId, deletedAt: null },
    }),
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        assignedLawyer: { include: { user: { select: { name: true } } } },
      },
    }),
  ]);

  return {
    activeCases: cases,
    documents,
    messages,
    lawyerName: lawyer?.assignedLawyer?.user.name ?? null,
  };
}

export async function getPortalCases(
  officeId: string,
  clientId: string
): Promise<PortalCaseItem[]> {
  const cases = await prisma.case.findMany({
    where: { officeId, clientId, deletedAt: null },
    include: {
      status: { select: { name: true, color: true, slug: true } },
      lawyer: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return cases.map((c) => ({
    id: c.id,
    title: c.title,
    caseNumber: c.caseNumber,
    caseType: c.caseType,
    statusName: c.status.name,
    statusSlug: c.status.slug,
    statusColor: c.status.color,
    lawyerName: c.lawyer.name,
    priority: c.priority,
    openedAt: c.openedAt,
    updatedAt: c.updatedAt,
  }));
}

export async function getPortalCaseProgressList(
  officeId: string,
  clientId: string
): Promise<PortalCaseProgress[]> {
  const cases = await prisma.case.findMany({
    where: { officeId, clientId, deletedAt: null },
    include: {
      status: { select: { name: true, color: true, slug: true, isFinal: true } },
      lawyer: { select: { name: true } },
      history: {
        include: { status: { select: { slug: true } } },
        orderBy: { createdAt: "asc" },
      },
      appointments: {
        where: {
          type: "HEARING",
          deletedAt: null,
          status: { in: ["SCHEDULED", "CONFIRMED", "COMPLETED"] },
        },
        orderBy: { startAt: "asc" },
        take: 1,
        select: { startAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return cases.map((c) => ({
    case: {
      id: c.id,
      title: c.title,
      caseNumber: c.caseNumber,
      caseType: c.caseType,
      statusName: c.status.name,
      statusSlug: c.status.slug,
      statusColor: c.status.color,
      lawyerName: c.lawyer.name,
      priority: c.priority,
      openedAt: c.openedAt,
      updatedAt: c.updatedAt,
    },
    steps: buildProcessTimeline({
      currentStatusSlug: c.status.slug,
      isFinal: c.status.isFinal,
      openedAt: c.openedAt,
      history: c.history.map((h) => ({
        statusSlug: h.status.slug,
        createdAt: h.createdAt,
      })),
      hearingDate: c.appointments[0]?.startAt ?? null,
    }),
  }));
}

export async function getPortalTimeline(
  officeId: string,
  clientId: string
): Promise<PortalTimelineItem[]> {
  const cases = await prisma.case.findMany({
    where: { officeId, clientId, deletedAt: null },
    select: { id: true },
  });
  const caseIds = cases.map((c) => c.id);

  const [history, events, caseList] = await Promise.all([
    prisma.caseHistory.findMany({
      where: { caseId: { in: caseIds } },
      include: {
        case: { select: { title: true } },
        status: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.clientFolderEvent.findMany({
      where: {
        officeId,
        clientId,
        action: { in: ["FILE_UPLOADED", "MESSAGE_SENT", "CONTRACT_CREATED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.case.findMany({
      where: { officeId, clientId, deletedAt: null },
      include: { status: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const items: PortalTimelineItem[] = [];

  for (const h of history) {
    items.push({
      id: `h-${h.id}`,
      title: h.case.title,
      description: `Status atualizado para ${h.status.name}`,
      date: h.createdAt,
      type: "case_status",
    });
  }

  for (const e of events) {
    items.push({
      id: `e-${e.id}`,
      title: e.description,
      description: null,
      date: e.createdAt,
      type: e.action === "MESSAGE_SENT" ? "message" : "document",
    });
  }

  for (const c of caseList) {
    items.push({
      id: `c-${c.id}`,
      title: c.title,
      description: `Processo aberto — ${c.status.name}`,
      date: c.createdAt,
      type: "case_opened",
    });
  }

  return items
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 40);
}

export async function getPortalDocuments(
  officeId: string,
  clientId: string,
  userId: string
): Promise<PortalDocumentItem[]> {
  const docs = await prisma.document.findMany({
    where: {
      officeId,
      clientId,
      deletedAt: null,
      isTemplate: false,
      isLatestVersion: true,
      OR: [
        { visibility: { in: ["CLIENT", "PUBLIC"] } },
        { uploadedById: userId },
      ],
    },
    include: { uploadedBy: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  const groupIds = [...new Set(docs.map((d) => d.documentGroupId))];
  const versionCounts = groupIds.length
    ? await prisma.document.groupBy({
        by: ["documentGroupId"],
        where: { documentGroupId: { in: groupIds }, deletedAt: null },
        _count: { id: true },
      })
    : [];

  const countMap = Object.fromEntries(
    versionCounts.map((v) => [v.documentGroupId, v._count.id])
  );

  return docs.map((d) => ({
    id: d.id,
    documentGroupId: d.documentGroupId,
    name: d.name,
    mimeType: d.mimeType,
    fileSize: d.fileSize,
    documentType: d.documentType,
    version: d.version,
    versionCount: countMap[d.documentGroupId] ?? 1,
    createdAt: d.createdAt,
    uploadedByName: d.uploadedBy.name,
    isOwnUpload: d.uploadedById === userId,
  }));
}

export async function getPortalMessages(
  officeId: string,
  clientId: string,
  userId: string
): Promise<PortalMessageItem[]> {
  const messages = await prisma.clientMessage.findMany({
    where: { officeId, clientId, deletedAt: null },
    include: { author: { select: { name: true, id: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return messages.map((m) => ({
    id: m.id,
    subject: m.subject,
    body: m.body,
    authorName: m.author.name,
    isFromClient: m.authorId === userId,
    createdAt: m.createdAt,
  }));
}
