import { prisma } from "@/lib/prisma/client";
import type { AppointmentStatus, AppointmentType } from "@prisma/client";

export interface AgendaEventItem {
  id: string;
  title: string;
  description: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  location: string | null;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  lawyerId: string;
  lawyerName: string;
  clientId: string | null;
  clientName: string | null;
  caseId: string | null;
  caseTitle: string | null;
  notifyEnabled: boolean;
  notifyMinutesBefore: number | null;
}

export interface AgendaSelectOption {
  id: string;
  label: string;
}

export async function getAgendaEvents(
  officeId: string,
  start: Date,
  end: Date,
  lawyerId?: string
): Promise<AgendaEventItem[]> {
  const events = await prisma.appointment.findMany({
    where: {
      officeId,
      deletedAt: null,
      startAt: { lte: end },
      endAt: { gte: start },
      ...(lawyerId && { lawyerId }),
    },
    include: {
      lawyer: { select: { name: true } },
      client: { select: { name: true } },
      case: { select: { title: true } },
    },
    orderBy: { startAt: "asc" },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    type: e.type,
    status: e.status,
    location: e.location,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt.toISOString(),
    isAllDay: e.isAllDay,
    lawyerId: e.lawyerId,
    lawyerName: e.lawyer.name,
    clientId: e.clientId,
    clientName: e.client?.name ?? null,
    caseId: e.caseId,
    caseTitle: e.case?.title ?? null,
    notifyEnabled: e.notifyEnabled,
    notifyMinutesBefore: e.notifyMinutesBefore,
  }));
}

export async function getAgendaClients(
  officeId: string
): Promise<AgendaSelectOption[]> {
  const clients = await prisma.client.findMany({
    where: { officeId, deletedAt: null, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  return clients.map((c) => ({ id: c.id, label: c.name }));
}

export async function getAgendaCases(
  officeId: string
): Promise<AgendaSelectOption[]> {
  const cases = await prisma.case.findMany({
    where: { officeId, deletedAt: null, closedAt: null },
    select: { id: true, title: true, caseNumber: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return cases.map((c) => ({
    id: c.id,
    label: c.caseNumber ? `${c.title} (${c.caseNumber})` : c.title,
  }));
}
