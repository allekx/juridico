import type { Metadata } from "next";
import { withPermission } from "@/lib/auth/guards";
import { getCrmHistory } from "@/lib/crm/queries";
import { PageHeader } from "@/components/ui/typography";
import { HistoryTimeline } from "@/components/modules/crm/history-timeline";

export const metadata: Metadata = {
  title: "CRM | Histórico",
};

export default async function CrmHistoricoPage() {
  const user = await withPermission("crm:read");
  const history = await getCrmHistory(user.officeId, 60);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico"
        description="Atividades recentes de leads, casos e alterações de status."
      />

      <HistoryTimeline items={history} />
    </div>
  );
}
