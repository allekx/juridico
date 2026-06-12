import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

import { prisma } from "@/lib/prisma/client";

import { createDocumentUpload } from "@/lib/documents/service";

import type { DocumentType } from "@prisma/client";



const VALID_TYPES: DocumentType[] = [

  "RG",

  "CPF",

  "POWER_OF_ATTORNEY",

  "CONTRACT",

  "PETITION",

  "RECEIPT",

];



export async function POST(request: Request) {

  try {

    const user = await getCurrentUser();

    if (!user || user.role !== "CLIENT") {

      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    }



    const client = await prisma.client.findFirst({

      where: { userId: user.id, deletedAt: null, isActive: true },

    });



    if (!client) {

      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

    }



    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    const documentType = (formData.get("documentType") as DocumentType) || "RECEIPT";

    const documentGroupId = (formData.get("documentGroupId") as string) || undefined;



    if (!file || file.size === 0) {

      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });

    }



    const resolvedType = VALID_TYPES.includes(documentType)

      ? documentType

      : "RECEIPT";



    const document = await createDocumentUpload({

      officeId: user.officeId,

      clientId: client.id,

      uploadedById: user.id,

      file,

      documentType: resolvedType,

      documentGroupId,

      visibility: "CLIENT",

    });



    return NextResponse.json({

      id: document.id,

      documentGroupId: document.documentGroupId,

      name: document.name,

      documentType: document.documentType,

      version: document.version,

      fileSize: document.fileSize,

    });

  } catch (error) {

    const message = error instanceof Error ? error.message : "Erro no upload";

    return NextResponse.json({ error: message }, { status: 500 });

  }

}

