"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TriageLawyerOption } from "@/types/triage";

interface LawyerStepProps {
  lawyers: TriageLawyerOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function LawyerStep({ lawyers, selectedId, onSelect }: LawyerStepProps) {
  if (lawyers.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Nenhum advogado disponível no momento. Nossa equipe entrará em contato.
      </p>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
      {lawyers.map((lawyer) => {
        const isSelected = selectedId === lawyer.id;
        const initials = lawyer.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("");

        return (
          <button
            key={lawyer.id}
            type="button"
            onClick={() => onSelect(lawyer.id)}
            className="text-left"
          >
            <Card
              variant="interactive"
              className={cn(
                "h-full",
                isSelected && "border-gold ring-2 ring-gold/30"
              )}
            >
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold">{lawyer.name}</h3>
                    {lawyer.isPartner && (
                      <Badge variant="gold">Sócio</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    OAB/{lawyer.oabState} {lawyer.oabNumber}
                  </p>
                  {lawyer.specialty && (
                    <p className="mt-1 text-sm text-gold">{lawyer.specialty}</p>
                  )}
                  {lawyer.bio && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {lawyer.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
