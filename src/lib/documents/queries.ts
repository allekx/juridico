import { prisma } from "@/lib/prisma/client";
import type { DocumentType } from "@prisma/client";

export interface DocumentItem {
  id: string;
  documentGroupId: string;
  name: string;
  description: string | null;
  mimeType: string;
  fileSize: number;
  documentType: DocumentType;
  version: number;
  isLatestVersion: boolean;
  visibility: string;
  uploadedByName: string;
  createdAt: string;
  versionCount: number;
}

export interface DocumentVersionItem {
  id: string;
  version: number;
  name: string;
  mimeType: string;
  fileSize: number;
  isLatestVersion: boolean;
  uploadedByName: string;
  createdAt: string;
}

export async function getClientDocuments(
  officeId: string,
  clientId: string,
  options?: { documentType?: DocumentType; latestOnly?: boolean }
): Promise<DocumentItem[]> {
  const latestOnly = options?.latestOnly ?? true;

  const documents = await prisma.document.findMany({
    where: {
      officeId,
      clientId,
      deletedAt: null,
      isTemplate: false,
      ...(options?.documentType && { documentType: options.documentType }),
      ...(latestOnly && { isLatestVersion: true }),
    },
    include: { uploadedBy: { select: { name: true } } },
    orderBy: [{ documentType: "asc" }, { createdAt: "desc" }],
  });

  const groupIds = [...new Set(documents.map((d) => d.documentGroupId))];
  const versionCounts = groupIds.length
    ? await prisma.document.groupBy({
        by: ["documentGroupId"],
        where: {
          documentGroupId: { in: groupIds },
          deletedAt: null,
        },
        _count: { id: true },
      })
    : [];

  const countMap = Object.fromEntries(
    versionCounts.map((v) => [v.documentGroupId, v._count.id])
  );

  return documents.map((d) => ({
    id: d.id,
    documentGroupId: d.documentGroupId,
    name: d.name,
    description: d.description,
    mimeType: d.mimeType,
    fileSize: d.fileSize,
    documentType: d.documentType,
    version: d.version,
    isLatestVersion: d.isLatestVersion,
    visibility: d.visibility,
    uploadedByName: d.uploadedBy.name,
    createdAt: d.createdAt.toISOString(),
    versionCount: countMap[d.documentGroupId] ?? 1,
  }));
}

export async function getDocumentVersions(
  officeId: string,
  clientId: string,
  documentGroupId: string
): Promise<DocumentVersionItem[]> {
  const versions = await prisma.document.findMany({
    where: {
      officeId,
      clientId,
      documentGroupId,
      deletedAt: null,
    },
    include: { uploadedBy: { select: { name: true } } },
    orderBy: { version: "desc" },
  });

  return versions.map((v) => ({
    id: v.id,
    version: v.version,
    name: v.name,
    mimeType: v.mimeType,
    fileSize: v.fileSize,
    isLatestVersion: v.isLatestVersion,
    uploadedByName: v.uploadedBy.name,
    createdAt: v.createdAt.toISOString(),
  }));
}

export async function getDocumentTypeCounts(
  officeId: string,
  clientId: string
): Promise<Record<DocumentType, number>> {
  const counts = await prisma.document.groupBy({
    by: ["documentType"],
    where: {
      officeId,
      clientId,
      deletedAt: null,
      isTemplate: false,
      isLatestVersion: true,
    },
    _count: { id: true },
  });

  const result = {
    RG: 0,
    CPF: 0,
    POWER_OF_ATTORNEY: 0,
    CONTRACT: 0,
    PETITION: 0,
    RECEIPT: 0,
  } satisfies Record<DocumentType, number>;

  for (const row of counts) {
    result[row.documentType] = row._count.id;
  }

  return result;
}
