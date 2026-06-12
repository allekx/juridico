import { readFile, writeFile, mkdir, unlink } from "fs/promises";

import path from "path";

import { createAdminClient } from "@/lib/supabase/admin";

import {

  DOCUMENTS_BUCKET,

  deleteDocumentFile,

  readDocumentFile,

} from "@/lib/storage/documents";



const MAX_FILE_SIZE = 15 * 1024 * 1024;



const ALLOWED_TYPES = [

  "application/pdf",

  "image/jpeg",

  "image/png",

  "image/webp",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

];



/** Upload legado para contratos — mantém path `clients/{id}/{folder}/`. */

export async function uploadClientFile(

  clientId: string,

  folder: string,

  file: File

): Promise<{ storagePath: string; fileName: string; mimeType: string; fileSize: number }> {

  if (file.size > MAX_FILE_SIZE) {

    throw new Error("Arquivo excede o limite de 15MB");

  }



  if (!ALLOWED_TYPES.includes(file.type)) {

    throw new Error("Tipo de arquivo não permitido");

  }



  const buffer = Buffer.from(await file.arrayBuffer());

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

  const storagePath = `clients/${clientId}/${folder}/${Date.now()}-${safeName}`;



  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {

    const supabase = createAdminClient();

    const { error } = await supabase.storage

      .from(DOCUMENTS_BUCKET)

      .upload(storagePath, buffer, {

        contentType: file.type,

        upsert: false,

      });



    if (error) throw new Error(`Falha no upload: ${error.message}`);

  } else {

    const uploadDir = path.join(process.cwd(), "uploads", "clients", clientId, folder);

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



export async function readClientFile(storagePath: string) {

  return readDocumentFile(storagePath);

}



export async function deleteClientFile(storagePath: string) {

  return deleteDocumentFile(storagePath);

}


