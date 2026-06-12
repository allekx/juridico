import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface PortalStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
}

export function PortalStatCard({ label, value, icon: Icon }: PortalStatCardProps) {
  return (
    <Card variant="elevated">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-muted">
          <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
