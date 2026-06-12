import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .max(20, "Telefone inválido"),
  area: z.string().min(1, "Selecione uma área de interesse"),
  message: z
    .string()
    .min(10, "Mensagem deve ter no mínimo 10 caracteres")
    .max(1000, "Mensagem muito longa"),
});

export type ContactInput = z.infer<typeof contactSchema>;
