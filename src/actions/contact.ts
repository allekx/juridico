"use server";

import { getPublicOfficeId } from "@/lib/blog/office";
import { recordConsentBundle } from "@/lib/lgpd/consent";
import { getRequestMetadata } from "@/lib/lgpd/request-meta";
import { contactSchema } from "@/schemas/contact";
import type { ActionResult } from "@/types/auth";

export async function contactAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (formData.get("consent") !== "on") {
    return {
      success: false,
      error: "É necessário aceitar a Política de Privacidade e os Termos de Uso",
    };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    area: formData.get("area"),
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    const officeId = await getPublicOfficeId();
    const requestMeta = await getRequestMetadata();

    await recordConsentBundle({
      officeId,
      subjectType: "VISITOR",
      subjectEmail: parsed.data.email,
      subjectName: parsed.data.name,
      source: "contact_form",
      includeMarketing: formData.get("marketing") === "on",
      marketingGranted: formData.get("marketing") === "on",
      request: requestMeta,
      metadata: { area: parsed.data.area },
    });

    // TODO: integrar com Resend / CRM para envio real
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao enviar mensagem" };
  }
}
