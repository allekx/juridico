import { EMPTY_VALUE } from "@/constants/copy";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { getCrmLeadDetail } from "@/lib/crm/queries";
import { PageHeader } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStatusSelect } from "@/components/modules/crm/lead-status-select";
import { TriageReportCard } from "@/components/modules/crm/triage-report-card";
import { SendLeadToKanbanButton } from "@/components/modules/crm/send-lead-to-kanban-button";
import { CreateCaseFromLeadButton } from "@/components/modules/crm/create-case-from-lead-button";
import { LEAD_SOURCE_LABELS } from "@/constants/crm";

export const metadata: Metadata = {
  title: "Detalhe do Lead",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await withPermission("crm:read");
  const { id } = await params;
  const canWrite = hasPermission(user.role, "crm:write");

  const lead = await getCrmLeadDetail(user.officeId, id);
  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/crm/leads">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <PageHeader
        title={lead.name}
        description={`Lead criado em ${formatDate(lead.createdAt)}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={lead.source === "TRIAGE" ? "gold" : "muted"}>
            {LEAD_SOURCE_LABELS[lead.source]}
          </Badge>
          <LeadStatusSelect
            leadId={lead.id}
            currentStatus={lead.status}
            canWrite={canWrite}
          />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">E-mail</p>
              <p>{lead.email ?? EMPTY_VALUE}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Telefone</p>
              <p>{lead.phone ?? EMPTY_VALUE}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Área de interesse</p>
              <p>{lead.interestArea ?? EMPTY_VALUE}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Responsável</p>
              <p>{lead.assignedToName ?? EMPTY_VALUE}</p>
            </div>
            {canWrite && (
              <div className="space-y-3 border-t border-border/60 pt-3">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Funil comercial
                  </p>
                  <SendLeadToKanbanButton leadId={lead.id} />
                </div>
                {lead.source === "TRIAGE" && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Processo jurídico
                    </p>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Cria o cliente e o caso no Kanban Jurídico quando o lead
                      for qualificado.
                    </p>
                    <CreateCaseFromLeadButton
                      leadId={lead.id}
                      legalCaseId={lead.legalCaseId}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          {lead.triage ? (
            <TriageReportCard
              triage={lead.triage}
              leadName={lead.name}
              leadEmail={lead.email}
              leadPhone={lead.phone}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {lead.notes?.trim() || "Nenhuma informação adicional."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
