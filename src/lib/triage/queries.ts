import { prisma } from "@/lib/prisma/client";
import { getPublicOfficeId } from "@/lib/blog/office";
import { AREA_TO_SPECIALTY } from "@/constants/triage-questions";
import { PRACTICE_AREAS_DATA } from "@/constants/practice-areas";
import type { PracticeAreaSlug } from "@/constants/practice-areas";
import type { TriageLawyerOption } from "@/types/triage";

export async function getLawyersForTriage(
  practiceAreaSlug: PracticeAreaSlug
): Promise<TriageLawyerOption[]> {
  const officeId = await getPublicOfficeId();
  const keywords = AREA_TO_SPECIALTY[practiceAreaSlug] ?? [];

  const lawyers = await prisma.lawyer.findMany({
    where: {
      officeId,
      isPublic: true,
      deletedAt: null,
      user: { isActive: true, deletedAt: null },
    },
    include: {
      user: { select: { name: true } },
    },
    orderBy: [{ isPartner: "desc" }, { displayOrder: "asc" }],
  });

  const filtered = lawyers.filter((lawyer) => {
    if (!lawyer.specialty) return true;
    const spec = lawyer.specialty.toLowerCase();
    return keywords.some((kw) => spec.includes(kw.toLowerCase()));
  });

  const list = filtered.length > 0 ? filtered : lawyers;

  return list.map((l) => ({
    id: l.id,
    name: l.user.name,
    specialty: l.specialty,
    oabNumber: l.oabNumber,
    oabState: l.oabState,
    bio: l.bio,
    isPartner: l.isPartner,
  }));
}

export function getAreaTitle(slug: PracticeAreaSlug): string {
  return PRACTICE_AREAS_DATA[slug]?.title ?? slug;
}

export async function getTriageSession(id: string) {
  const officeId = await getPublicOfficeId();
  return prisma.triageSession.findFirst({
    where: { id, officeId },
    include: {
      answers: true,
      documents: true,
      lawyer: { include: { user: { select: { name: true } } } },
    },
  });
}
