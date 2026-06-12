import type { Metadata } from "next";
import { requirePortalClient } from "@/lib/portal/session";
import { getPortalDocuments } from "@/lib/portal/queries";
import { PortalDocuments } from "@/components/modules/portal/portal-documents";
import { PageHeader } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Documentos — Portal do Cliente",
};

export default async function PortalDocumentosPage() {
  const { user, client } = await requirePortalClient();
  const documents = await getPortalDocuments(
    user.officeId,
    client.id,
    user.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        description="Envie e baixe arquivos relacionados ao seu caso."
      />
      <PortalDocuments documents={documents} />
    </div>
  );
}
