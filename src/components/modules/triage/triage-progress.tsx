import { cn } from "@/lib/utils";
import { TRIAGE_STEPS } from "@/types/triage";
import { Check } from "lucide-react";

interface TriageProgressProps {
  currentStep: number;
}

export function TriageProgress({ currentStep }: TriageProgressProps) {
  return (
    <nav aria-label="Progresso da triagem" className="mb-10">
      <ol className="flex flex-wrap items-center justify-center gap-2 md:gap-0">
        {TRIAGE_STEPS.map((item, index) => {
          const isCompleted = currentStep > item.step;
          const isCurrent = currentStep === item.step;

          return (
            <li key={item.step} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isCompleted && "border-gold bg-gold text-gold-foreground",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    !isCompleted && !isCurrent && "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    item.step
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-xs sm:block",
                    isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </div>
              {index < TRIAGE_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 hidden h-0.5 w-8 md:block lg:w-12",
                    isCompleted ? "bg-gold" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
