import type {
  ConsentSubjectType,
  ConsentType,
  DataDeletionStatus,
  LegalDocumentType,
} from "@prisma/client";

export const LEGAL_DOCUMENT_LABELS: Record<LegalDocumentType, string> = {
  PRIVACY_POLICY: "Política de Privacidade",
  TERMS_OF_USE: "Termos de Uso",
};

export const CONSENT_TYPE_LABELS: Record<ConsentType, string> = {
  PRIVACY_POLICY: "Política de Privacidade",
  TERMS_OF_USE: "Termos de Uso",
  DATA_PROCESSING: "Tratamento de dados",
  MARKETING: "Comunicações de marketing",
};

export const CONSENT_SOURCE_LABELS: Record<string, string> = {
  contact_form: "Formulário de contato",
  triage: "Triagem jurídica",
  cookie_banner: "Banner de cookies",
  portal: "Portal do cliente",
  manual: "Registro manual",
};

export const SUBJECT_TYPE_LABELS: Record<ConsentSubjectType, string> = {
  VISITOR: "Visitante",
  LEAD: "Lead",
  CLIENT: "Cliente",
  USER: "Usuário",
};

export const DELETION_STATUS_LABELS: Record<DataDeletionStatus, string> = {
  PENDING: "Pendente",
  IN_REVIEW: "Em análise",
  APPROVED: "Aprovada",
  COMPLETED: "Concluída",
  REJECTED: "Rejeitada",
};

export const DELETION_STATUS_VARIANT: Record<
  DataDeletionStatus,
  "muted" | "default" | "warning" | "success" | "destructive"
> = {
  PENDING: "warning",
  IN_REVIEW: "default",
  APPROVED: "default",
  COMPLETED: "success",
  REJECTED: "destructive",
};

export const LGPD_PUBLIC_LINKS = [
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/termos", label: "Termos de Uso" },
  { href: "/lgpd/exclusao-dados", label: "Exclusão de dados" },
] as const;
