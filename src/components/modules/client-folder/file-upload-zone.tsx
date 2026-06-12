"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  clientId: string;
  type: "document" | "contract" | "procuracao";
  label?: string;
  showTitle?: boolean;
  onUploaded?: () => void;
}

export function FileUploadZone({
  clientId,
  type,
  label = "Clique ou arraste arquivos",
  showTitle = false,
  onUploaded,
}: FileUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected?.length) return;

    setUploading(true);
    setError(null);
    let hadError = false;

    for (const file of Array.from(selected)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      if (showTitle && title.trim()) formData.append("title", title.trim());

      try {
        const res = await fetch(`/api/clientes/${clientId}/arquivos/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erro no upload");
      } catch (err) {
        hadError = true;
        setError(err instanceof Error ? err.message : "Erro no upload");
        break;
      }
    }

    setUploading(false);
    e.target.value = "";
    if (!hadError) {
      setTitle("");
      onUploaded?.();
      window.location.reload();
    }
  }

  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="ds-input-group max-w-sm">
          <Label htmlFor={`title-${type}`} className="text-xs">
            Título do contrato (opcional)
          </Label>
          <Input
            id={`title-${type}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Contrato de honorários"
            inputSize="sm"
            disabled={uploading}
          />
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
          {uploading ? "Enviando..." : label}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          PDF, JPG, PNG ou DOC — máx. 15MB
        </span>
        <input
          type="file"
          className="hidden"
          multiple={type === "document"}
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
