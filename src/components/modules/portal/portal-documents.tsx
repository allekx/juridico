"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Loader2,
  Eye,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DocumentPreviewDialog } from "@/components/modules/documents/document-preview-dialog";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_OPTIONS,
  isPreviewableMimeType,
} from "@/constants/documents";
import { cn } from "@/lib/utils";
import type { PortalDocumentItem } from "@/lib/portal/queries";
import type { DocumentVersionItem } from "@/lib/documents/queries";
import type { DocumentType } from "@prisma/client";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

interface PortalDocumentsProps {
  documents: PortalDocumentItem[];
}

export function PortalDocuments({ documents }: PortalDocumentsProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("RECEIPT");
  const [previewDoc, setPreviewDoc] = useState<PortalDocumentItem | null>(null);
  const [versions, setVersions] = useState<DocumentVersionItem[]>([]);
  const [showVersions, setShowVersions] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    try {
      const res = await fetch("/api/portal/documentos/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro no upload");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function openVersions(doc: PortalDocumentItem) {
    setShowVersions(doc.id);
    const res = await fetch(`/api/portal/documentos/${doc.id}/versions`);
    const data = await res.json();
    setVersions(data.versions ?? []);
  }

  return (
    <div className="space-y-6">
      <div className="ds-input-group max-w-xs">
        <Label className="text-xs">Tipo de documento</Label>
        <Select
          value={documentType}
          onValueChange={(v) => setDocumentType(v as DocumentType)}
          disabled={uploading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 px-6 py-8 transition-colors hover:border-gold/50",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        <span className="mt-2 text-sm font-medium">
          {uploading ? "Enviando..." : "Enviar documento"}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          PDF, JPG, PNG ou DOC — máx. 15MB
        </span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {documents.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum documento disponível.
        </p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-lg border bg-card">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-gold" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{doc.name}</p>
                    <Badge variant="muted" className="text-2xs">
                      {DOCUMENT_TYPE_LABELS[doc.documentType as DocumentType]}
                    </Badge>
                    {doc.versionCount > 1 && (
                      <Badge variant="outline" className="text-2xs">
                        v{doc.version}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(doc.fileSize)} · {doc.uploadedByName}
                    {doc.isOwnUpload && " (você)"} · {formatDate(doc.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {isPreviewableMimeType(doc.mimeType) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/portal/documentos/${doc.id}/download`} download>
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
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {previewDoc && (
        <DocumentPreviewDialog
          open={Boolean(previewDoc)}
          onOpenChange={(open) => !open && setPreviewDoc(null)}
          clientId=""
          documentId={previewDoc.id}
          fileName={previewDoc.name}
          mimeType={previewDoc.mimeType}
          downloadHref={`/api/portal/documentos/${previewDoc.id}/download`}
          previewBasePath="/api/portal/documentos"
        />
      )}

      {showVersions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Versões do documento</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowVersions(null)}>
                Fechar
              </Button>
            </div>
            <ul className="space-y-2">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>
                    v{v.version}
                    {v.isLatestVersion && (
                      <Badge variant="gold" className="ml-2 text-2xs">
                        Atual
                      </Badge>
                    )}
                  </span>
                  <Button asChild variant="ghost" size="sm">
                    <a href={`/api/portal/documentos/${v.id}/download`} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
