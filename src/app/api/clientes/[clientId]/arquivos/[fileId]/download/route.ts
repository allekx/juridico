import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { readClientFile } from "@/lib/storage/client-files";
import { logFolderEvent } from "@/lib/client-folder/queries";

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
    const type = searchParams.get("type") ?? "document";

    let fileName = "arquivo";
    let storagePath: string | null = null;

    if (type === "contract") {
      const contract = await prisma.contract.findFirst({
        where: {
          id: fileId,
          clientId,
          officeId: user.officeId,
          deletedAt: null,
        },
      });

      if (!contract?.storagePath) {
        return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
      }

      fileName = `${contract.title}.pdf`;
      storagePath = contract.storagePath;

      await logFolderEvent(
        user.officeId,
        clientId,
        user.id,
        "FILE_DOWNLOADED",
        "contract",
        `Download: ${contract.title}`,
        contract.id
      );
    } else {
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

      fileName = document.name;
      storagePath = document.storagePath;

      await logFolderEvent(
        user.officeId,
        clientId,
        user.id,
        "FILE_DOWNLOADED",
        "document",
        `Download: ${document.name}`,
        document.id
      );
    }

    const { buffer, mimeType } = await readClientFile(storagePath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no download";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
