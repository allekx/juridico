import { NextResponse } from "next/server";
import { withPermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { getTriageDocumentSignedUrl } from "@/lib/storage/triage-download";
import { createAdminClient } from "@/lib/supabase/admin";
import { readFile } from "fs/promises";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await withPermission("crm:read");
    const { id } = await params;

    const document = await prisma.triageDocument.findFirst({
      where: {
        id,
        triage: {
          officeId: user.officeId,
          status: "COMPLETED",
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }

    if (document.storagePath.startsWith("local:")) {
      const localPath = document.storagePath.replace(/^local:/, "");
      const buffer = await readFile(localPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": document.mimeType,
          "Content-Disposition": `attachment; filename="${document.fileName}"`,
        },
      });
    }

    const signedUrl = await getTriageDocumentSignedUrl(document.storagePath);
    if (signedUrl) {
      return NextResponse.redirect(signedUrl);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from("triage-documents")
      .download(document.storagePath);

    if (error || !data) {
      return NextResponse.json({ error: "Arquivo indisponível" }, { status: 404 });
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${document.fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}
