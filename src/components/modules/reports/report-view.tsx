import { PageHeader } from "@/components/ui/typography";
import { ReportSummary } from "@/components/modules/reports/report-summary";
import { ReportFiltersBar } from "@/components/modules/reports/report-filters";
import { ExportCsvButton } from "@/components/modules/reports/export-csv-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportFilters, ReportType } from "@/types/reports";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface ReportViewProps<T extends Record<string, unknown>> {
  title: string;
  description: string;
  type: ReportType;
  filters: ReportFilters;
  summary: { label: string; value: string | number }[];
  rows: T[];
  columns: Column<T>[];
  filterProps?: {
    showLawyer?: boolean;
    showStatus?: boolean;
    statusOptions?: { value: string; label: string }[];
    lawyers?: { id: string; name: string }[];
  };
  extra?: React.ReactNode;
}

export function ReportView<T extends Record<string, unknown>>({
  title,
  description,
  type,
  filters,
  summary,
  rows,
  columns,
  filterProps,
  extra,
}: ReportViewProps<T>) {
  const exportParams: Record<string, string | undefined> = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    q: filters.q,
    lawyerId: filters.lawyerId,
    status: filters.status,
  };

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description}>
        <ExportCsvButton type={type} searchParams={exportParams} />
      </PageHeader>

      <ReportSummary items={summary} />

      {filterProps && (
        <ReportFiltersBar filters={filters} {...filterProps} />
      )}

      {extra}

      <div className="ds-surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground"
                >
                  Nenhum registro encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={(row.id as string) ?? idx}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render
                        ? col.render(row)
                        : String(row[col.key as keyof T] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <p className="border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
          {rows.length} registro{rows.length !== 1 ? "s" : ""}
          {rows.length >= 2000 ? " (limite de exibição atingido)" : ""}
        </p>
      </div>
    </div>
  );
}

interface SourceStatsProps {
  bySource: { source: string; total: number; converted: number; rate: number }[];
  byStatus: { status: string; count: number }[];
}

export function LeadConversionStats({ bySource, byStatus }: SourceStatsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans font-medium">
            Conversão por origem
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Convertidos</TableHead>
                <TableHead>Taxa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bySource.map((s) => (
                <TableRow key={s.source}>
                  <TableCell>{s.source}</TableCell>
                  <TableCell>{s.total}</TableCell>
                  <TableCell>{s.converted}</TableCell>
                  <TableCell>{s.rate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans font-medium">
            Leads por status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byStatus.map((s) => (
                <TableRow key={s.status}>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>{s.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
