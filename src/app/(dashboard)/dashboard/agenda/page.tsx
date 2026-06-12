import type { Metadata } from "next";
import { Suspense } from "react";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { getCrmTeamMembers } from "@/lib/crm/queries";
import {
  getAgendaEvents,
  getAgendaClients,
  getAgendaCases,
} from "@/lib/agenda/queries";
import { processDueReminders } from "@/lib/agenda/notifications";
import {
  getViewRange,
  parseDateParam,
  toDateParam,
} from "@/lib/agenda/date-utils";
import { LegalCalendar } from "@/components/modules/agenda/legal-calendar";
import type { CalendarView } from "@/constants/agenda";

export const metadata: Metadata = {
  title: "Agenda Jurídica",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string; lawyer?: string }>;
}) {
  const user = await withPermission("agenda:read");
  const canWrite = hasPermission(user.role, "agenda:write");
  const params = await searchParams;

  await processDueReminders(user.officeId);

  const view = (["day", "week", "month"].includes(params.view ?? "")
    ? params.view
    : "week") as CalendarView;
  const dateParam = params.date ?? toDateParam(new Date());
  const anchor = parseDateParam(dateParam);
  const range = getViewRange(view, anchor);

  const [events, teamMembers, clients, cases] = await Promise.all([
    getAgendaEvents(
      user.officeId,
      range.start,
      range.end,
      params.lawyer || undefined
    ),
    getCrmTeamMembers(user.officeId),
    getAgendaClients(user.officeId),
    getAgendaCases(user.officeId),
  ]);

  return (
    <Suspense fallback={<div className="py-12 text-center">Carregando agenda...</div>}>
      <LegalCalendar
        events={events}
        teamMembers={teamMembers}
        clients={clients}
        cases={cases}
        canWrite={canWrite}
        currentUserId={user.id}
        initialView={view}
        initialDate={dateParam}
      />
    </Suspense>
  );
}
