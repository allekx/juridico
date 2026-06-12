import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma/client";

import { getCurrentUser } from "@/lib/auth/session";

import { hasPermission } from "@/lib/auth/permissions";

import { uploadClientFile } from "@/lib/storage/client-files";

import { createDocumentUpload } from "@/lib/documents/service";

import { logFolderEvent } from "@/lib/client-folder/queries";

import type { DocumentType } from "@prisma/client";



const VALID_TYPES: DocumentType[] = [

  "RG",

  "CPF",

  "POWER_OF_ATTORNEY",

  "CONTRACT",

  "PETITION",

  "RECEIPT",

];



interface RouteParams {

  params: Promise<{ clientId: string }>;

}



export async function POST(request: Request, { params }: RouteParams) {

  try {

    const user = await getCurrentUser();

    if (!user || !hasPermission(user.role, "documentos:write")) {

      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    }



    const { clientId } = await params;

    const client = await prisma.client.findFirst({

      where: { id: clientId, officeId: user.officeId, deletedAt: null },

    });



    if (!client) {

      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

    }



    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    const type = (formData.get("type") as string) || "document";

    const title = (formData.get("title") as string) || "";

    const documentType = formData.get("documentType") as DocumentType | null;

    const documentGroupId = (formData.get("documentGroupId") as string) || undefined;

    const visibility = (formData.get("visibility") as string) || "INTERNAL";

    const shareWithClient = visibility === "CLIENT";



    if (!file || file.size === 0) {

      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });

    }



    if (type === "contract") {

      const contractTitle = title.trim() || file.name.replace(/\.[^.]+$/, "");

      const uploaded = await uploadClientFile(clientId, "contratos", file);



      const contract = await prisma.contract.create({

        data: {

          officeId: user.officeId,

          clientId,

          createdById: user.id,

          title: contractTitle,

          content: "Contrato anexado via pasta digital.",

          type: "SERVICE",

          status: "DRAFT",

          storagePath: uploaded.storagePath,

        },

      });



      await logFolderEvent(

        user.officeId,

        clientId,

        user.id,

        "CONTRACT_CREATED",

        "contract",

        `Contrato enviado: ${contractTitle}`,

        contract.id

      );



      return NextResponse.json({

        id: contract.id,

        type: "contract",

        name: contractTitle,

        fileSize: uploaded.fileSize,

      });

    }



    const resolvedType: DocumentType =

      documentType && VALID_TYPES.includes(documentType)

        ? documentType

        : type === "procuracao"

          ? "POWER_OF_ATTORNEY"

          : "RECEIPT";



    const document = await createDocumentUpload({

      officeId: user.officeId,

      clientId,

      uploadedById: user.id,

      file,

      documentType: resolvedType,

      documentGroupId,

      visibility: shareWithClient ? "CLIENT" : "INTERNAL",

    });



    return NextResponse.json({

      id: document.id,

      documentGroupId: document.documentGroupId,

      type: "document",

      documentType: document.documentType,

      name: document.name,

      version: document.version,

      fileSize: document.fileSize,

    });

  } catch (error) {

    const message = error instanceof Error ? error.message : "Erro no upload";

    return NextResponse.json({ error: message }, { status: 500 });

  }

}

