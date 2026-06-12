import { z } from "zod";

export const contractSchema = z.object({
  title: z.string().min(3, "Título obrigatório"),
  content: z.string().min(1, "Conteúdo obrigatório"),
  type: z.enum([
    "FEE_AGREEMENT",
    "SERVICE",
    "POWER_OF_ATTORNEY",
    "NDA",
    "OTHER",
  ]),
  status: z.enum([
    "DRAFT",
    "SENT",
    "SIGNED",
    "ACTIVE",
    "EXPIRED",
    "CANCELLED",
  ]),
  clientId: z.string().uuid("Cliente inválido"),
  caseId: z.string().optional(),
  value: z.coerce.number().min(0).optional(),
  signedAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const generateInstallmentsSchema = z.object({
  contractId: z.string().uuid(),
  count: z.coerce.number().int().min(1).max(60),
  firstDueDate: z.string().min(1, "Data da primeira parcela obrigatória"),
});

export const installmentSchema = z.object({
  contractId: z.string().uuid(),
  number: z.coerce.number().int().min(1),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  dueDate: z.string().min(1, "Vencimento obrigatório"),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  clientId: z.string().uuid("Cliente inválido"),
  direction: z.enum(["RECEIPT", "EXPENSE"]),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]),
  method: z
    .enum([
      "PIX",
      "BANK_TRANSFER",
      "CREDIT_CARD",
      "DEBIT_CARD",
      "CASH",
      "CHECK",
      "BOLETO",
      "OTHER",
    ])
    .optional(),
  dueDate: z.string().min(1, "Vencimento obrigatório"),
  paidAt: z.string().optional(),
  caseId: z.string().optional(),
  contractId: z.string().optional(),
  notes: z.string().optional(),
});

export const markPaidSchema = z.object({
  paidAt: z.string().optional(),
  method: z
    .enum([
      "PIX",
      "BANK_TRANSFER",
      "CREDIT_CARD",
      "DEBIT_CARD",
      "CASH",
      "CHECK",
      "BOLETO",
      "OTHER",
    ])
    .optional(),
});
