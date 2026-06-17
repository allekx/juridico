import { prisma } from "@/lib/prisma/client";
import { getPublicOfficeId } from "@/lib/blog/office";
import { buildProcessTimeline } from "@/lib/process-timeline";
import type { PortalCaseProgress } from "@/lib/portal/queries";
import { normalizeDocument } from "@/schemas/portal";

async function findClientByDocument(officeId: string, cpfCnpj: string) {
  const normalized = normalizeDocument(cpfCnpj);
  if (!normalized) return null;

  const clients = await prisma.client.findMany({
    where: {
      officeId,
      deletedAt: null,
      cpfCnpj: { not: null },
    },
    select: { id: true, cpfCnpj: true },
  });

  return (
    clients.find(
      (client) => normalizeDocument(client.cpfCnpj ?? "") === normalized
    ) ?? null
  );
}

function mapCaseToProgress(
  c: Awaited<ReturnType<typeof fetchCaseWithRelations>>
): PortalCaseProgress | null {
  if (!c) return null;

  return {
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
  };
}

async function fetchCaseWithRelations(caseId: string) {
  return prisma.case.findFirst({
    where: { id: caseId, deletedAt: null },
    include: {
      status: {
        select: { name: true, color: true, slug: true, isFinal: true },
      },
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
  });
}

export async function lookupPublicCaseProgress(
  cpfCnpj: string,
  reference: string
): Promise<PortalCaseProgress | null> {
  const officeId = await getPublicOfficeId();
  const client = await findClientByDocument(officeId, cpfCnpj);
  if (!client) return null;

  const ref = reference.trim();
  const orConditions: Array<
    | { caseNumber: { equals: string; mode: "insensitive" } }
    | { id: string }
  > = [{ caseNumber: { equals: ref, mode: "insensitive" } }];

  if (/^[0-9a-f-]{36}$/i.test(ref)) {
    orConditions.push({ id: ref });
  }

  const caseRecord = await prisma.case.findFirst({
    where: {
      officeId,
      clientId: client.id,
      deletedAt: null,
      OR: orConditions,
    },
    select: { id: true },
  });

  if (!caseRecord) return null;

  const fullCase = await fetchCaseWithRelations(caseRecord.id);
  return mapCaseToProgress(fullCase);
}
