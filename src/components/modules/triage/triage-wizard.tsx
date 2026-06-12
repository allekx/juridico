"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Lead } from "@/components/ui/typography";
import { TriageProgress } from "./triage-progress";
import { AreaStep } from "./steps/area-step";
import { QuestionsStep } from "./steps/questions-step";
import { ContactStep, type ContactFormData } from "./steps/contact-step";
import { DocumentsStep } from "./steps/documents-step";
import { LawyerStep } from "./steps/lawyer-step";
import { ConfirmStep } from "./steps/confirm-step";
import {
  startTriageAction,
  saveTriageAnswersAction,
  saveTriageContactAction,
  saveTriageLawyerAction,
  completeTriageAction,
  skipDocumentsStepAction,
  skipLawyerStepAction,
} from "@/actions/triage";
import type { PracticeAreaSlug } from "@/constants/practice-areas";
import type { TriageLawyerOption } from "@/types/triage";

interface TriageWizardProps {
  lawyersByArea: Record<PracticeAreaSlug, TriageLawyerOption[]>;
}

const emptyContact: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  cpfCnpj: "",
  city: "",
  state: "",
  additionalNotes: "",
};

export function TriageWizard({ lawyersByArea }: TriageWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [triageId, setTriageId] = useState<string | null>(null);
  const [areaSlug, setAreaSlug] = useState<PracticeAreaSlug | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState<ContactFormData>(emptyContact);
  const [documents, setDocuments] = useState<
    { id: string; fileName: string; fileSize: number }[]
  >([]);
  const [lawyerId, setLawyerId] = useState<string | null>(null);

  const lawyers = areaSlug ? lawyersByArea[areaSlug] ?? [] : [];
  const selectedLawyer = lawyers.find((l) => l.id === lawyerId);

  const handleContactChange = useCallback(
    (field: keyof ContactFormData, value: string) => {
      setContact((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleAnswerChange = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  async function handleNext() {
    setError(null);
    setLoading(true);

    try {
      if (step === 1) {
        if (!areaSlug) {
          setError("Selecione uma área jurídica");
          return;
        }
        const result = await startTriageAction(areaSlug);
        if (!result.success || !result.data) {
          setError(result.error ?? "Erro ao iniciar");
          return;
        }
        setTriageId(result.data.triageId);
        setStep(2);
      } else if (step === 2 && triageId) {
        const result = await saveTriageAnswersAction(triageId, answers);
        if (!result.success) {
          setError(result.error ?? "Erro ao salvar");
          return;
        }
        setStep(3);
      } else if (step === 3 && triageId) {
        const result = await saveTriageContactAction(triageId, contact);
        if (!result.success) {
          setError(result.error ?? "Erro ao salvar");
          return;
        }
        setStep(4);
      } else if (step === 4 && triageId) {
        await skipDocumentsStepAction(triageId);
        setStep(5);
      } else if (step === 5 && triageId) {
        if (!lawyerId && lawyers.length > 0) {
          setError("Selecione um advogado");
          return;
        }
        if (lawyerId) {
          const result = await saveTriageLawyerAction(triageId, lawyerId);
          if (!result.success) {
            setError(result.error ?? "Erro ao salvar");
            return;
          }
        } else {
          const result = await skipLawyerStepAction(triageId);
          if (!result.success) {
            setError(result.error ?? "Erro ao avançar");
            return;
          }
        }
        setStep(6);
      } else if (step === 6 && triageId) {
        const consentEl = document.getElementById(
          "triage-consent"
        ) as HTMLInputElement | null;
        if (!consentEl?.checked) {
          setError(
            "É necessário aceitar a Política de Privacidade e os Termos de Uso"
          );
          return;
        }

        const marketingEl = document.getElementById(
          "triage-consent-marketing"
        ) as HTMLInputElement | null;

        const result = await completeTriageAction(
          triageId,
          marketingEl?.checked ?? false
        );
        if (!result.success) {
          setError(result.error ?? "Erro ao finalizar");
          return;
        }
        router.push("/triagem/sucesso");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setError(null);
    if (step > 1) setStep(step - 1);
  }

  const stepTitles: Record<number, { title: string; description: string }> = {
    1: {
      title: "Qual área jurídica?",
      description: "Selecione a área que melhor descreve sua necessidade.",
    },
    2: {
      title: "Conte-nos sobre seu caso",
      description: "Responda às perguntas para entendermos sua situação.",
    },
    3: {
      title: "Seus dados de contato",
      description: "Como podemos entrar em contato com você?",
    },
    4: {
      title: "Documentos",
      description: "Anexe documentos que ajudem na análise do caso.",
    },
    5: {
      title: "Escolha seu advogado",
      description: "Selecione o especialista que irá atender você.",
    },
    6: {
      title: "Confirme sua triagem",
      description: "Revise as informações antes de enviar.",
    },
  };

  const current = stepTitles[step];

  return (
    <div>
      <TriageProgress currentStep={step} />

      <div className="mb-8 text-center">
        <Heading className="text-2xl md:text-3xl">{current.title}</Heading>
        <Lead className="mt-2">{current.description}</Lead>
      </div>

      {error && (
        <div className="mx-auto mb-6 max-w-2xl rounded-md border border-destructive/20 bg-destructive/5 p-3 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-10">
        {step === 1 && (
          <AreaStep
            selected={areaSlug ?? undefined}
            onSelect={setAreaSlug}
          />
        )}
        {step === 2 && areaSlug && (
          <QuestionsStep
            areaSlug={areaSlug}
            answers={answers}
            onChange={handleAnswerChange}
          />
        )}
        {step === 3 && (
          <ContactStep data={contact} onChange={handleContactChange} />
        )}
        {step === 4 && triageId && (
          <DocumentsStep
            triageId={triageId}
            files={documents}
            onFilesChange={setDocuments}
          />
        )}
        {step === 5 && (
          <LawyerStep
            lawyers={lawyers}
            selectedId={lawyerId ?? undefined}
            onSelect={setLawyerId}
          />
        )}
        {step === 6 && areaSlug && (
          <ConfirmStep
            areaSlug={areaSlug}
            answers={answers}
            contact={contact}
            lawyer={selectedLawyer}
            documentCount={documents.length}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={step === 1 || loading}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Button type="button" onClick={handleNext} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {step === 6 ? "Confirmar e enviar" : step === 4 ? "Continuar" : "Próximo"}
          {step < 6 && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
