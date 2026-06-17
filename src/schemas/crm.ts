import { z } from "zod";

export const updateLeadStatusSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum([
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL",
    "NEGOTIATION",
    "CONVERTED",
    "LOST",
  ]),
});

export const updateCaseStatusSchema = z.object({
  caseId: z.string().uuid(),
  statusId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
});

export const createLeadSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().min(8, "Telefone obrigatório"),
  source: z.enum([
    "WEBSITE",
    "REFERRAL",
    "SOCIAL_MEDIA",
    "PHONE",
    "EMAIL",
    "WALK_IN",
    "TRIAGE",
    "OTHER",
  ]),
  interestArea: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
});

export const createCaseSchema = z.object({
  clientName: z.string().min(2, "Nome do cliente obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  cpfCnpj: z.string().optional(),
  title: z.string().min(2, "Título do caso obrigatório"),
  caseType: z.string().min(2, "Tipo do caso obrigatório"),
  description: z.string().optional(),
  lawyerId: z.string().uuid("Advogado obrigatório"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const globalSearchSchema = z.object({
  q: z.string().min(2).max(100),
});
