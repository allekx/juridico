import { EMPTY_VALUE } from "@/constants/copy";
import type { Metadata } from "next";
import Link from "next/link";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { getCrmLeads, getCrmTeamMembers } from "@/lib/crm/queries";
import { parseCrmFilters } from "@/lib/crm/filters";
import { PageHeader } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Legal } from "@/components/ui/typography";
import { AdvancedFilters } from "@/components/modules/crm/advanced-filters";
import { LeadStatusSelect } from "@/components/modules/crm/lead-status-select";
import { CreateLeadDialog } from "@/components/modules/crm/create-lead-dialog";
import { LEAD_SOURCE_LABELS } from "@/constants/crm";

export const metadata: Metadata = {
  title: "CRM | Leads",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function CrmLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withPermission("crm:read");
  const params = await searchParams;
  const filters = parseCrmFilters(params);
  const canWrite = hasPermission(user.role, "crm:write");

  const [leads, teamMembers] = await Promise.all([
    getCrmLeads(user.officeId, filters),
    getCrmTeamMembers(user.officeId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={`${leads.length} lead${leads.length !== 1 ? "s" : ""} encontrado${leads.length !== 1 ? "s" : ""}`}
      >
        {canWrite && <CreateLeadDialog teamMembers={teamMembers} />}
      </PageHeader>

      <AdvancedFilters
        filters={filters}
        entity="leads"
        teamMembers={teamMembers}
      />

      <div className="ds-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  Nenhum lead encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/crm/leads/${lead.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {lead.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {lead.email && <p>{lead.email}</p>}
                      {lead.phone && (
                        <Legal className="text-muted-foreground">
                          {lead.phone}
                        </Legal>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={lead.source === "TRIAGE" ? "gold" : "muted"}
                    >
                      {LEAD_SOURCE_LABELS[lead.source]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lead.interestArea ?? EMPTY_VALUE}
                  </TableCell>
                  <TableCell className="text-sm">
                    {lead.assignedToName ?? EMPTY_VALUE}
                  </TableCell>
                  <TableCell>
                    <LeadStatusSelect
                      leadId={lead.id}
                      currentStatus={lead.status}
                      canWrite={canWrite}
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
