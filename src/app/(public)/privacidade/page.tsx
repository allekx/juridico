import { getPublicOfficeId } from "@/lib/blog/office";

export const dynamic = "force-dynamic";
import { getActiveLegalDocument } from "@/lib/lgpd/queries";
import { LegalDocumentContent } from "@/components/modules/lgpd/legal-document-content";
import { PageHeader } from "@/components/ui/typography";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Política de Privacidade",
  description:
    "Política de privacidade e proteção de dados pessoais conforme a LGPD. Saiba como o escritório Almeida & Associados trata suas informações.",
  path: "/privacidade",
  keywords: ["política de privacidade", "LGPD", "proteção de dados"],
});

export default async function PrivacidadePage() {
  const officeId = await getPublicOfficeId();
  const document = await getActiveLegalDocument(officeId, "PRIVACY_POLICY");

  return (
    <div className="ds-section">
      <div className="ds-container max-w-4xl">
        <PageHeader title={document.title} description={document.summary} />
        <LegalDocumentContent document={document} />
      </div>
    </div>
  );
}
