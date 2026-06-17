"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DOCUMENT_TYPE_OPTIONS } from "@/constants/documents";
import type { DocumentType } from "@prisma/client";

interface DocumentUploadZoneProps {
  clientId: string;
  documentGroupId?: string;
  defaultType?: DocumentType;
  label?: string;
  showShareWithClient?: boolean;
  onUploaded?: () => void;
}

export function DocumentUploadZone({
  clientId,
  documentGroupId,
  defaultType = "RECEIPT",
  label,
  showShareWithClient = true,
  onUploaded,
}: DocumentUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>(defaultType);
  const [shareWithClient, setShareWithClient] = useState(false);

  const isNewVersion = Boolean(documentGroupId);
  const uploadLabel =
    label ??
    (isNewVersion ? "Enviar nova versão" : "Clique ou arraste arquivos");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected?.length) return;

    setUploading(true);
    setError(null);

    for (const file of Array.from(selected)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "document");
      formData.append("documentType", documentType);
      if (documentGroupId) formData.append("documentGroupId", documentGroupId);
      if (shareWithClient) formData.append("visibility", "CLIENT");

      try {
        const res = await fetch(`/api/clientes/${clientId}/arquivos/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erro no upload");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro no upload");
        setUploading(false);
        e.target.value = "";
        return;
      }
    }

    setUploading(false);
    e.target.value = "";
    onUploaded?.();
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      {!isNewVersion && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="ds-input-group">
            <Label className="text-xs">Tipo de documento</Label>
            <Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              disabled={uploading}
            >
              {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {showShareWithClient && (
            <label className="flex items-end gap-2 pb-2 text-sm">
              <Input
                type="checkbox"
                className="h-4 w-4"
                checked={shareWithClient}
                onChange={(e) => setShareWithClient(e.target.checked)}
                disabled={uploading}
              />
              Compartilhar com o cliente no portal
            </label>
          )}
        </div>
      )}

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 px-6 py-8 transition-colors hover:border-gold/50 hover:bg-gold-muted/10",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
        )}
        <span className="mt-2 text-sm font-medium">
          {uploading ? "Enviando..." : uploadLabel}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          PDF, JPG, PNG ou DOC | máx. 15MB · Supabase Storage
        </span>
        <input
          type="file"
          className="hidden"
          multiple={!isNewVersion}
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
