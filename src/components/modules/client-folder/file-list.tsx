"use client";

import { useTransition } from "react";
import { FileText, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteClientDocumentAction } from "@/actions/client-folder";
import type { ClientFileItem } from "@/types/client-folder";

interface FileListProps {
  clientId: string;
  files: ClientFileItem[];
  canWrite?: boolean;
  emptyMessage?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function FileList({
  clientId,
  files,
  canWrite = true,
  emptyMessage = "Nenhum arquivo.",
}: FileListProps) {
  const [isPending, startTransition] = useTransition();

  if (files.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-card">
      {files.map((file) => (
        <li
          key={file.id}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-gold" />
            <div className="min-w-0">
              <p className="truncate font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.fileSize)} · {file.uploadedByName} ·{" "}
                {formatDate(file.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-1">
            <Button asChild variant="ghost" size="sm">
              <a
                href={`/api/clientes/${clientId}/arquivos/${file.id}/download?type=document`}
                download
              >
                <Download className="h-4 w-4" />
              </a>
            </Button>
            {canWrite && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  if (!confirm(`Excluir "${file.name}"?`)) return;
                  startTransition(async () => {
                    await deleteClientDocumentAction(clientId, file.id);
                    window.location.reload();
                  });
                }}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
