import { prisma } from "@/lib/prisma/client";
import { hasPermission } from "@/lib/auth/permissions";
import { LEAD_SOURCE_LABELS } from "@/constants/crm";
import { DOCUMENT_TYPE_LABELS } from "@/constants/documents";
import type { NotificationEvent } from "@/constants/notifications";
import type { NotificationType, UserRole } from "@prisma/client";

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  event: NotificationEvent;
  metadata?: Record<string, unknown>;
}

async function getActiveOfficeUsers(officeId: string) {
  return prisma.user.findMany({
    where: { officeId, deletedAt: null, isActive: true },
    select: { id: true, role: true },
  });
}

async function getCrmRecipientIds(officeId: string, extraUserIds: string[] = []) {
  const users = await getActiveOfficeUsers(officeId);
  const ids = new Set(extraUserIds.filter(Boolean));

  for (const user of users) {
    if (hasPermission(user.role, "crm:read")) {
      ids.add(user.id);
    }
  }

  return Array.from(ids);
}

async function getDocumentRecipientIds(
  officeId: string,
  clientId: string,
  extraUserIds: string[] = []
) {
  const users = await getActiveOfficeUsers(officeId);
  const ids = new Set(extraUserIds.filter(Boolean));

  const client = await prisma.client.findFirst({
    where: { id: clientId, officeId, deletedAt: null },
    select: {
      assignedLawyer: { select: { userId: true } },
    },
  });

  if (client?.assignedLawyer?.userId) {
    ids.add(client.assignedLawyer.userId);
  }

  for (const user of users) {
    if (hasPermission(user.role, "documentos:read")) {
      ids.add(user.id);
    }
  }

  return Array.from(ids);
}

export async function notifyUsers(
  userIds: string[],
  payload: NotificationPayload,
  excludeUserId?: string
): Promise<number> {
  const unique = [...new Set(userIds)].filter(
    (id) => id && id !== excludeUserId
  );

  if (unique.length === 0) return 0;

  await prisma.notification.createMany({
    data: unique.map((userId) => ({
      userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link ?? null,
      metadata: {
        event: payload.event,
        ...payload.metadata,
      },
    })),
  });

  return unique.length;
}

export async function notifyNewLead(
  officeId: string,
  lead: {
    id: string;
    name: string;
    source: string;
    interestArea: string | null;
    assignedToId: string | null;
  }
) {
  const sourceLabel =
    LEAD_SOURCE_LABELS[lead.source as keyof typeof LEAD_SOURCE_LABELS] ??
    lead.source;

  const recipients = await getCrmRecipientIds(
    officeId,
    lead.assignedToId ? [lead.assignedToId] : []
  );

  return notifyUsers(recipients, {
    type: "INFO",
    event: "NEW_LEAD",
    title: "Novo lead",
    body: `${lead.name} | ${sourceLabel}${lead.interestArea ? ` · ${lead.interestArea}` : ""}`,
    link: `/dashboard/crm/leads/${lead.id}`,
    metadata: { leadId: lead.id, source: lead.source },
  });
}

export async function notifyNewClient(
  officeId: string,
  client: {
    id: string;
    name: string;
    type: string;
    assignedLawyerUserId?: string | null;
  },
  excludeUserId?: string
) {
  const recipients = await getCrmRecipientIds(
    officeId,
    client.assignedLawyerUserId ? [client.assignedLawyerUserId] : []
  );

  return notifyUsers(
    recipients,
    {
      type: "SUCCESS",
      event: "NEW_CLIENT",
      title: "Novo cliente",
      body: `${client.name} cadastrado no escritório`,
      link: `/dashboard/documentos/${client.id}`,
      metadata: { clientId: client.id },
    },
    excludeUserId
  );
}

export async function notifyLeadConverted(
  officeId: string,
  lead: { id: string; name: string; convertedClientId: string | null },
  clientName?: string
) {
  const recipients = await getCrmRecipientIds(officeId);

  return notifyUsers(recipients, {
    type: "SUCCESS",
    event: "NEW_CLIENT",
    title: "Lead convertido",
    body: clientName
      ? `${lead.name} convertido em cliente (${clientName})`
      : `${lead.name} marcado como convertido`,
    link: lead.convertedClientId
      ? `/dashboard/documentos/${lead.convertedClientId}`
      : "/dashboard/crm/leads",
    metadata: { leadId: lead.id, clientId: lead.convertedClientId },
  });
}

export async function notifyDocumentUploaded(
  officeId: string,
  data: {
    documentId: string;
    clientId: string;
    clientName: string;
    fileName: string;
    documentType: string;
    uploadedByRole: UserRole;
    version: number;
  },
  excludeUserId?: string
) {
  const recipients = await getDocumentRecipientIds(officeId, data.clientId);
  const typeLabel =
    DOCUMENT_TYPE_LABELS[
      data.documentType as keyof typeof DOCUMENT_TYPE_LABELS
    ] ?? data.documentType;
  const fromClient = data.uploadedByRole === "CLIENT";

  return notifyUsers(
    recipients,
    {
      type: "INFO",
      event: "DOCUMENT_UPLOADED",
      title: fromClient ? "Documento do cliente" : "Documento enviado",
      body: fromClient
        ? `${data.clientName} enviou ${typeLabel}: ${data.fileName}`
        : `${typeLabel} adicionado à pasta de ${data.clientName}: ${data.fileName}`,
      link: `/dashboard/documentos/${data.clientId}?tab=documentos`,
      metadata: {
        documentId: data.documentId,
        clientId: data.clientId,
        version: data.version,
        fromPortal: fromClient,
      },
    },
    excludeUserId
  );
}

export async function notifyStatusChanged(
  officeId: string,
  data: {
    caseId: string;
    caseTitle: string;
    clientName: string;
    statusName: string;
    lawyerId: string;
    changedByName: string;
  },
  excludeUserId?: string
) {
  const recipients = await getCrmRecipientIds(officeId, [data.lawyerId]);

  return notifyUsers(
    recipients,
    {
      type: "WARNING",
      event: "STATUS_CHANGED",
      title: "Status alterado",
      body: `${data.caseTitle} (${data.clientName}) → ${data.statusName} · por ${data.changedByName}`,
      link: `/dashboard/kanban`,
      metadata: {
        caseId: data.caseId,
        statusName: data.statusName,
      },
    },
    excludeUserId
  );
}

export async function notifyDeadlineNear(
  userId: string,
  data: {
    appointmentId: string;
    title: string;
    typeLabel: string;
    startFormatted: string;
    location?: string | null;
  }
) {
  await prisma.notification.create({
    data: {
      userId,
      type: "DEADLINE",
      title: `${data.typeLabel}: ${data.title}`,
      body: `Compromisso em ${data.startFormatted}${data.location ? ` | ${data.location}` : ""}`,
      link: "/dashboard/agenda",
      metadata: {
        event: "DEADLINE_NEAR",
        appointmentId: data.appointmentId,
      },
    },
  });
}
