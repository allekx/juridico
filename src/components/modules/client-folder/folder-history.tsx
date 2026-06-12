import { Upload, Download, Trash2, FileSignature, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FOLDER_ACTION_LABELS } from "@/constants/client-folder";
import type { ClientFolderEventItem } from "@/types/client-folder";
import type { ClientFolderAction } from "@prisma/client";

const ACTION_ICONS: Record<ClientFolderAction, typeof Upload> = {
  FILE_UPLOADED: Upload,
  FILE_DOWNLOADED: Download,
  FILE_DELETED: Trash2,
  FILE_VERSIONED: Upload,
  CONTRACT_CREATED: FileSignature,
  CONTRACT_DELETED: Trash2,
  MESSAGE_SENT: MessageSquare,
};

const ACTION_VARIANTS: Record<
  ClientFolderAction,
  "default" | "success" | "warning" | "destructive" | "muted" | "gold"
> = {
  FILE_UPLOADED: "success",
  FILE_DOWNLOADED: "default",
  FILE_DELETED: "destructive",
  FILE_VERSIONED: "gold",
  CONTRACT_CREATED: "gold",
  CONTRACT_DELETED: "destructive",
  MESSAGE_SENT: "default",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface FolderHistoryProps {
  events: ClientFolderEventItem[];
}

export function FolderHistory({ events }: FolderHistoryProps) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma atividade registrada.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

      {events.map((event) => {
        const Icon = ACTION_ICONS[event.action];
        const variant = ACTION_VARIANTS[event.action];

        return (
          <div key={event.id} className="relative flex gap-4 pb-5">
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card">
              <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={variant} className="text-2xs">
                  {FOLDER_ACTION_LABELS[event.action]}
                </Badge>
                <time className="text-xs text-muted-foreground">
                  {formatDate(event.createdAt)}
                </time>
              </div>
              <p className="mt-1 text-sm font-medium">{event.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                por {event.actorName}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
