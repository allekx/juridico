"use client";

import { ConsentCheckbox } from "@/components/modules/lgpd/consent-checkbox";
import { PRACTICE_AREAS_DATA } from "@/constants/practice-areas";
import { TRIAGE_QUESTIONS } from "@/constants/triage-questions";
import { Card, CardContent } from "@/components/ui/card";
import type { PracticeAreaSlug } from "@/constants/practice-areas";
import type { ContactFormData } from "./contact-step";
import type { TriageLawyerOption } from "@/types/triage";

interface ConfirmStepProps {
  areaSlug: PracticeAreaSlug;
  answers: Record<string, string>;
  contact: ContactFormData;
  lawyer?: TriageLawyerOption;
  documentCount: number;
}

export function ConfirmStep({
  areaSlug,
  answers,
  contact,
  lawyer,
  documentCount,
}: ConfirmStepProps) {
  const area = PRACTICE_AREAS_DATA[areaSlug];
  const questions = TRIAGE_QUESTIONS[areaSlug] ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Área jurídica
            </p>
            <p className="font-display text-lg font-semibold">{area.title}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Suas respostas
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {questions
                .filter((q) => answers[q.key])
                .map((q) => (
                  <li key={q.key}>
                    <span className="text-muted-foreground">{q.label}:</span>{" "}
                    {answers[q.key]}
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contato
            </p>
            <p className="text-sm">
              {contact.name} — {contact.email} — {contact.phone}
            </p>
          </div>

          {lawyer && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Advogado escolhido
              </p>
              <p className="text-sm font-medium">{lawyer.name}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Documentos
            </p>
            <p className="text-sm">
              {documentCount > 0
                ? `${documentCount} arquivo(s) anexado(s)`
                : "Nenhum documento enviado"}
            </p>
          </div>
        </CardContent>
      </Card>

      <ConsentCheckbox id="triage-consent" name="consent" showMarketing />

      <p className="text-center text-xs text-muted-foreground">
        Ao confirmar, um lead será criado e nossa equipe entrará em contato em até
        24 horas úteis.
      </p>
    </div>
  );
}
