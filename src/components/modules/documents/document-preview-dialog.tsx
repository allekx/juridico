"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isPreviewableMimeType } from "@/constants/documents";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  documentId: string;
  fileName: string;
  mimeType: string;
  downloadHref: string;
  previewBasePath?: string;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  clientId,
  documentId,
  fileName,
  mimeType,
  downloadHref,
  previewBasePath = `/api/clientes/${clientId}/arquivos`,
}: DocumentPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    if (!isPreviewableMimeType(mimeType)) {
      setError("Visualização não disponível para este tipo de arquivo.");
      return;
    }

    let objectUrl: string | null = null;

    async function loadPreview() {
      setLoading(true);
      setError(null);

      try {
        const urlRes = await fetch(
          `${previewBasePath}/${documentId}/preview?mode=url`
        );
        if (urlRes.ok) {
          const data = await urlRes.json();
          if (data.url) {
            setPreviewUrl(data.url);
            return;
          }
        }

        const inlineRes = await fetch(
          `${previewBasePath}/${documentId}/preview`
        );
        if (!inlineRes.ok) {
          const data = await inlineRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Erro ao carregar visualização");
        }

        const blob = await inlineRes.blob();
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar visualização"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPreview();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, documentId, mimeType, previewBasePath]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="flex max-h-[90vh] flex-col">
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={downloadHref} download>
                <Download className="h-4 w-4" />
                Baixar
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="min-h-[50vh] flex-1 overflow-hidden rounded-lg border bg-muted/20">
          {loading && (
            <div className="flex h-full min-h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex h-full min-h-[50vh] items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {error}
            </div>
          )}

          {!loading && !error && previewUrl && mimeType === "application/pdf" && (
            <iframe
              src={previewUrl}
              title={fileName}
              className="h-[70vh] w-full"
            />
          )}

          {!loading && !error && previewUrl && mimeType.startsWith("image/") && (
            <div className="flex h-full min-h-[50vh] items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={fileName}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
