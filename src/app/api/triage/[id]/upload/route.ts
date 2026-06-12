import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getPublicOfficeId } from "@/lib/blog/office";
import { uploadTriageDocument } from "@/lib/storage/triage-upload";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: triageId } = await params;
    const officeId = await getPublicOfficeId();

    const session = await prisma.triageSession.findFirst({
      where: { id: triageId, officeId, status: "DRAFT" },
    });

    if (!session) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    }

    const uploaded = await uploadTriageDocument(triageId, file);

    const document = await prisma.triageDocument.create({
      data: {
        triageId,
        fileName: uploaded.fileName,
        storagePath: uploaded.storagePath,
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
      },
    });

    return NextResponse.json({
      id: document.id,
      fileName: document.fileName,
      fileSize: document.fileSize,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
