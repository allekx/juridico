"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { withPermission } from "@/lib/auth/guards";
import { logCreate, logDelete, logUpdate } from "@/lib/audit/service";
import { agendaEventSchema } from "@/schemas/agenda";
import { computeReminderAt } from "@/lib/agenda/notifications";
import type { ActionResult } from "@/types/auth";

function buildDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

function revalidateAgenda() {
  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard");
}

export async function createAgendaEventAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await withPermission("agenda:write");

  const parsed = agendaEventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    location: formData.get("location") || undefined,
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    lawyerId: formData.get("lawyerId"),
    clientId: formData.get("clientId") || "",
    caseId: formData.get("caseId") || "",
    notifyEnabled: formData.get("notifyEnabled") === "on",
    notifyMinutesBefore: formData.get("notifyMinutesBefore")
      ? Number(formData.get("notifyMinutesBefore"))
      : undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;
  const startAt = buildDateTime(data.date, data.startTime);
  const endAt = buildDateTime(data.date, data.endTime);

  const reminderAt =
    data.notifyEnabled && data.notifyMinutesBefore
      ? computeReminderAt(startAt, data.notifyMinutesBefore)
      : null;

  try {
    const event = await prisma.appointment.create({
      data: {
        officeId: user.officeId,
        lawyerId: data.lawyerId,
        createdById: user.id,
        clientId: data.clientId || null,
        caseId: data.caseId || null,
        title: data.title,
        description: data.description?.trim() || null,
        type: data.type,
        location: data.location?.trim() || null,
        startAt,
        endAt,
        notifyEnabled: Boolean(data.notifyEnabled),
        notifyMinutesBefore: data.notifyEnabled
          ? data.notifyMinutesBefore ?? null
          : null,
        reminderAt,
        notificationSentAt: null,
      },
    });

    await logCreate(
      user,
      "appointment",
      event.id,
      `Compromisso criado: ${event.title}`,
      { type: event.type }
    );

    revalidateAgenda();
    return { success: true, data: { id: event.id } };
  } catch {
    return { success: false, error: "Erro ao criar evento" };
  }
}

export async function updateAgendaEventAction(
  eventId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await withPermission("agenda:write");

  const parsed = agendaEventSchema.safeParse({
    id: eventId,
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    location: formData.get("location") || undefined,
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    lawyerId: formData.get("lawyerId"),
    clientId: formData.get("clientId") || "",
    caseId: formData.get("caseId") || "",
    notifyEnabled: formData.get("notifyEnabled") === "on",
    notifyMinutesBefore: formData.get("notifyMinutesBefore")
      ? Number(formData.get("notifyMinutesBefore"))
      : undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const existing = await prisma.appointment.findFirst({
    where: { id: eventId, officeId: user.officeId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Evento não encontrado" };
  }

  const data = parsed.data;
  const startAt = buildDateTime(data.date, data.startTime);
  const endAt = buildDateTime(data.date, data.endTime);
  const notifyEnabled = Boolean(data.notifyEnabled);
  const reminderAt =
    notifyEnabled && data.notifyMinutesBefore
      ? computeReminderAt(startAt, data.notifyMinutesBefore)
      : null;

  try {
    await prisma.appointment.update({
      where: { id: eventId },
      data: {
        lawyerId: data.lawyerId,
        clientId: data.clientId || null,
        caseId: data.caseId || null,
        title: data.title,
        description: data.description?.trim() || null,
        type: data.type,
        location: data.location?.trim() || null,
        startAt,
        endAt,
        notifyEnabled,
        notifyMinutesBefore: notifyEnabled
          ? data.notifyMinutesBefore ?? null
          : null,
        reminderAt,
        notificationSentAt: null,
      },
    });

    await logUpdate(
      user,
      "appointment",
      eventId,
      `Compromisso alterado: ${data.title}`,
      { type: data.type }
    );

    revalidateAgenda();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar evento" };
  }
}

export async function deleteAgendaEventAction(
  eventId: string
): Promise<ActionResult> {
  const user = await withPermission("agenda:write");

  const existing = await prisma.appointment.findFirst({
    where: { id: eventId, officeId: user.officeId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Evento não encontrado" };
  }

  await prisma.appointment.update({
    where: { id: eventId },
    data: { deletedAt: new Date(), status: "CANCELLED" },
  });

  await logDelete(
    user,
    "appointment",
    eventId,
    `Compromisso excluído: ${existing.title}`
  );

  revalidateAgenda();
  return { success: true };
}
