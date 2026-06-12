import type { Metadata } from "next";
import { requirePortalClient } from "@/lib/portal/session";
import { getPortalCaseProgressList, getPortalTimeline } from "@/lib/portal/queries";
import { CaseProgressCard } from "@/components/modules/portal/case-progress-card";
import { PortalTimeline } from "@/components/modules/portal/portal-timeline";
import { PageHeader } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Timeline — Portal do Cliente",
};

export default async function PortalTimelinePage() {
  const { user, client } = await requirePortalClient();
  const [caseProgress, timeline] = await Promise.all([
    getPortalCaseProgressList(user.officeId, client.id),
    getPortalTimeline(user.officeId, client.id),
  ]);

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <PageHeader
          title="Acompanhamento processual"
          description="Etapas do seu caso atualizadas automaticamente a cada mudança de status."
        />
        {caseProgress.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum processo em andamento.
          </p>
        ) : (
          <div className="space-y-6">
            {caseProgress.map((item) => (
              <CaseProgressCard key={item.case.id} data={item} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Atividades recentes</h2>
          <p className="text-sm text-muted-foreground">
            Documentos, mensagens e movimentações registradas.
          </p>
        </div>
        <PortalTimeline items={timeline} />
      </section>
    </div>
  );
}
