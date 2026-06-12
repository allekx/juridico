import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma/client";
import { uploadDocumentFile } from "@/lib/storage/documents";
import { logUpload } from "@/lib/audit/service";
import { logFolderEvent } from "@/lib/client-folder/queries";
import { notifyDocumentUploaded } from "@/lib/notifications/service";
import { DOCUMENT_TYPE_LABELS } from "@/constants/documents";
import type { DocumentType, UserRole } from "@prisma/client";

interface UploadDocumentInput {
  officeId: string;
  clientId: string;
  uploadedById: string;
  file: File;
  documentType: DocumentType;
  documentGroupId?: string;
  visibility?: "INTERNAL" | "CLIENT" | "PUBLIC";
  description?: string;
}

export async function createDocumentUpload(input: UploadDocumentInput) {
  const {
    officeId,
    clientId,
    uploadedById,
    file,
    documentType,
    documentGroupId,
    visibility = "INTERNAL",
    description,
  } = input;

  let groupId = documentGroupId;
  let version = 1;

  if (groupId) {
    const latest = await prisma.document.findFirst({
      where: {
        documentGroupId: groupId,
        officeId,
        clientId,
        deletedAt: null,
        isLatestVersion: true,
      },
      orderBy: { version: "desc" },
    });

    if (!latest) {
      throw new Error("Grupo de documento não encontrado");
    }

    version = latest.version + 1;

    await prisma.document.updateMany({
      where: { documentGroupId: groupId, isLatestVersion: true },
      data: { isLatestVersion: false },
    });
  }

  const uploaded = await uploadDocumentFile(
    officeId,
    clientId,
    documentType,
    version,
    file
  );

  const newDocId = randomUUID();
  const resolvedGroupId = groupId ?? newDocId;

  const document = await prisma.document.create({
    data: {
      id: newDocId,
      officeId,
      clientId,
      uploadedById,
      name: file.name,
      description: description?.trim() || null,
      storagePath: uploaded.storagePath,
      mimeType: uploaded.mimeType,
      fileSize: uploaded.fileSize,
      documentType,
      documentGroupId: resolvedGroupId,
      version,
      isLatestVersion: true,
      visibility,
    },
  });

  groupId = resolvedGroupId;

  const typeLabel = DOCUMENT_TYPE_LABELS[documentType];
  const action = version > 1 ? "FILE_VERSIONED" : "FILE_UPLOADED";
  const descriptionLog =
    version > 1
      ? `Nova versão (v${version}) de ${typeLabel}: ${file.name}`
      : `${typeLabel} enviado: ${file.name}`;

  await logFolderEvent(
    officeId,
    clientId,
    uploadedById,
    action,
    "document",
    descriptionLog,
    document.id
  );

  await logUpload(
    { id: uploadedById, officeId },
    "document",
    document.id,
    descriptionLog,
    { clientId, documentType, version, fileName: file.name }
  );

  const [client, uploader] = await Promise.all([
    prisma.client.findFirst({
      where: { id: clientId },
      select: { name: true },
    }),
    prisma.user.findFirst({
      where: { id: uploadedById },
      select: { role: true },
    }),
  ]);

  if (client) {
    await notifyDocumentUploaded(
      officeId,
      {
        documentId: document.id,
        clientId,
        clientName: client.name,
        fileName: file.name,
        documentType,
        uploadedByRole: (uploader?.role ?? "ASSISTANT") as UserRole,
        version,
      },
      uploadedById
    );
  }

  return {
    ...document,
    documentGroupId: groupId,
  };
}
