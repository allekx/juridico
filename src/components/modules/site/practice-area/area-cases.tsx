import { Scale } from "lucide-react";
import { SectionHeader } from "@/components/modules/site/home/section-header";
import type { PracticeAreaDetail } from "@/types/practice-area";

interface AreaCasesProps {
  area: PracticeAreaDetail;
}

export function AreaCases({ area }: AreaCasesProps) {
  return (
    <section className="ds-section-sm">
      <div className="ds-container">
        <SectionHeader title={area.cases.title} align="center" />

        <div className="mx-auto grid max-w-3xl gap-3">
          {area.cases.items.map((caseItem) => (
            <div
              key={caseItem}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-card px-5 py-4 shadow-xs transition-colors hover:border-gold/30"
            >
              <Scale
                className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                strokeWidth={1.5}
              />
              <span className="text-sm leading-relaxed">{caseItem}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
