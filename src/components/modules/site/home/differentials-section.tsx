import { Card, CardContent } from "@/components/ui/card";
import { DIFFERENTIALS } from "@/constants/home-content";
import { SectionHeader } from "./section-header";

export function DifferentialsSection() {
  return (
    <section id="diferenciais" className="ds-section scroll-mt-20">
      <div className="ds-container">
        <SectionHeader
          overline="Por que nos escolher"
          title="Diferenciais que geram resultados"
          description="Combinamos rigor técnico, atendimento personalizado e tecnologia para oferecer a melhor experiência jurídica."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIALS.map((item) => (
            <Card
              key={item.title}
              variant="interactive"
              className="group h-full"
            >
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/5 transition-colors group-hover:bg-gold/10">
                  <item.icon
                    className="h-5 w-5 text-primary transition-colors group-hover:text-gold"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
