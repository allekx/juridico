import { TriageWizard } from "@/components/modules/triage/triage-wizard";
import { PRACTICE_AREA_SLUGS } from "@/constants/practice-areas";
import { getLawyersForTriage } from "@/lib/triage/queries";
import type { PracticeAreaSlug } from "@/constants/practice-areas";
import type { TriageLawyerOption } from "@/types/triage";
import { Overline, Display, Lead } from "@/components/ui/typography";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/json-ld";

export const metadata = buildMetadata({
  title: "Triagem Jurídica Online",
  description:
    "Faça sua triagem jurídica online gratuita. Responda perguntas, envie documentos e receba orientação de um advogado especialista em São Paulo.",
  path: "/triagem",
  keywords: [
    "triagem jurídica",
    "consulta advogado online",
    "orientação jurídica gratuita",
    "advogado são paulo",
  ],
});

export default async function TriagePage() {
  const lawyersByArea: Record<PracticeAreaSlug, TriageLawyerOption[]> =
    {} as Record<PracticeAreaSlug, TriageLawyerOption[]>;

  await Promise.all(
    PRACTICE_AREA_SLUGS.map(async (slug) => {
      try {
        lawyersByArea[slug] = await getLawyersForTriage(slug);
      } catch {
        lawyersByArea[slug] = [];
      }
    })
  );

  return (
    <>
      <JsonLd
        data={[
          buildWebPageSchema({
            title: "Triagem Jurídica Online",
            description:
              "Triagem jurídica online com orientação de advogados especialistas.",
            path: "/triagem",
          }),
          buildBreadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Triagem Jurídica", path: "/triagem" },
          ]),
        ]}
      />
      <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="ds-container text-center">
          <Overline className="mb-3 block">Atendimento inteligente</Overline>
          <Display className="text-3xl md:text-4xl">Triagem Jurídica</Display>
          <Lead className="mx-auto mt-4 max-w-2xl">
            Em poucos minutos, entendemos seu caso, coletamos informações e
            conectamos você ao advogado ideal.
          </Lead>
        </div>
      </section>

      <section className="ds-section-sm">
        <div className="ds-container">
          <TriageWizard lawyersByArea={lawyersByArea} />
        </div>
      </section>
    </>
  );
}
