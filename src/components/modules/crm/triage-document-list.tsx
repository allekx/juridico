"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TriageDocumentListProps {
  documents: {
    id: string;
    fileName: string;
    sizeLabel: string;
  }[];
}

export function TriageDocumentList({ documents }: TriageDocumentListProps) {
  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2"
        >
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{doc.fileName}</p>
              <p className="text-xs text-muted-foreground">{doc.sizeLabel}</p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={`/api/crm/triage-documents/${doc.id}/download`}>
              <Download className="h-4 w-4" />
              Baixar
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}
