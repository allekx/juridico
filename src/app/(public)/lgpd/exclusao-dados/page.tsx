import { DeletionRequestForm } from "@/components/modules/lgpd/deletion-request-form";
import { PageHeader } from "@/components/ui/typography";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Exclusão de Dados — LGPD",
  description:
    "Solicite a exclusão ou anonimização dos seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).",
  path: "/lgpd/exclusao-dados",
  keywords: ["exclusão de dados", "LGPD", "direito do titular"],
});

export default function ExclusaoDadosPage() {
  return (
    <div className="ds-section">
      <div className="ds-container max-w-3xl">
        <PageHeader
          title="Solicitação de exclusão de dados"
          description="Exercite seu direito de solicitar a eliminação dos dados pessoais tratados pelo escritório, nos termos da Lei nº 13.709/2018 (LGPD)."
        />
        <DeletionRequestForm />
      </div>
    </div>
  );
}
