import {
  Briefcase,
  UserPlus,
  GitBranch,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CrmHistoryItem } from "@/types/crm";

const TYPE_CONFIG = {
  case_status: {
    icon: GitBranch,
    label: "Status",
    variant: "default" as const,
  },
  lead_created: {
    icon: UserPlus,
    label: "Lead",
    variant: "gold" as const,
  },
  case_opened: {
    icon: Briefcase,
    label: "Caso",
    variant: "success" as const,
  },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

interface HistoryTimelineProps {
  items: CrmHistoryItem[];
}

export function HistoryTimeline({ items }: HistoryTimelineProps) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nenhuma atividade registrada.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

      {items.map((item) => {
        const config = TYPE_CONFIG[item.type];
        const Icon = config.icon;

        return (
          <div key={item.id} className="relative flex gap-4 pb-6">
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card">
              <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            </div>

            <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={config.variant} className="text-2xs">
                      {config.label}
                    </Badge>
                    {item.meta?.statusColor && (
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.meta.statusColor }}
                      />
                    )}
                  </div>
                  <h3 className="mt-1 font-medium">{item.title}</h3>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </time>
              </div>

              {item.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}

              <p className="mt-2 text-xs text-muted-foreground">
                por {item.actorName}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
