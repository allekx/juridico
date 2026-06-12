import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

import { prisma } from "@/lib/prisma/client";

import { getDocumentVersions } from "@/lib/documents/queries";



interface RouteParams {

  params: Promise<{ id: string }>;

}



export async function GET(_request: Request, { params }: RouteParams) {

  try {

    const user = await getCurrentUser();

    if (!user || user.role !== "CLIENT") {

      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    }



    const { id } = await params;



    const client = await prisma.client.findFirst({

      where: { userId: user.id, deletedAt: null },

    });



    if (!client) {

      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

    }



    const document = await prisma.document.findFirst({

      where: {

        id,

        clientId: client.id,

        officeId: user.officeId,

        deletedAt: null,

        OR: [

          { visibility: { in: ["CLIENT", "PUBLIC"] } },

          { uploadedById: user.id },

        ],

      },

      select: { documentGroupId: true },

    });



    if (!document) {

      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });

    }



    const versions = await getDocumentVersions(

      user.officeId,

      client.id,

      document.documentGroupId

    );



    return NextResponse.json({ versions });

  } catch (error) {

    const message = error instanceof Error ? error.message : "Erro ao listar versões";

    return NextResponse.json({ error: message }, { status: 500 });

  }

}

