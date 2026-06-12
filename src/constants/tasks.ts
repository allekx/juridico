import type { TaskPriority, TaskStatus } from "@prisma/client";

export const TASK_STATUS_OPTIONS: {
  value: TaskStatus;
  label: string;
  variant: "muted" | "info" | "success" | "destructive";
}[] = [
  { value: "PENDING", label: "Pendente", variant: "muted" },
  { value: "IN_PROGRESS", label: "Em andamento", variant: "info" },
  { value: "COMPLETED", label: "Concluída", variant: "success" },
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export const TASK_PRIORITY_OPTIONS: {
  value: TaskPriority;
  label: string;
  variant: "muted" | "info" | "warning" | "destructive";
}[] = [
  { value: "LOW", label: "Baixa", variant: "muted" },
  { value: "MEDIUM", label: "Média", variant: "info" },
  { value: "HIGH", label: "Alta", variant: "warning" },
  { value: "URGENT", label: "Urgente", variant: "destructive" },
];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const TASK_PRIORITY_VARIANT = Object.fromEntries(
  TASK_PRIORITY_OPTIONS.map((o) => [o.value, o.variant])
) as Record<TaskPriority, "muted" | "info" | "warning" | "destructive">;

export const TASK_STATUS_VARIANT = Object.fromEntries(
  TASK_STATUS_OPTIONS.map((o) => [o.value, o.variant])
) as Record<string, "muted" | "info" | "success" | "destructive">;
