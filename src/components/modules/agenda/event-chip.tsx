import { cn } from "@/lib/utils";
import { AGENDA_TYPE_MAP } from "@/constants/agenda";
import { formatTime } from "@/lib/agenda/date-utils";
import type { AgendaEventItem } from "@/lib/agenda/queries";

interface EventChipProps {
  event: AgendaEventItem;
  compact?: boolean;
  onClick?: () => void;
}

export function EventChip({ event, compact, onClick }: EventChipProps) {
  const config = AGENDA_TYPE_MAP[event.type];
  const start = new Date(event.startAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-md border px-2 py-1.5 text-left transition-opacity hover:opacity-90",
        config?.bgClass ?? "bg-muted text-foreground border-border",
        compact && "py-1"
      )}
    >
      <p className={cn("truncate font-medium", compact ? "text-2xs" : "text-xs")}>
        {event.title}
      </p>
      {!compact && (
        <p className="text-2xs text-muted-foreground">
          {formatTime(start)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
      )}
    </button>
  );
}
