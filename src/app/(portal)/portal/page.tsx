import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileText, MessageSquare, ArrowRight } from "lucide-react";
import { requirePortalClient } from "@/lib/portal/session";
import {
  getPortalOverview,
  getPortalCaseProgressList,
} from "@/lib/portal/queries";
import { PortalStatCard } from "@/components/modules/portal/portal-stat-card";
import { CaseProgressCard } from "@/components/modules/portal/case-progress-card";
import { ProcessProgressTimeline } from "@/components/shared/process-progress-timeline";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Início | Portal do Cliente",
};

export default async function PortalPage() {
  const { user, client } = await requirePortalClient();

  const [overview, caseProgress] = await Promise.all([
    getPortalOverview(user.officeId, client.id, user.id),
    getPortalCaseProgressList(user.officeId, client.id),
  ]);

  const activeProgress = caseProgress.filter(
    (c) =>
      !c.case.statusSlug.includes("arquivado") &&
      !c.case.statusSlug.includes("finalizado")
  );
  const featuredCase = activeProgress[0] ?? caseProgress[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Olá, ${user.name.split(" ")[0]}`}
        description={
          overview.lawyerName
            ? `Advogado responsável: ${overview.lawyerName}`
            : "Acompanhe seus processos e documentos."
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <PortalStatCard
          label="Processos ativos"
          value={overview.activeCases}
          icon={Briefcase}
        />
        <PortalStatCard
          label="Documentos"
          value={overview.documents}
          icon={FileText}
        />
        <PortalStatCard
          label="Mensagens"
          value={overview.messages}
          icon={MessageSquare}
        />
      </div>

      {featuredCase && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              Acompanhamento processual
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/portal/processos">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {caseProgress.length === 1 ? (
            <CaseProgressCard data={featuredCase} />
          ) : (
            <div className="rounded-lg border border-border/60 bg-card p-5">
              <div className="mb-4">
                <h3 className="font-medium">{featuredCase.case.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {featuredCase.case.statusName}
                </p>
              </div>
              <ProcessProgressTimeline steps={featuredCase.steps} compact />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
