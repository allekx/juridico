import { GitBranch, FileText, MessageSquare, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PortalTimelineItem } from "@/lib/portal/queries";

const TYPE_CONFIG = {
  case_status: { icon: GitBranch, label: "Andamento" },
  document: { icon: FileText, label: "Documento" },
  message: { icon: MessageSquare, label: "Mensagem" },
  case_opened: { icon: Briefcase, label: "Processo" },
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

interface PortalTimelineProps {
  items: PortalTimelineItem[];
}

export function PortalTimeline({ items }: PortalTimelineProps) {
  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhuma atualização registrada ainda.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const config = TYPE_CONFIG[item.type];
        const Icon = config.icon;

        return (
          <div
            key={item.id}
            className="flex gap-4 rounded-lg border border-border/60 bg-card p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="muted" className="text-2xs">
                  {config.label}
                </Badge>
                <time className="text-xs text-muted-foreground">
                  {formatDate(item.date)}
                </time>
              </div>
              <p className="mt-1 font-medium">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
