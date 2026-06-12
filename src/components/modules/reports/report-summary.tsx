import { Card, CardContent } from "@/components/ui/card";
import type { ReportSummaryItem } from "@/types/reports";

interface ReportSummaryProps {
  items: ReportSummaryItem[];
}

export function ReportSummary({ items }: ReportSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} variant="elevated">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="font-display text-xl font-semibold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
