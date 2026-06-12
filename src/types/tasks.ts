import type { TaskPriority, TaskStatus } from "@prisma/client";

export interface TaskListFilters {
  q?: string;
  status?: string;
  assignedToId?: string;
  clientId?: string;
  caseId?: string;
  priority?: string;
  dueFrom?: string;
  dueTo?: string;
}

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  assignedToId: string;
  assignedToName: string;
  clientId: string | null;
  clientName: string | null;
  caseId: string | null;
  caseTitle: string | null;
  createdByName: string;
}

export interface TaskStats {
  pending: number;
  inProgress: number;
  completed: number;
  total: number;
}
