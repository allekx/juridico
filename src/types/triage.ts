import type { PracticeAreaSlug } from "@/constants/practice-areas";

export type TriageQuestionType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "boolean"
  | "date";

export interface TriageQuestion {
  key: string;
  label: string;
  type: TriageQuestionType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  hint?: string;
}

export type TriageQuestionsMap = Record<PracticeAreaSlug, TriageQuestion[]>;

export interface TriageLawyerOption {
  id: string;
  name: string;
  specialty: string | null;
  oabNumber: string;
  oabState: string;
  bio: string | null;
  isPartner: boolean;
}

export const TRIAGE_STEPS = [
  { step: 1, label: "Área jurídica" },
  { step: 2, label: "Perguntas" },
  { step: 3, label: "Seus dados" },
  { step: 4, label: "Documentos" },
  { step: 5, label: "Advogado" },
  { step: 6, label: "Confirmação" },
] as const;
