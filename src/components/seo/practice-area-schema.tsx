import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBreadcrumbSchema,
  buildPracticeAreaFaqSchema,
  buildPracticeAreaSchema,
} from "@/lib/seo/json-ld";
import type { PracticeAreaDetail } from "@/types/practice-area";

interface PracticeAreaSchemaProps {
  area: PracticeAreaDetail;
}

export function PracticeAreaSchema({ area }: PracticeAreaSchemaProps) {
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Início", path: "/" },
    { name: "Áreas de Atuação", path: "/areas-de-atuacao" },
    { name: area.title, path: `/areas-de-atuacao/${area.slug}` },
  ]);

  const schemas = [
    buildPracticeAreaSchema(area),
    breadcrumbs,
    buildPracticeAreaFaqSchema(area),
  ].filter(Boolean) as Record<string, unknown>[];

  return <JsonLd data={schemas} />;
}
