import type { CasePriority } from "@prisma/client";

export interface KanbanCardData {
  id: string;
  title: string;
  caseNumber: string | null;
  caseType: string;
  priority: CasePriority;
  clientName: string;
  lawyerName: string;
  statusId: string;
  openedAt: string;
}

export interface KanbanColumnData {
  id: string;
  slug: string;
  name: string;
  color: string;
  isFinal: boolean;
  cards: KanbanCardData[];
}

export interface LegalKanbanBoardData {
  columns: KanbanColumnData[];
  totalCases: number;
}
