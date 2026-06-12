import type { AppointmentType } from "@prisma/client";

export type CalendarView = "day" | "week" | "month";

export const CALENDAR_VIEWS: { id: CalendarView; label: string }[] = [
  { id: "day", label: "Dia" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mês" },
];

/** Tipos exibidos na agenda jurídica */
export const AGENDA_EVENT_TYPES: {
  value: AppointmentType;
  label: string;
  color: string;
  bgClass: string;
}[] = [
  {
    value: "HEARING",
    label: "Audiência",
    color: "#6366F1",
    bgClass: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30",
  },
  {
    value: "MEETING",
    label: "Reunião",
    color: "#10B981",
    bgClass: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  },
  {
    value: "DEADLINE",
    label: "Prazo",
    color: "#F59E0B",
    bgClass: "bg-amber-500/15 text-amber-800 border-amber-500/30",
  },
  {
    value: "RETURN",
    label: "Retorno",
    color: "#8B5CF6",
    bgClass: "bg-violet-500/15 text-violet-700 border-violet-500/30",
  },
];

export const AGENDA_TYPE_MAP = Object.fromEntries(
  AGENDA_EVENT_TYPES.map((t) => [t.value, t])
) as Record<string, (typeof AGENDA_EVENT_TYPES)[number]>;

export const NOTIFY_OPTIONS = [
  { value: 15, label: "15 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 1440, label: "1 dia antes" },
  { value: 2880, label: "2 dias antes" },
];

export const HOUR_START = 7;
export const HOUR_END = 21;
