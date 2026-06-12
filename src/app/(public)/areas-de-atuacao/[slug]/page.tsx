import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PracticeAreaTemplate } from "@/components/modules/site/practice-area";
import { PracticeAreaSchema } from "@/components/seo/practice-area-schema";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  getAllPracticeAreaSlugs,
  getPracticeAreaBySlug,
  isValidPracticeAreaSlug,
} from "@/lib/practice-areas";

interface PracticeAreaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPracticeAreaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PracticeAreaPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isValidPracticeAreaSlug(slug)) {
    return { title: "Área não encontrada" };
  }

  const area = getPracticeAreaBySlug(slug)!;

  return buildMetadata({
    title: area.title,
    description: area.metaDescription,
    path: `/areas-de-atuacao/${slug}`,
    keywords: [
      area.shortTitle,
      `advogado ${area.shortTitle.toLowerCase()}`,
      "advocacia são paulo",
      "consulta jurídica",
    ],
  });
}

export default async function PracticeAreaPage({ params }: PracticeAreaPageProps) {
  const { slug } = await params;

  if (!isValidPracticeAreaSlug(slug)) {
    notFound();
  }

  const area = getPracticeAreaBySlug(slug);

  if (!area) {
    notFound();
  }

  return (
    <>
      <PracticeAreaSchema area={area} />
      <PracticeAreaTemplate area={area} />
    </>
  );
}
