import type { Metadata } from "next";
import { Scale } from "lucide-react";
import { CaseStatusLookupForm } from "@/components/modules/portal/case-status-lookup-form";

export const metadata: Metadata = {
  title: "Consulta de andamento",
  description:
    "Consulte a etapa atual do seu processo com CPF ou CNPJ e o número informado pelo escritório.",
};

export default function ConsultaAndamentoPage() {
  return (
    <section className="ds-section">
      <div className="ds-container py-12 md:py-16">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-md">
            <Scale className="h-6 w-6 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            Consulta de andamento
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            Acompanhe a situação do seu caso de forma simples, sem necessidade de
            login ou cadastro.
          </p>
        </div>

        <CaseStatusLookupForm />
      </div>
    </section>
  );
}
