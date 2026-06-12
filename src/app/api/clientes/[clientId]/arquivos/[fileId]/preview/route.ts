import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma/client";

import { getCurrentUser } from "@/lib/auth/session";

import { hasPermission } from "@/lib/auth/permissions";

import {

  getDocumentSignedUrl,

  readDocumentFile,

} from "@/lib/storage/documents";

import { isPreviewableMimeType } from "@/constants/documents";



interface RouteParams {

  params: Promise<{ clientId: string; fileId: string }>;

}



export async function GET(request: Request, { params }: RouteParams) {

  try {

    const user = await getCurrentUser();

    if (!user || !hasPermission(user.role, "documentos:read")) {

      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    }



    const { clientId, fileId } = await params;

    const { searchParams } = new URL(request.url);

    const mode = searchParams.get("mode") ?? "inline";



    const document = await prisma.document.findFirst({

      where: {

        id: fileId,

        clientId,

        officeId: user.officeId,

        deletedAt: null,

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

