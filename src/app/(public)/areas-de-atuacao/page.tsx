import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/modules/site/home/section-header";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/json-ld";
import { getAllPracticeAreas } from "@/lib/practice-areas";

export const metadata = buildMetadata({
  title: "Áreas de Atuação",
  description:
    "Conheça as áreas de atuação do escritório Almeida & Associados. Trabalhista, Previdenciário, Família, Consumidor, Empresarial, Imobiliário, Tributário e Criminal.",
  path: "/areas-de-atuacao",
  keywords: [
    "áreas de atuação advocacia",
    "advogado trabalhista",
    "advogado empresarial",
    "advogado criminal",
    "advogado tributário",
    "advogado de família",
  ],
});

export default function PracticeAreasPage() {
  const areas = getAllPracticeAreas();

  return (
    <>
      <JsonLd
        data={[
          buildWebPageSchema({
            title: "Áreas de Atuação",
            description:
              "Especialidades jurídicas do escritório Almeida & Associados em São Paulo.",
            path: "/areas-de-atuacao",
          }),
          buildBreadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Áreas de Atuação", path: "/areas-de-atuacao" },
          ]),
        ]}
      />
      <section className="border-b border-border/40 bg-gradient-to-b from-muted/30 to-background py-16 md:py-20">
        <div className="ds-container">
          <SectionHeader
            overline="Especialidades"
            title="Áreas de atuação"
            description="Equipe multidisciplinar com expertise em oito áreas do direito, preparada para demandas simples e complexas."
            align="center"
          />
        </div>
      </section>

      <section className="ds-section-sm">
        <div className="ds-container">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {areas.map((area) => {
              const Icon = area.icon;
              return (
                <Card key={area.slug} variant="interactive" className="group h-full">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background transition-colors group-hover:border-gold/30 group-hover:bg-gold-muted/50">
                      <Icon
                        className="h-5 w-5 text-gold"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h2 className="font-display text-lg font-semibold">
                      {area.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
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

          <div className="mt-12 rounded-2xl border border-border bg-muted/30 p-8 text-center md:p-10">
            <h3 className="font-display text-xl font-semibold">
              Não encontrou sua área?
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Entre em contato e descreva sua necessidade. Nossa equipe
              multidisciplinar pode indicar o especialista ideal.
            </p>
            <Button asChild className="mt-6" size="lg">
              <Link href="/#contato">
                Fale conosco
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
