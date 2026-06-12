import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/modules/site/home/section-header";
import type { PracticeAreaDetail } from "@/types/practice-area";

interface AreaBenefitsProps {
  area: PracticeAreaDetail;
}

export function AreaBenefits({ area }: AreaBenefitsProps) {
  return (
    <section className="ds-section-sm border-y border-border/40 bg-muted/20">
      <div className="ds-container">
        <SectionHeader title={area.benefits.title} align="center" />

        <div className="grid gap-5 sm:grid-cols-2">
          {area.benefits.items.map((benefit) => (
            <Card key={benefit.title} variant="elevated">
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                  <CheckCircle2
                    className="h-5 w-5 text-gold"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    {benefit.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
