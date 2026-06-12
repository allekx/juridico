import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

import { prisma } from "@/lib/prisma/client";

import {

  getDocumentSignedUrl,

  readDocumentFile,

} from "@/lib/storage/documents";

import { isPreviewableMimeType } from "@/constants/documents";



interface RouteParams {

  params: Promise<{ id: string }>;

}



export async function GET(request: Request, { params }: RouteParams) {

  try {

    const user = await getCurrentUser();

    if (!user || user.role !== "CLIENT") {

      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    }



    const { id } = await params;

    const { searchParams } = new URL(request.url);

    const mode = searchParams.get("mode") ?? "inline";



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

    });



    if (!document) {

      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });

    }



    if (!isPreviewableMimeType(document.mimeType)) {

      return NextResponse.json(

        { error: "Visualização não disponível para este tipo de arquivo" },

        { status: 415 }

      );

    }



    if (mode === "url") {

      const signedUrl = await getDocumentSignedUrl(document.storagePath, 300);

      if (signedUrl) {

        return NextResponse.json({

          url: signedUrl,

          mimeType: document.mimeType,

          name: document.name,

        });

      }

    }



    const { buffer, mimeType } = await readDocumentFile(document.storagePath);



    return new NextResponse(new Uint8Array(buffer), {

      headers: {

        "Content-Type": mimeType,

        "Content-Disposition": `inline; filename="${encodeURIComponent(document.name)}"`,

        "Content-Length": String(buffer.length),

      },

    });

  } catch (error) {

    const message = error instanceof Error ? error.message : "Erro na visualização";

    return NextResponse.json({ error: message }, { status: 500 });

  }

}

