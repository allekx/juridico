import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CASE_PRIORITY_LABELS, CASE_PRIORITY_VARIANT } from "@/constants/crm";
import type { PortalCaseItem } from "@/lib/portal/queries";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

interface CaseListProps {
  cases: PortalCaseItem[];
  emptyMessage?: string;
}

export function CaseList({
  cases,
  emptyMessage = "Nenhum processo encontrado.",
}: CaseListProps) {
  if (cases.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {cases.map((c) => (
        <Card key={c.id} variant="default">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-medium">{c.title}</h3>
                {c.caseNumber && (
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {c.caseNumber}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.caseType} · Dr(a). {c.lawyerName}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: c.statusColor }}
                  />
                  <span className="text-sm font-medium">{c.statusName}</span>
                </div>
                <Badge variant={CASE_PRIORITY_VARIANT[c.priority]}>
                  {CASE_PRIORITY_LABELS[c.priority]}
                </Badge>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Atualizado em {formatDate(c.updatedAt)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
