import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma/client";

import { getCurrentUser } from "@/lib/auth/session";

import { hasPermission } from "@/lib/auth/permissions";

import { getDocumentVersions } from "@/lib/documents/queries";



interface RouteParams {

  params: Promise<{ clientId: string; fileId: string }>;

}



export async function GET(_request: Request, { params }: RouteParams) {

  try {

    const user = await getCurrentUser();

    if (!user || !hasPermission(user.role, "documentos:read")) {

      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    }



    const { clientId, fileId } = await params;



    const document = await prisma.document.findFirst({

      where: {

        id: fileId,

        clientId,

        officeId: user.officeId,

        deletedAt: null,

      },

      select: { documentGroupId: true },

    });



    if (!document) {

      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });

    }



    const versions = await getDocumentVersions(

      user.officeId,

      clientId,

      document.documentGroupId

    );



    return NextResponse.json({ versions });

  } catch (error) {

    const message = error instanceof Error ? error.message : "Erro ao listar versões";

    return NextResponse.json({ error: message }, { status: 500 });

  }

}

