import { prisma } from "@/lib/prisma/client";
import { AGENDA_TYPE_MAP } from "@/constants/agenda";
import { notifyDeadlineNear } from "@/lib/notifications/service";

export async function processDueReminders(officeId: string): Promise<number> {
  const now = new Date();

  const due = await prisma.appointment.findMany({
    where: {
      officeId,
      deletedAt: null,
      notifyEnabled: true,
      notificationSentAt: null,
      reminderAt: { lte: now },
      status: { in: ["SCHEDULED", "CONFIRMED"] },
    },
    take: 50,
  });

  if (due.length === 0) return 0;

  for (const appointment of due) {
    const typeLabel =
      AGENDA_TYPE_MAP[appointment.type]?.label ?? appointment.type;
    const startFormatted = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(appointment.startAt);

    await notifyDeadlineNear(appointment.lawyerId, {
      appointmentId: appointment.id,
      title: appointment.title,
      typeLabel,
      startFormatted,
      location: appointment.location,
    });

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { notificationSentAt: now },
    });
  }

  return due.length;
}

export function computeReminderAt(
  startAt: Date,
  notifyMinutesBefore: number
): Date {
  return new Date(startAt.getTime() - notifyMinutesBefore * 60 * 1000);
}
