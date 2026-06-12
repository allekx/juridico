import type { Metadata } from "next";
import { requirePortalClient } from "@/lib/portal/session";
import { getPortalCaseProgressList } from "@/lib/portal/queries";
import { CaseProgressCard } from "@/components/modules/portal/case-progress-card";
import { PageHeader } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Andamento — Portal do Cliente",
};

export default async function PortalProcessosPage() {
  const { user, client } = await requirePortalClient();
  const cases = await getPortalCaseProgressList(user.officeId, client.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Andamento dos processos"
        description="Acompanhe cada etapa do seu caso — atualizado automaticamente conforme o status."
      />
      {cases.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhum processo encontrado.
        </p>
      ) : (
        <div className="space-y-6">
          {cases.map((item) => (
            <CaseProgressCard key={item.case.id} data={item} />
          ))}
        </div>
      )}
    </div>
  );
}
