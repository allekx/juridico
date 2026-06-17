import { z } from "zod";

export const caseStatusLookupSchema = z.object({
  cpfCnpj: z
    .string()
    .min(11, "Informe um CPF ou CNPJ válido")
    .max(18, "CPF ou CNPJ inválido"),
  reference: z
    .string()
    .min(3, "Informe o número do processo ou protocolo")
    .max(50, "Número muito longo"),
});

export function normalizeDocument(value: string): string {
  return value.replace(/\D/g, "");
}
