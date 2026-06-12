import { getPublicOfficeId } from "@/lib/blog/office";
import { getActiveLegalDocument } from "@/lib/lgpd/queries";
import { LegalDocumentContent } from "@/components/modules/lgpd/legal-document-content";
import { PageHeader } from "@/components/ui/typography";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Termos de Uso",
  description:
    "Termos e condições de uso do site e serviços digitais do escritório Almeida & Associados.",
  path: "/termos",
  keywords: ["termos de uso", "condições de uso", "serviços jurídicos"],
});

export default async function TermosPage() {
  const officeId = await getPublicOfficeId();
  const document = await getActiveLegalDocument(officeId, "TERMS_OF_USE");

  return (
    <div className="ds-section">
      <div className="ds-container max-w-4xl">
        <PageHeader title={document.title} description={document.summary} />
        <LegalDocumentContent document={document} />
      </div>
    </div>
  );
}
