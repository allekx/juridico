"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { withPermission } from "@/lib/auth/guards";
import { deleteClientFile } from "@/lib/storage/client-files";
import { logDelete } from "@/lib/audit/service";
import { logFolderEvent } from "@/lib/client-folder/queries";
import type { ActionResult } from "@/types/auth";

function revalidateFolder(clientId: string) {
  revalidatePath("/dashboard/documentos");
  revalidatePath(`/dashboard/documentos/${clientId}`);
}

export async function deleteClientDocumentAction(
  clientId: string,
  documentId: string
): Promise<ActionResult> {
  const user = await withPermission("documentos:write");

  try {
    const doc = await prisma.document.findFirst({
      where: {
        id: documentId,
        clientId,
        officeId: user.officeId,
        deletedAt: null,
      },
    });

    if (!doc) return { success: false, error: "Documento não encontrado" };

    if (doc.isLatestVersion) {
      const previous = await prisma.document.findFirst({
        where: {
          documentGroupId: doc.documentGroupId,
          id: { not: doc.id },
          deletedAt: null,
        },
        orderBy: { version: "desc" },
      });

      if (previous) {
        await prisma.document.update({
          where: { id: previous.id },
          data: { isLatestVersion: true },
        });
      }
    }

    await prisma.document.update({
      where: { id: doc.id },
      data: { deletedAt: new Date(), isLatestVersion: false },
    });

    await deleteClientFile(doc.storagePath);

    await logFolderEvent(
      user.officeId,
      clientId,
      user.id,
      "FILE_DELETED",
      "document",
      `Arquivo excluído: ${doc.name}`,
      doc.id
    );

    await logDelete(
      user,
      "document",
      doc.id,
      `Documento excluído: ${doc.name}`,
      { clientId, fileName: doc.name }
    );

    revalidateFolder(clientId);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir documento" };
  }
}

export async function deleteClientContractAction(
  clientId: string,
  contractId: string
): Promise<ActionResult> {
  const user = await withPermission("documentos:write");

  try {
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        clientId,
        officeId: user.officeId,
        deletedAt: null,
      },
    });

    if (!contract) return { success: false, error: "Contrato não encontrado" };

    if (contract.storagePath) {
      await deleteClientFile(contract.storagePath);
    }

    await prisma.contract.update({
      where: { id: contract.id },
      data: { deletedAt: new Date() },
    });

    await logFolderEvent(
      user.officeId,
      clientId,
      user.id,
      "CONTRACT_DELETED",
      "contract",
      `Contrato excluído: ${contract.title}`,
      contract.id
    );

    await logDelete(
      user,
      "contract",
      contract.id,
      `Contrato excluído: ${contract.title}`,
      { clientId, title: contract.title }
    );

    revalidateFolder(clientId);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir contrato" };
  }
}

export async function sendClientMessageAction(
  clientId: string,
  data: { subject?: string; body: string }
): Promise<ActionResult> {
  const user = await withPermission("documentos:write");

  if (!data.body.trim()) {
    return { success: false, error: "Mensagem obrigatória" };
  }

  try {
    const client = await prisma.client.findFirst({
      where: { id: clientId, officeId: user.officeId, deletedAt: null },
    });

    if (!client) return { success: false, error: "Cliente não encontrado" };

    const message = await prisma.clientMessage.create({
      data: {
        officeId: user.officeId,
        clientId,
        authorId: user.id,
        subject: data.subject?.trim() || null,
        body: data.body.trim(),
      },
    });

    await logFolderEvent(
      user.officeId,
      clientId,
      user.id,
      "MESSAGE_SENT",
      "message",
      data.subject?.trim() || "Nova mensagem enviada",
      message.id
    );

    revalidateFolder(clientId);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao enviar mensagem" };
  }
}
