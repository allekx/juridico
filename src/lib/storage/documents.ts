import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DocumentType } from "@prisma/client";

export const DOCUMENTS_BUCKET = "client-documents";
export const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function usesSupabaseStorage(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function buildDocumentStoragePath(
  officeId: string,
  clientId: string,
  documentType: DocumentType,
  version: number,
  fileName: string
): string {
  const safeName = sanitizeFileName(fileName);
  return `offices/${officeId}/clients/${clientId}/${documentType.toLowerCase()}/v${version}/${Date.now()}-${safeName}`;
}

export async function uploadDocumentFile(
  officeId: string,
  clientId: string,
  documentType: DocumentType,
  version: number,
  file: File
): Promise<{ storagePath: string; mimeType: string; fileSize: number }> {
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new Error("Arquivo excede o limite de 15MB");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Tipo de arquivo não permitido");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = buildDocumentStoragePath(
    officeId,
    clientId,
    documentType,
    version,
    file.name
  );

  if (usesSupabaseStorage()) {
    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Falha no upload Supabase: ${error.message}`);
    }
  } else {
    const localPath = path.join(process.cwd(), "uploads", storagePath);
    await mkdir(path.dirname(localPath), { recursive: true });
    await writeFile(localPath, buffer);
    return {
      storagePath: `local:${localPath}`,
      mimeType: file.type,
      fileSize: file.size,
    };
  }

  return {
    storagePath,
    mimeType: file.type,
    fileSize: file.size,
  };
}

export async function readDocumentFile(
  storagePath: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  if (storagePath.startsWith("local:")) {
    const localPath = storagePath.slice(6);
    const buffer = await readFile(localPath);
    const ext = path.extname(localPath).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    return { buffer, mimeType: mimeMap[ext] ?? "application/octet-stream" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new Error("Arquivo não encontrado no storage");
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  return { buffer, mimeType: data.type || "application/octet-stream" };
}

export async function getDocumentSignedUrl(
  storagePath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  if (storagePath.startsWith("local:")) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function deleteDocumentFile(storagePath: string): Promise<void> {
  if (storagePath.startsWith("local:")) {
    try {
      await unlink(storagePath.slice(6));
    } catch {
      // já removido
    }
    return;
  }

  if (usesSupabaseStorage()) {
    const supabase = createAdminClient();
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
  }
}
