import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProcessProgressTimeline } from "@/components/shared/process-progress-timeline";
import { CASE_PRIORITY_LABELS, CASE_PRIORITY_VARIANT } from "@/constants/crm";
import type { PortalCaseProgress } from "@/lib/portal/queries";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

interface CaseProgressCardProps {
  data: PortalCaseProgress;
}

export function CaseProgressCard({ data }: CaseProgressCardProps) {
  const { case: caseItem, steps } = data;

  return (
    <Card variant="default">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold">{caseItem.title}</h3>
            {caseItem.caseNumber && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {caseItem.caseNumber}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {caseItem.caseType} · Dr(a). {caseItem.lawyerName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: caseItem.statusColor }}
              />
              <span className="text-sm font-medium">{caseItem.statusName}</span>
            </div>
            <Badge variant={CASE_PRIORITY_VARIANT[caseItem.priority]}>
              {CASE_PRIORITY_LABELS[caseItem.priority]}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Atualizado em {formatDate(caseItem.updatedAt)}
        </p>
      </CardHeader>
      <CardContent className="pt-5">
        <ProcessProgressTimeline steps={steps} />
      </CardContent>
    </Card>
  );
}
