"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requirePortalClient } from "@/lib/portal/session";
import { logFolderEvent } from "@/lib/client-folder/queries";
import type { ActionResult } from "@/types/auth";

export async function sendPortalMessageAction(
  body: string,
  subject?: string
): Promise<ActionResult> {
  const { user, client } = await requirePortalClient();

  if (!body.trim()) {
    return { success: false, error: "Mensagem obrigatória" };
  }

  try {
    const message = await prisma.clientMessage.create({
      data: {
        officeId: user.officeId,
        clientId: client.id,
        authorId: user.id,
        subject: subject?.trim() || null,
        body: body.trim(),
      },
    });

    await logFolderEvent(
      user.officeId,
      client.id,
      user.id,
      "MESSAGE_SENT",
      "message",
      subject?.trim() || "Mensagem do cliente",
      message.id
    );

    revalidatePath("/portal/mensagens");
    revalidatePath("/portal/timeline");
    revalidatePath("/portal");

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao enviar mensagem" };
  }
}
