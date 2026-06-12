import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllPracticeAreas } from "@/lib/practice-areas";
import { SectionHeader } from "./section-header";

export function PracticeAreasSection() {
  const areas = getAllPracticeAreas();

  return (
    <section
      id="areas"
      className="ds-section scroll-mt-20 border-y border-border/40 bg-muted/20"
    >
      <div className="ds-container">
        <SectionHeader
          overline="Especialidades"
          title="Áreas de atuação"
          description="Equipe multidisciplinar preparada para atuar em demandas complexas com visão estratégica e foco em resultados."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => {
            const Icon = area.icon;
            return (
              <Card key={area.slug} variant="interactive" className="group">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                    <Icon
                      className="h-5 w-5 text-gold"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-display text-lg font-semibold">
                    {area.shortTitle}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {area.banner.subtitle}
                  </p>
                  <Link
                    href={`/areas-de-atuacao/${area.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-gold"
                  >
                    Saiba mais
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/areas-de-atuacao">
              Ver todas as áreas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
