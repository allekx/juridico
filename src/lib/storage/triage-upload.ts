import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function uploadTriageDocument(
  triageId: string,
  file: File
): Promise<{ storagePath: string; fileName: string; mimeType: string; fileSize: number }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Arquivo excede o limite de 10MB");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Tipo de arquivo não permitido");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `triage/${triageId}/${Date.now()}-${safeName}`;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from("triage-documents")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Falha no upload: ${error.message}`);
    }
  } else {
    const uploadDir = path.join(process.cwd(), "uploads", "triage", triageId);
    await mkdir(uploadDir, { recursive: true });
    const localPath = path.join(uploadDir, `${Date.now()}-${safeName}`);
    await writeFile(localPath, buffer);
    return {
      storagePath: `local:${localPath}`,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    };
  }

  return {
    storagePath,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  };
}
