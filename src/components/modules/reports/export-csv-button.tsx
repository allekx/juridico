"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPORT_TYPE_LABELS } from "@/constants/reports";
import type { ReportType } from "@/types/reports";

interface ExportCsvButtonProps {
  type: ReportType;
  searchParams: Record<string, string | undefined>;
}

export function ExportCsvButton({ type, searchParams }: ExportCsvButtonProps) {
  const params = new URLSearchParams({ type, ...searchParams });
  const href = `/api/relatorios/export?${params.toString()}`;
  const label = REPORT_TYPE_LABELS[type];

  return (
    <Button asChild variant="outline" size="sm">
      <a href={href} download>
        <Download className="h-4 w-4" />
        Exportar CSV
      </a>
    </Button>
  );
}
