import type { NotificationType } from "@prisma/client";

export type NotificationEvent =
  | "NEW_LEAD"
  | "NEW_CLIENT"
  | "DOCUMENT_UPLOADED"
  | "STATUS_CHANGED"
  | "DEADLINE_NEAR";

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  NEW_LEAD: "Novo lead",
  NEW_CLIENT: "Novo cliente",
  DOCUMENT_UPLOADED: "Documento enviado",
  STATUS_CHANGED: "Status alterado",
  DEADLINE_NEAR: "Prazo próximo",
};

export const NOTIFICATION_TYPE_VARIANT: Record<
  NotificationType,
  "default" | "warning" | "success" | "destructive" | "gold" | "muted"
> = {
  INFO: "default",
  WARNING: "warning",
  SUCCESS: "success",
  ERROR: "destructive",
  REMINDER: "gold",
  DEADLINE: "destructive",
  PAYMENT: "gold",
  MESSAGE: "default",
};
