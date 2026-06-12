import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { readClientFile } from "@/lib/storage/client-files";

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
    });

    if (!document) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    const { buffer, mimeType } = await readClientFile(document.storagePath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.name)}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no download";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
