"use server";

import { lookupPublicCaseProgress } from "@/lib/portal/public-lookup";
import { caseStatusLookupSchema } from "@/schemas/portal";
import type { PortalCaseProgress } from "@/lib/portal/queries";
import type { ActionResult } from "@/types/auth";

export async function lookupCaseStatusAction(
  _prev: ActionResult<{ progress: PortalCaseProgress }> | null,
  formData: FormData
): Promise<ActionResult<{ progress: PortalCaseProgress }>> {
  const parsed = caseStatusLookupSchema.safeParse({
    cpfCnpj: formData.get("cpfCnpj"),
    reference: formData.get("reference"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    const progress = await lookupPublicCaseProgress(
      parsed.data.cpfCnpj,
      parsed.data.reference
    );

    if (!progress) {
      return {
        success: false,
        error:
          "Não encontramos um processo com esses dados. Verifique o CPF/CNPJ e o número informado pelo escritório.",
      };
    }

    return { success: true, data: { progress } };
  } catch {
    return {
      success: false,
      error: "Não foi possível consultar o andamento. Tente novamente em instantes.",
    };
  }
}
