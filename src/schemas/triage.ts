import { z } from "zod";
import { PRACTICE_AREA_SLUGS } from "@/constants/practice-areas";

export const triageAreaSchema = z.object({
  practiceAreaSlug: z.enum(PRACTICE_AREA_SLUGS),
});

export const triageContactSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido").max(20),
  cpfCnpj: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  additionalNotes: z.string().max(2000).optional(),
});

export const triageLawyerSchema = z.object({
  lawyerId: z.string().uuid("Selecione um advogado"),
});
