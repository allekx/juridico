import type { DocumentType } from "@prisma/client";

export const DOCUMENT_TYPE_OPTIONS: {
  value: DocumentType;
  label: string;
  description: string;
}[] = [
  { value: "RG", label: "RG", description: "Documento de identidade" },
  { value: "CPF", label: "CPF", description: "Cadastro de Pessoa Física" },
  {
    value: "POWER_OF_ATTORNEY",
    label: "Procuração",
    description: "Procurações e instrumentos de mandato",
  },
  {
    value: "CONTRACT",
    label: "Contrato",
    description: "Contratos e acordos assinados",
  },
  {
    value: "PETITION",
    label: "Petições",
    description: "Petições e peças processuais",
  },
  {
    value: "RECEIPT",
    label: "Comprovantes",
    description: "Comprovantes e recibos diversos",
  },
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> =
  Object.fromEntries(
    DOCUMENT_TYPE_OPTIONS.map((o) => [o.value, o.label])
  ) as Record<DocumentType, string>;

export const PREVIEWABLE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function isPreviewableMimeType(mimeType: string): boolean {
  return PREVIEWABLE_MIME_TYPES.includes(mimeType);
}
