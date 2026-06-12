"use client";

import { useMemo, useState } from "react";
import { DocumentUploadZone } from "@/components/modules/documents/document-upload-zone";
import { DocumentList } from "@/components/modules/documents/document-list";
import { DOCUMENT_TYPE_OPTIONS } from "@/constants/documents";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/lib/documents/queries";
import type { DocumentType } from "@prisma/client";

interface DocumentManagerProps {
  clientId: string;
  documents: DocumentItem[];
  canWrite?: boolean;
  fixedType?: DocumentType;
  showTypeFilter?: boolean;
}

export function DocumentManager({
  clientId,
  documents,
  canWrite = true,
  fixedType,
  showTypeFilter = true,
}: DocumentManagerProps) {
  const [filter, setFilter] = useState<DocumentType | "ALL">(
    fixedType ?? "ALL"
  );

  const filtered = useMemo(() => {
    if (filter === "ALL") return documents;
    return documents.filter((d) => d.documentType === filter);
  }, [documents, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: documents.length };
    for (const opt of DOCUMENT_TYPE_OPTIONS) {
      map[opt.value] = documents.filter(
        (d) => d.documentType === opt.value
      ).length;
    }
    return map;
  }, [documents]);

  return (
    <div className="space-y-6">
      {canWrite && (
        <DocumentUploadZone
          clientId={clientId}
          defaultType={fixedType ?? "RECEIPT"}
        />
      )}

      {showTypeFilter && !fixedType && (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            filter === "ALL"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary/40"
          )}
        >
          Todos ({counts.ALL})
        </button>
        {DOCUMENT_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === opt.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            {opt.label} ({counts[opt.value] ?? 0})
          </button>
        ))}
      </div>
      )}

      <DocumentList
        clientId={clientId}
        documents={filtered}
        canWrite={canWrite}
        emptyMessage={
          filter === "ALL"
            ? "Nenhum documento cadastrado."
            : `Nenhum documento do tipo selecionado.`
        }
      />
    </div>
  );
}
