"use client";

import { useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
}

interface DocumentsStepProps {
  triageId: string;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

export function DocumentsStep({
  triageId,
  files,
  onFilesChange,
}: DocumentsStepProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected?.length) return;

    setUploading(true);
    setError(null);

    for (const file of Array.from(selected)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`/api/triage/${triageId}/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Erro no upload");
        }

        onFilesChange([
          ...files,
          {
            id: data.id,
            fileName: data.fileName,
            fileSize: data.fileSize,
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro no upload");
        break;
      }
    }

    setUploading(false);
    e.target.value = "";
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Envie documentos relevantes (contratos, notificações, petições, prints).
        PDF, JPG, PNG ou DOC — máximo 10MB por arquivo.
      </p>

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-12 transition-colors hover:border-gold/50 hover:bg-gold-muted/20",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        )}
        <span className="mt-3 text-sm font-medium">
          {uploading ? "Enviando..." : "Clique ou arraste arquivos"}
        </span>
        <input
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between rounded-md border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gold" />
                <div>
                  <p className="text-sm font-medium">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.fileSize)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Esta etapa é opcional. Você pode pular e enviar documentos depois.
      </p>
    </div>
  );
}
