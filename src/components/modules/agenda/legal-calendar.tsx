"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventChip } from "@/components/modules/agenda/event-chip";
import { EventFormDialog } from "@/components/modules/agenda/event-form-dialog";
import {
  CALENDAR_VIEWS,
  AGENDA_EVENT_TYPES,
  HOUR_START,
  HOUR_END,
  type CalendarView,
} from "@/constants/agenda";
import {
  addDays,
  addMonths,
  addWeeks,
  formatDayHeader,
  formatFullDate,
  formatMonthYear,
  formatTime,
  getMonthGrid,
  getWeekDays,
  isSameDay,
  parseDateParam,
  startOfDay,
  toDateParam,
} from "@/lib/agenda/date-utils";
import { cn } from "@/lib/utils";
import type { AgendaEventItem, AgendaSelectOption } from "@/lib/agenda/queries";
import type { CrmTeamMember } from "@/types/crm";

interface LegalCalendarProps {
  events: AgendaEventItem[];
  teamMembers: CrmTeamMember[];
  clients: AgendaSelectOption[];
  cases: AgendaSelectOption[];
  canWrite: boolean;
  currentUserId: string;
  initialView: CalendarView;
  initialDate: string;
}

function eventsForDay(events: AgendaEventItem[], day: Date) {
  return events.filter((e) => isSameDay(new Date(e.startAt), day));
}

export function LegalCalendar({
  events,
  teamMembers,
  clients,
  cases,
  canWrite,
  currentUserId,
  initialView,
  initialDate,
}: LegalCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEventItem | null>(
    null
  );
  const [createDate, setCreateDate] = useState<Date | undefined>();

  const view = (searchParams.get("view") as CalendarView) || initialView;
  const dateParam = searchParams.get("date") || initialDate;
  const anchor = parseDateParam(dateParam);
  const today = startOfDay(new Date());

  function navigate(nextView: CalendarView, nextDate: Date) {
    const params = new URLSearchParams();
    params.set("view", nextView);
    params.set("date", toDateParam(nextDate));
    router.push(`/dashboard/agenda?${params.toString()}`);
  }

  function goPrev() {
    if (view === "day") navigate(view, addDays(anchor, -1));
    else if (view === "week") navigate(view, addWeeks(anchor, -1));
    else navigate(view, addMonths(anchor, -1));
  }

  function goNext() {
    if (view === "day") navigate(view, addDays(anchor, 1));
    else if (view === "week") navigate(view, addWeeks(anchor, 1));
    else navigate(view, addMonths(anchor, 1));
  }

  function openCreate(day?: Date) {
    setSelectedEvent(null);
    setCreateDate(day ?? anchor);
    setFormOpen(true);
  }

  function openEdit(event: AgendaEventItem) {
    setSelectedEvent(event);
    setCreateDate(undefined);
    setFormOpen(true);
  }

  const headerLabel = useMemo(() => {
    if (view === "day") return formatFullDate(anchor);
    if (view === "week") {
      const days = getWeekDays(anchor);
      return `${formatDayHeader(days[0])} — ${formatDayHeader(days[6])}`;
    }
    return formatMonthYear(anchor);
  }, [view, anchor]);

  const weekDays = getWeekDays(anchor);
  const monthGrid = getMonthGrid(anchor);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Agenda Jurídica</h2>
          <p className="text-sm text-muted-foreground">
            Audiências, reuniões, prazos e retornos
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => openCreate()}>
            <Plus className="h-4 w-4" />
            Novo evento
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {AGENDA_EVENT_TYPES.map((t) => (
          <Badge
            key={t.value}
            variant="outline"
            className={cn("text-2xs", t.bgClass)}
          >
            {t.label}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(view, today)}
          >
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 font-medium capitalize">{headerLabel}</span>
        </div>

        <div className="flex rounded-lg border border-border p-0.5">
          {CALENDAR_VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => navigate(v.id, anchor)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === v.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === "day" && (
        <DayView
          day={anchor}
          events={eventsForDay(events, anchor)}
          onEventClick={openEdit}
          onSlotClick={canWrite ? () => openCreate(anchor) : undefined}
        />
      )}

      {view === "week" && (
        <WeekView
          days={weekDays}
          events={events}
          onEventClick={openEdit}
          onDayClick={canWrite ? openCreate : undefined}
        />
      )}

      {view === "month" && (
        <MonthView
          anchor={anchor}
          days={monthGrid}
          events={events}
          onEventClick={openEdit}
          onDayClick={canWrite ? openCreate : undefined}
        />
      )}

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        event={selectedEvent}
        defaultDate={createDate}
        teamMembers={teamMembers}
        clients={clients}
        cases={cases}
        canWrite={canWrite}
        defaultLawyerId={currentUserId}
      />
    </div>
  );
}

function DayView({
  day,
  events,
  onEventClick,
  onSlotClick,
}: {
  day: Date;
  events: AgendaEventItem[];
  onEventClick: (e: AgendaEventItem) => void;
  onSlotClick?: () => void;
}) {
  const hours = Array.from(
    { length: HOUR_END - HOUR_START },
    (_, i) => HOUR_START + i
  );

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="border-b px-4 py-3">
        <p className="font-medium capitalize">{formatFullDate(day)}</p>
        <p className="text-xs text-muted-foreground">
          {events.length} evento{events.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="divide-y">
        {hours.map((hour) => {
          const slotEvents = events.filter((e) => {
            const h = new Date(e.startAt).getHours();
            return h === hour;
          });

          return (
            <div key={hour} className="flex min-h-[4rem] gap-4 px-4 py-2">
              <span className="w-12 shrink-0 pt-1 text-xs text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                {slotEvents.map((e) => (
                  <EventChip
                    key={e.id}
                    event={e}
                    onClick={() => onEventClick(e)}
                  />
                ))}
                {slotEvents.length === 0 && onSlotClick && hour === 9 && (
                  <button
                    type="button"
                    onClick={onSlotClick}
                    className="text-left text-xs text-muted-foreground hover:text-foreground"
                  >
                    + Adicionar evento
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {events.some((e) => e.notifyEnabled) && (
        <div className="flex items-center gap-2 border-t px-4 py-2 text-xs text-muted-foreground">
          <Bell className="h-3.5 w-3.5" />
          Alguns eventos possuem notificação ativada
        </div>
      )}
    </div>
  );
}

function WeekView({
  days,
  events,
  onEventClick,
  onDayClick,
}: {
  days: Date[];
  events: AgendaEventItem[];
  onEventClick: (e: AgendaEventItem) => void;
  onDayClick?: (day: Date) => void;
}) {
  const today = startOfDay(new Date());

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
      <div className="grid min-w-[700px] grid-cols-7 divide-x">
        {days.map((day) => {
          const dayEvents = eventsForDay(events, day);
          const isToday = isSameDay(day, today);

          return (
            <div key={day.toISOString()} className="min-h-[320px]">
              <button
                type="button"
                onClick={() => onDayClick?.(day)}
                className={cn(
                  "w-full border-b px-2 py-3 text-center text-sm",
                  isToday && "bg-primary/5 font-semibold text-primary"
                )}
              >
                <span className="block text-2xs uppercase text-muted-foreground">
                  {formatDayHeader(day).split(",")[0]}
                </span>
                <span className="text-lg">{day.getDate()}</span>
              </button>
              <div className="space-y-1.5 p-2">
                {dayEvents.map((e) => (
                  <EventChip
                    key={e.id}
                    event={e}
                    compact
                    onClick={() => onEventClick(e)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({
  anchor,
  days,
  events,
  onEventClick,
  onDayClick,
}: {
  anchor: Date;
  days: Date[];
  events: AgendaEventItem[];
  onEventClick: (e: AgendaEventItem) => void;
  onDayClick?: (day: Date) => void;
}) {
  const today = startOfDay(new Date());
  const weekLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="grid grid-cols-7 border-b">
        {weekLabels.map((l) => (
          <div
            key={l}
            className="px-2 py-2 text-center text-2xs font-medium uppercase text-muted-foreground"
          >
            {l}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = eventsForDay(events, day);
          const isCurrentMonth = day.getMonth() === anchor.getMonth();
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick?.(day)}
              className={cn(
                "min-h-[100px] border-b border-r p-1.5 text-left transition-colors hover:bg-muted/30",
                !isCurrentMonth && "bg-muted/10 text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday && "bg-primary text-primary-foreground font-semibold"
                )}
              >
                {day.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEventClick(e);
                    }}
                    className="truncate rounded px-1 py-0.5 text-2xs"
                    style={{
                      backgroundColor: `${AGENDA_EVENT_TYPES.find((t) => t.value === e.type)?.color}22`,
                    }}
                  >
                    {formatTime(new Date(e.startAt))} {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-2xs text-muted-foreground">
                    +{dayEvents.length - 3} mais
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
