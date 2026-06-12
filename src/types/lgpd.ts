import type {
  ConsentSubjectType,
  ConsentType,
  DataDeletionStatus,
  LegalDocumentType,
} from "@prisma/client";

export interface LegalDocumentView {
  id: string;
  type: LegalDocumentType;
  version: number;
  title: string;
  summary: string;
  content: string;
  contentHash: string;
  publishedAt: string | null;
  updatedAt: string;
}

export interface ConsentRecordRow {
  id: string;
  subjectType: ConsentSubjectType;
  subjectName: string | null;
  subjectEmail: string | null;
  consentType: ConsentType;
  granted: boolean;
  source: string;
  documentVersion: number | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface DeletionRequestRow {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  cpfCnpj: string | null;
  reason: string | null;
  status: DataDeletionStatus;
  adminNotes: string | null;
  reviewedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface LegalDocumentListItem {
  id: string;
  type: LegalDocumentType;
  version: number;
  title: string;
  isActive: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface LgpdAdminStats {
  totalConsents: number;
  consentsThisMonth: number;
  pendingDeletions: number;
  activeDocuments: number;
}

export interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}
