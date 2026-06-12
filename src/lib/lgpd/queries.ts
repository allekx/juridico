import { prisma } from "@/lib/prisma/client";
import { LEGAL_DOCUMENT_TEMPLATES } from "@/lib/lgpd/templates";
import { hashContent } from "@/lib/lgpd/hash";
import type {
  ConsentRecordRow,
  DeletionRequestRow,
  LegalDocumentListItem,
  LegalDocumentView,
  LgpdAdminStats,
} from "@/types/lgpd";
import type { LegalDocumentType } from "@prisma/client";

function templateFallback(type: LegalDocumentType): LegalDocumentView {
  const template = LEGAL_DOCUMENT_TEMPLATES[type];
  const content = template.content;

  return {
    id: `template-${type}`,
    type,
    version: 1,
    title: template.title,
    summary: template.summary,
    content,
    contentHash: hashContent(content),
    publishedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

export async function getActiveLegalDocument(
  officeId: string,
  type: LegalDocumentType
): Promise<LegalDocumentView> {
  const doc = await prisma.legalDocument.findFirst({
    where: { officeId, type, isActive: true },
    orderBy: { version: "desc" },
  });

  if (!doc) {
    return templateFallback(type);
  }

  return {
    id: doc.id,
    type: doc.type,
    version: doc.version,
    title: doc.title,
    summary: doc.summary ?? "",
    content: doc.content,
    contentHash: doc.contentHash,
    publishedAt: doc.publishedAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getLegalDocumentsList(
  officeId: string
): Promise<LegalDocumentListItem[]> {
  const docs = await prisma.legalDocument.findMany({
    where: { officeId },
    orderBy: [{ type: "asc" }, { version: "desc" }],
  });

  return docs.map((d) => ({
    id: d.id,
    type: d.type,
    version: d.version,
    title: d.title,
    isActive: d.isActive,
    publishedAt: d.publishedAt?.toISOString() ?? null,
    updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function getConsentHistory(
  officeId: string,
  limit = 100
): Promise<ConsentRecordRow[]> {
  const records = await prisma.consentRecord.findMany({
    where: { officeId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return records.map((r) => ({
    id: r.id,
    subjectType: r.subjectType,
    subjectName: r.subjectName,
    subjectEmail: r.subjectEmail,
    consentType: r.consentType,
    granted: r.granted,
    source: r.source,
    documentVersion: r.documentVersion,
    ipAddress: r.ipAddress,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getDeletionRequests(
  officeId: string,
  limit = 100
): Promise<DeletionRequestRow[]> {
  const requests = await prisma.dataDeletionRequest.findMany({
    where: { officeId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return requests.map((r) => ({
    id: r.id,
    requesterName: r.requesterName,
    requesterEmail: r.requesterEmail,
    requesterPhone: r.requesterPhone,
    cpfCnpj: r.cpfCnpj,
    reason: r.reason,
    status: r.status,
    adminNotes: r.adminNotes,
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
    completedAt: r.completedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getLgpdAdminStats(
  officeId: string
): Promise<LgpdAdminStats> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [totalConsents, consentsThisMonth, pendingDeletions, activeDocuments] =
    await Promise.all([
      prisma.consentRecord.count({ where: { officeId } }),
      prisma.consentRecord.count({
        where: { officeId, createdAt: { gte: monthStart } },
      }),
      prisma.dataDeletionRequest.count({
        where: {
          officeId,
          status: { in: ["PENDING", "IN_REVIEW", "APPROVED"] },
        },
      }),
      prisma.legalDocument.count({
        where: { officeId, isActive: true },
      }),
    ]);

  return {
    totalConsents,
    consentsThisMonth,
    pendingDeletions,
    activeDocuments,
  };
}
