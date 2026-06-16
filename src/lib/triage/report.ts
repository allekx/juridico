import { PRACTICE_AREAS_DATA } from "@/constants/practice-areas";
import { TRIAGE_QUESTIONS } from "@/constants/triage-questions";
import type { PracticeAreaSlug } from "@/constants/practice-areas";
import { getAreaTitle } from "@/lib/triage/queries";

interface TriageAnswerLike {
  questionLabel: string;
  answer: string;
}

interface BuildTriageReportInput {
  practiceAreaSlug: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  cpfCnpj?: string | null;
  city?: string | null;
  state?: string | null;
  additionalNotes?: string | null;
  answers: TriageAnswerLike[];
  lawyerName?: string | null;
  lawyerOab?: string | null;
  documents: { fileName: string }[];
  completedAt?: Date | null;
}

export function buildTriageReportText(input: BuildTriageReportInput): string {
  const areaTitle = getAreaTitle(input.practiceAreaSlug as PracticeAreaSlug);
  const lines: string[] = [
    "RELATÓRIO DE TRIAGEM JURÍDICA",
    "==============================",
    "",
    `Área: ${areaTitle}`,
    `Data: ${(input.completedAt ?? new Date()).toLocaleString("pt-BR")}`,
    "",
    "CONTATO",
    "-------",
    `Nome: ${input.name ?? "—"}`,
    `E-mail: ${input.email ?? "—"}`,
    `Telefone: ${input.phone ?? "—"}`,
  ];

  if (input.cpfCnpj) lines.push(`CPF/CNPJ: ${input.cpfCnpj}`);
  if (input.city || input.state) {
    lines.push(`Local: ${[input.city, input.state].filter(Boolean).join(" / ")}`);
  }

  lines.push("", "RESPOSTAS DA TRIAGEM", "--------------------");
  for (const answer of input.answers) {
    lines.push(`• ${answer.questionLabel}: ${answer.answer}`);
  }

  if (input.additionalNotes?.trim()) {
    lines.push("", "OBSERVAÇÕES", "-----------", input.additionalNotes.trim());
  }

  if (input.lawyerName) {
    lines.push("", "ADVOGADO ESCOLHIDO", "------------------", input.lawyerName);
    if (input.lawyerOab) lines.push(input.lawyerOab);
  }

  lines.push("", "DOCUMENTOS ANEXADOS", "-------------------");
  if (input.documents.length === 0) {
    lines.push("Nenhum documento enviado.");
  } else {
    for (const doc of input.documents) {
      lines.push(`• ${doc.fileName}`);
    }
  }

  return lines.join("\n");
}

export function getTriageQuestionLabels(slug: string) {
  const questions = TRIAGE_QUESTIONS[slug as PracticeAreaSlug] ?? [];
  return Object.fromEntries(questions.map((q) => [q.key, q.label]));
}

export function getTriageAreaTitle(slug: string) {
  return PRACTICE_AREAS_DATA[slug as PracticeAreaSlug]?.title ?? slug;
}
