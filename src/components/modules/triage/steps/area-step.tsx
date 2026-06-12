"use client";

import { PRACTICE_AREA_SLUGS } from "@/constants/practice-areas";
import { PRACTICE_AREAS_DATA } from "@/constants/practice-areas";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PracticeAreaSlug } from "@/constants/practice-areas";

interface AreaStepProps {
  selected?: PracticeAreaSlug;
  onSelect: (slug: PracticeAreaSlug) => void;
}

export function AreaStep({ selected, onSelect }: AreaStepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {PRACTICE_AREA_SLUGS.map((slug) => {
        const area = PRACTICE_AREAS_DATA[slug];
        const Icon = area.icon;
        const isSelected = selected === slug;

        return (
          <button
            key={slug}
            type="button"
            onClick={() => onSelect(slug)}
            className="text-left"
          >
            <Card
              variant="interactive"
              className={cn(
                "h-full transition-all",
                isSelected && "border-gold ring-2 ring-gold/30"
              )}
            >
              <CardContent className="p-5">
                <Icon className="mb-3 h-6 w-6 text-gold" strokeWidth={1.5} />
                <h3 className="font-display font-semibold">{area.shortTitle}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {area.banner.subtitle}
                </p>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
