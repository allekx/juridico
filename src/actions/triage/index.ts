"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { getPublicOfficeId } from "@/lib/blog/office";
import { TRIAGE_QUESTIONS } from "@/constants/triage-questions";
import { getAreaTitle } from "@/lib/triage/queries";
import {
  triageAreaSchema,
  triageContactSchema,
  triageLawyerSchema,
} from "@/schemas/triage";
import type { PracticeAreaSlug } from "@/constants/practice-areas";
import { notifyNewLead } from "@/lib/notifications/service";
import { createLegalCaseFromTriage } from "@/lib/kanban/create-case-from-triage";
import { recordConsentBundle } from "@/lib/lgpd/consent";
import { getRequestMetadata } from "@/lib/lgpd/request-meta";
import type { ActionResult } from "@/types/auth";

function formatAnswersSummary(
  areaSlug: PracticeAreaSlug,
  answers: { questionLabel: string; answer: string }[]
): string {
  const area = getAreaTitle(areaSlug);
  const lines = answers.map((a) => `• ${a.questionLabel}: ${a.answer}`);
  return `Triagem jurídica — ${area}\n\n${lines.join("\n")}`;
}

export async function startTriageAction(
  practiceAreaSlug: string
): Promise<ActionResult<{ triageId: string }>> {
  const parsed = triageAreaSchema.safeParse({ practiceAreaSlug });
  if (!parsed.success) {
    return { success: false, error: "Área jurídica inválida" };
  }

  try {
    const officeId = await getPublicOfficeId();
    const session = await prisma.triageSession.create({
      data: {
        officeId,
        practiceAreaSlug: parsed.data.practiceAreaSlug,
        currentStep: 2,
      },
    });

    return { success: true, data: { triageId: session.id } };
  } catch {
    return { success: false, error: "Erro ao iniciar triagem" };
  }
}

export async function saveTriageAnswersAction(
  triageId: string,
  answers: Record<string, string>
): Promise<ActionResult> {
  try {
    const officeId = await getPublicOfficeId();
    const session = await prisma.triageSession.findFirst({
      where: { id: triageId, officeId, status: "DRAFT" },
    });

    if (!session) {
      return { success: false, error: "Sessão de triagem não encontrada" };
    }

    const questions =
      TRIAGE_QUESTIONS[session.practiceAreaSlug as PracticeAreaSlug] ?? [];

    for (const q of questions) {
      if (q.required && !answers[q.key]?.trim()) {
        return { success: false, error: `Responda: ${q.label}` };
      }
    }

    await prisma.$transaction([
      prisma.triageAnswer.deleteMany({ where: { triageId } }),
      ...questions
        .filter((q) => answers[q.key]?.trim())
        .map((q) =>
          prisma.triageAnswer.create({
            data: {
              triageId,
              questionKey: q.key,
              questionLabel: q.label,
              answer: answers[q.key].trim(),
            },
          })
        ),
      prisma.triageSession.update({
        where: { id: triageId },
        data: { currentStep: 3 },
      }),
    ]);

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao salvar respostas" };
  }
}

export async function saveTriageContactAction(
  triageId: string,
  data: {
    name: string;
    email: string;
    phone: string;
    cpfCnpj?: string;
    city?: string;
    state?: string;
    additionalNotes?: string;
  }
): Promise<ActionResult> {
  const parsed = triageContactSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const officeId = await getPublicOfficeId();
    const session = await prisma.triageSession.findFirst({
      where: { id: triageId, officeId, status: "DRAFT" },
    });

    if (!session) {
      return { success: false, error: "Sessão não encontrada" };
    }

    await prisma.triageSession.update({
      where: { id: triageId },
      data: {
        ...parsed.data,
        currentStep: 4,
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao salvar dados" };
  }
}

export async function saveTriageLawyerAction(
  triageId: string,
  lawyerId: string
): Promise<ActionResult> {
  const parsed = triageLawyerSchema.safeParse({ lawyerId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const officeId = await getPublicOfficeId();
    const [session, lawyer] = await Promise.all([
      prisma.triageSession.findFirst({
        where: { id: triageId, officeId, status: "DRAFT" },
      }),
      prisma.lawyer.findFirst({
        where: { id: lawyerId, officeId, isPublic: true, deletedAt: null },
      }),
    ]);

    if (!session) return { success: false, error: "Sessão não encontrada" };
    if (!lawyer) return { success: false, error: "Advogado inválido" };

    await prisma.triageSession.update({
      where: { id: triageId },
      data: { lawyerId, currentStep: 6 },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao selecionar advogado" };
  }
}

export async function completeTriageAction(
  triageId: string,
  marketing = false
): Promise<ActionResult<{ leadId: string }>> {
  try {
    const officeId = await getPublicOfficeId();

    const session = await prisma.triageSession.findFirst({
      where: { id: triageId, officeId, status: "DRAFT" },
      include: {
        answers: true,
        documents: true,
        lawyer: { include: { user: true } },
      },
    });

    if (!session) {
      return { success: false, error: "Sessão não encontrada" };
    }

    if (!session.name || !session.email || !session.phone) {
      return { success: false, error: "Dados de contato incompletos" };
    }

    const areaSlug = session.practiceAreaSlug as PracticeAreaSlug;
    const areaTitle = getAreaTitle(areaSlug);

    const answersSummary = formatAnswersSummary(
      areaSlug,
      session.answers.map((a) => ({
        questionLabel: a.questionLabel,
        answer: a.answer,
      }))
    );

    const docList =
      session.documents.length > 0
        ? `\n\nDocumentos anexados:\n${session.documents.map((d) => `• ${d.fileName}`).join("\n")}`
        : "";

    const lawyerNote = session.lawyer
      ? `\n\nAdvogado escolhido: ${session.lawyer.user.name} (OAB/${session.lawyer.oabState} ${session.lawyer.oabNumber})`
      : "";

    const notes = [
      answersSummary,
      session.additionalNotes
        ? `\n\nObservações do cliente:\n${session.additionalNotes}`
        : "",
      docList,
      lawyerNote,
    ].join("");

    const lead = await prisma.$transaction(async (tx) => {
      const newLead = await tx.lead.create({
        data: {
          officeId,
          assignedToId: session.lawyer?.userId ?? null,
          name: session.name!,
          email: session.email,
          phone: session.phone,
          source: "TRIAGE",
          status: "NEW",
          interestArea: areaTitle,
          notes,
        },
      });

      await tx.triageSession.update({
        where: { id: triageId },
        data: {
          status: "COMPLETED",
          leadId: newLead.id,
          completedAt: new Date(),
          currentStep: 6,
        },
      });

      return newLead;
    });

    const requestMeta = await getRequestMetadata();

    try {
      await Promise.all([
        notifyNewLead(officeId, {
          id: lead.id,
          name: lead.name,
          source: lead.source,
          interestArea: lead.interestArea,
          assignedToId: lead.assignedToId,
        }),
        createLegalCaseFromTriage({
          officeId,
          leadId: lead.id,
          name: session.name!,
          email: session.email,
          phone: session.phone,
          cpfCnpj: session.cpfCnpj,
          city: session.city,
          state: session.state,
          areaTitle,
          summary: notes,
          lawyerUserId: session.lawyer?.userId ?? null,
          lawyerRecordId: session.lawyerId,
        }),
        recordConsentBundle({
          officeId,
          subjectType: "LEAD",
          subjectId: lead.id,
          subjectEmail: lead.email,
          subjectName: lead.name,
          source: "triage",
          includeMarketing: true,
          marketingGranted: marketing,
          request: requestMeta,
        }),
      ]);
    } catch (postCompleteError) {
      console.error("[triage] pós-finalização:", postCompleteError);
    }

    try {
      revalidatePath("/dashboard/crm");
      revalidatePath("/dashboard/kanban");
      revalidatePath("/dashboard/admin/lgpd");
    } catch (revalidateError) {
      console.error("[triage] revalidatePath:", revalidateError);
    }

    return { success: true, data: { leadId: lead.id } };
  } catch (error) {
    console.error("completeTriageAction:", error);
    return { success: false, error: "Erro ao finalizar triagem" };
  }
}

export async function skipDocumentsStepAction(
  triageId: string
): Promise<ActionResult> {
  try {
    const officeId = await getPublicOfficeId();
    const session = await prisma.triageSession.findFirst({
      where: { id: triageId, officeId, status: "DRAFT" },
    });

    if (!session) {
      return { success: false, error: "Sessão não encontrada" };
    }

    await prisma.triageSession.update({
      where: { id: triageId },
      data: { currentStep: 5 },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao avançar etapa" };
  }
}

export async function skipLawyerStepAction(
  triageId: string
): Promise<ActionResult> {
  try {
    const officeId = await getPublicOfficeId();
    const session = await prisma.triageSession.findFirst({
      where: { id: triageId, officeId, status: "DRAFT" },
    });

    if (!session) {
      return { success: false, error: "Sessão não encontrada" };
    }

    await prisma.triageSession.update({
      where: { id: triageId },
      data: { currentStep: 6 },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao avançar etapa" };
  }
}
