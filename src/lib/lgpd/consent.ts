import { prisma } from "@/lib/prisma/client";
import { getActiveLegalDocument } from "@/lib/lgpd/queries";
import type { RequestMetadata } from "@/types/lgpd";
import type {
  ConsentSubjectType,
  ConsentType,
  LegalDocumentType,
} from "@prisma/client";

interface RecordConsentInput {
  officeId: string;
  subjectType: ConsentSubjectType;
  subjectId?: string | null;
  subjectEmail?: string | null;
  subjectName?: string | null;
  consentType: ConsentType;
  source: string;
  granted?: boolean;
  metadata?: Record<string, unknown>;
  request?: RequestMetadata;
}

const CONSENT_TO_DOCUMENT: Partial<Record<ConsentType, LegalDocumentType>> = {
  PRIVACY_POLICY: "PRIVACY_POLICY",
  TERMS_OF_USE: "TERMS_OF_USE",
};

export async function recordConsent(input: RecordConsentInput) {
  const docType = CONSENT_TO_DOCUMENT[input.consentType];
  let legalDocumentId: string | null = null;
  let documentVersion: number | null = null;
  let documentHash: string | null = null;

  if (docType) {
    try {
      const doc = await getActiveLegalDocument(input.officeId, docType);
      legalDocumentId = doc.id;
      documentVersion = doc.version;
      documentHash = doc.contentHash;
    } catch {
      // Documento ainda não publicado — registra consentimento sem vínculo
    }
  }

  return prisma.consentRecord.create({
    data: {
      officeId: input.officeId,
      legalDocumentId,
      subjectType: input.subjectType,
      subjectId: input.subjectId ?? null,
      subjectEmail: input.subjectEmail ?? null,
      subjectName: input.subjectName ?? null,
      consentType: input.consentType,
      granted: input.granted ?? true,
      source: input.source,
      documentVersion,
      documentHash,
      ipAddress: input.request?.ipAddress ?? null,
      userAgent: input.request?.userAgent ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}

interface RecordBundleInput {
  officeId: string;
  subjectType: ConsentSubjectType;
  subjectId?: string | null;
  subjectEmail?: string | null;
  subjectName?: string | null;
  source: string;
  includeMarketing?: boolean;
  marketingGranted?: boolean;
  request?: RequestMetadata;
  metadata?: Record<string, unknown>;
}

export async function recordConsentBundle(input: RecordBundleInput) {
  const types: ConsentType[] = [
    "PRIVACY_POLICY",
    "TERMS_OF_USE",
    "DATA_PROCESSING",
  ];

  if (input.includeMarketing) {
    types.push("MARKETING");
  }

  const results = [];

  for (const consentType of types) {
    const granted =
      consentType === "MARKETING"
        ? Boolean(input.marketingGranted)
        : true;

    const record = await recordConsent({
      officeId: input.officeId,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      subjectEmail: input.subjectEmail,
      subjectName: input.subjectName,
      consentType,
      source: input.source,
      granted,
      request: input.request,
      metadata: input.metadata,
    });
    results.push(record);
  }

  return results;
}
