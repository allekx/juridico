"use client";

import { useState, useTransition } from "react";
import {
  FileText,
  Download,
  Trash2,
  Loader2,
  Eye,
  History,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteClientDocumentAction } from "@/actions/client-folder";
import { DocumentPreviewDialog } from "@/components/modules/documents/document-preview-dialog";
import { DocumentUploadZone } from "@/components/modules/documents/document-upload-zone";
import {
  DOCUMENT_TYPE_LABELS,
  isPreviewableMimeType,
} from "@/constants/documents";
import type { DocumentItem, DocumentVersionItem } from "@/lib/documents/queries";

interface DocumentListProps {
  clientId: string;
  documents: DocumentItem[];
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

export function DocumentList({
  clientId,
  documents,
  canWrite = true,
  emptyMessage = "Nenhum documento.",
}: DocumentListProps) {
  const [isPending, startTransition] = useTransition();
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [versionsDoc, setVersionsDoc] = useState<DocumentItem | null>(null);
  const [versions, setVersions] = useState<DocumentVersionItem[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionUploadGroup, setVersionUploadGroup] = useState<string | null>(
    null
  );

  async function openVersions(doc: DocumentItem) {
    setVersionsDoc(doc);
    setLoadingVersions(true);
    try {
      const res = await fetch(
        `/api/clientes/${clientId}/arquivos/${doc.id}/versions`
      );
      const data = await res.json();
      setVersions(data.versions ?? []);
    } finally {
      setLoadingVersions(false);
    }
  }

  if (documents.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-card">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{doc.name}</p>
                  <Badge variant="muted" className="text-2xs">
                    {DOCUMENT_TYPE_LABELS[doc.documentType]}
                  </Badge>
                  {doc.versionCount > 1 && (
                    <Badge variant="outline" className="text-2xs">
                      v{doc.version}
                    </Badge>
                  )}
                  {doc.visibility === "CLIENT" && (
                    <Badge variant="gold" className="text-2xs">
                      Portal
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatSize(doc.fileSize)} · {doc.uploadedByName} ·{" "}
                  {formatDate(doc.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-1">
              {isPreviewableMimeType(doc.mimeType) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewDoc(doc)}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <a
                  href={`/api/clientes/${clientId}/arquivos/${doc.id}/download?type=document`}
                  download
                >
                  <Download className="h-4 w-4" />
                </a>
              </Button>
              {doc.versionCount > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openVersions(doc)}
                >
                  <History className="h-4 w-4" />
                  Versões
                </Button>
              )}
              {canWrite && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setVersionUploadGroup(doc.documentGroupId)
                    }
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm(`Excluir "${doc.name}"?`)) return;
                      startTransition(async () => {
                        await deleteClientDocumentAction(clientId, doc.id);
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
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {previewDoc && (
        <DocumentPreviewDialog
          open={Boolean(previewDoc)}
          onOpenChange={(open) => !open && setPreviewDoc(null)}
          clientId={clientId}
          documentId={previewDoc.id}
          fileName={previewDoc.name}
          mimeType={previewDoc.mimeType}
          downloadHref={`/api/clientes/${clientId}/arquivos/${previewDoc.id}/download?type=document`}
        />
      )}

      {versionsDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-lg border bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Histórico de versões</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVersionsDoc(null)}
              >
                Fechar
              </Button>
            </div>
            {loadingVersions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ul className="space-y-2">
                {versions.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">v{v.version}</span>
                      {v.isLatestVersion && (
                        <Badge variant="success" className="ml-2 text-2xs">
                          Atual
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {v.uploadedByName} · {formatDate(v.createdAt)}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <a
                        href={`/api/clientes/${clientId}/arquivos/${v.id}/download?type=document`}
                        download
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {versionUploadGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Nova versão</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVersionUploadGroup(null)}
              >
                Fechar
              </Button>
            </div>
            <DocumentUploadZone
              clientId={clientId}
              documentGroupId={versionUploadGroup}
              showShareWithClient={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
