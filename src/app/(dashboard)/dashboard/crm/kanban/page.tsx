import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { getCrmKanbanLeads } from "@/lib/crm/queries";
import { PageHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadsKanban } from "@/components/modules/crm/kanban-board";

export const metadata: Metadata = {
  title: "CRM — Kanban de Leads",
};

export default async function CrmKanbanPage() {
  const user = await withPermission("crm:read");
  const canWrite = hasPermission(user.role, "crm:write");
  const leadsBoard = await getCrmKanbanLeads(user.officeId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban de Leads"
        description="Funil comercial de leads. Para o fluxo de processos, use o Kanban Jurídico."
      />

      <Card variant="elevated">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Kanban Jurídico</p>
            <p className="text-sm text-muted-foreground">
              Novo → Triagem → Documentos → Análise → Atendimento → Protocolado → Finalizado → Arquivado
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/kanban">
              Abrir Kanban Jurídico
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <LeadsKanban columns={leadsBoard} canWrite={canWrite} />
    </div>
  );
}
