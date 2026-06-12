import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessTimelineStep } from "@/lib/process-timeline";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

interface ProcessProgressTimelineProps {
  steps: ProcessTimelineStep[];
  compact?: boolean;
  className?: string;
}

export function ProcessProgressTimeline({
  steps,
  compact = false,
  className,
}: ProcessProgressTimelineProps) {
  const completedCount = steps.filter((s) => s.state === "completed").length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={cn("space-y-4", className)}>
      {!compact && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <ol className="relative space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5",
                    step.state === "completed" ? "bg-primary/40" : "bg-border"
                  )}
                  aria-hidden
                />
              )}

              <div className="relative z-10 shrink-0">
                {step.state === "completed" ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                ) : step.state === "current" ? (
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </span>
                  </span>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-background">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={cn(
                    "font-medium leading-tight",
                    step.state === "pending" && "text-muted-foreground",
                    step.state === "current" && "text-primary"
                  )}
                >
                  {step.label}
                </p>

                {!compact && step.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                )}

                {step.state === "completed" && step.completedAt && (
                  <time className="mt-1 block text-xs text-muted-foreground">
                    {formatDate(step.completedAt)}
                  </time>
                )}

                {step.state === "current" && (
                  <span className="mt-1 inline-block text-xs font-medium text-primary">
                    Em andamento
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
