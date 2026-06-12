import { prisma } from "@/lib/prisma/client";
import { KANBAN_COLUMNS } from "@/constants/kanban";
import type { LegalKanbanBoardData, KanbanColumnData } from "@/types/kanban";

export async function ensureKanbanStatuses(officeId: string): Promise<void> {
  await Promise.all(
    KANBAN_COLUMNS.map((col) =>
      prisma.caseStatus.upsert({
        where: {
          officeId_slug: { officeId, slug: col.slug },
        },
        update: {
          name: col.name,
          color: col.color,
          sortOrder: col.sortOrder,
          isDefault: "isDefault" in col ? col.isDefault : false,
          isFinal: col.isFinal,
          isActive: true,
        },
        create: {
          officeId,
          name: col.name,
          slug: col.slug,
          color: col.color,
          sortOrder: col.sortOrder,
          isDefault: "isDefault" in col ? col.isDefault : false,
          isFinal: col.isFinal,
        },
      })
    )
  );
}

export async function getLegalKanbanBoard(
  officeId: string
): Promise<LegalKanbanBoardData> {
  await ensureKanbanStatuses(officeId);

  const statuses = await prisma.caseStatus.findMany({
    where: {
      officeId,
      isActive: true,
      slug: { in: KANBAN_COLUMNS.map((c) => c.slug) },
    },
    orderBy: { sortOrder: "asc" },
  });

  const statusBySlug = new Map(statuses.map((s) => [s.slug, s]));

  const cases = await prisma.case.findMany({
    where: { officeId, deletedAt: null },
    include: {
      client: { select: { name: true } },
      lawyer: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const columns: KanbanColumnData[] = KANBAN_COLUMNS.map((col) => {
    const status = statusBySlug.get(col.slug);
    const statusId = status?.id ?? "";

    const columnCards = cases
      .filter((c) => c.statusId === statusId)
      .map((c) => ({
        id: c.id,
        title: c.title,
        caseNumber: c.caseNumber,
        caseType: c.caseType,
        priority: c.priority,
        clientName: c.client.name,
        lawyerName: c.lawyer.name,
        statusId: c.statusId,
        openedAt: c.openedAt.toISOString(),
      }));

    return {
      id: statusId,
      slug: col.slug,
      name: col.name,
      color: col.color,
      isFinal: col.isFinal,
      cards: columnCards,
    };
  });

  return {
    columns,
    totalCases: cases.length,
  };
}
