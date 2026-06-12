import {
  PRACTICE_AREAS_DATA,
  PRACTICE_AREA_SLUGS,
} from "@/constants/practice-areas";
import type { PracticeAreaDetail, PracticeAreaSummary } from "@/types/practice-area";

export function getAllPracticeAreaSlugs(): string[] {
  return [...PRACTICE_AREA_SLUGS];
}

export function getPracticeAreaBySlug(
  slug: string
): PracticeAreaDetail | undefined {
  return PRACTICE_AREAS_DATA[slug as keyof typeof PRACTICE_AREAS_DATA];
}

export function getAllPracticeAreas(): PracticeAreaDetail[] {
  return PRACTICE_AREA_SLUGS.map((slug) => PRACTICE_AREAS_DATA[slug]);
}

export function getPracticeAreaSummaries(): PracticeAreaSummary[] {
  return getAllPracticeAreas().map((area) => ({
    slug: area.slug,
    title: area.title,
    description: area.banner.subtitle,
    icon: area.icon,
  }));
}

export function isValidPracticeAreaSlug(slug: string): boolean {
  return PRACTICE_AREA_SLUGS.includes(slug as (typeof PRACTICE_AREA_SLUGS)[number]);
}
