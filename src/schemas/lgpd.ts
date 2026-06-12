import { z } from "zod";

export const consentAcceptanceSchema = z.object({
  privacyPolicy: z.literal(true, {
    errorMap: () => ({ message: "Aceite a Política de Privacidade" }),
  }),
  termsOfUse: z.literal(true, {
    errorMap: () => ({ message: "Aceite os Termos de Uso" }),
  }),
  dataProcessing: z.literal(true, {
    errorMap: () => ({ message: "Aceite o tratamento de dados" }),
  }),
  marketing: z.coerce.boolean().optional(),
});

export const deletionRequestSchema = z.object({
  requesterName: z.string().min(3, "Nome obrigatório"),
  requesterEmail: z.string().email("E-mail inválido"),
  requesterPhone: z.string().optional(),
  cpfCnpj: z.string().optional(),
  reason: z.string().min(10, "Descreva o motivo da solicitação").max(2000),
  confirm: z.literal(true, {
    errorMap: () => ({
      message: "Confirme que deseja solicitar a exclusão dos dados",
    }),
  }),
});

export const updateDeletionStatusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum([
    "PENDING",
    "IN_REVIEW",
    "APPROVED",
    "COMPLETED",
    "REJECTED",
  ]),
  adminNotes: z.string().optional(),
});

export const cookieConsentSchema = z.object({
  analytics: z.coerce.boolean().optional(),
});
