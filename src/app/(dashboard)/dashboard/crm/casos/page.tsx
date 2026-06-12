import type { Metadata } from "next";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getCrmCases,
  getCrmTeamMembers,
  getCaseStatuses,
} from "@/lib/crm/queries";
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
import { CaseStatusSelect } from "@/components/modules/crm/case-status-select";
import { CASE_PRIORITY_LABELS, CASE_PRIORITY_VARIANT } from "@/constants/crm";

export const metadata: Metadata = {
  title: "CRM — Casos",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function CrmCasosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withPermission("crm:read");
  const params = await searchParams;
  const filters = parseCrmFilters(params);
  const canWrite = hasPermission(user.role, "crm:write");

  const [cases, teamMembers, caseStatuses] = await Promise.all([
    getCrmCases(user.officeId, filters),
    getCrmTeamMembers(user.officeId),
    getCaseStatuses(user.officeId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Casos"
        description={`${cases.length} caso${cases.length !== 1 ? "s" : ""} encontrado${cases.length !== 1 ? "s" : ""}`}
      />

      <AdvancedFilters
        filters={filters}
        entity="casos"
        teamMembers={teamMembers}
        caseStatuses={caseStatuses}
      />

      <div className="ds-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caso</TableHead>
              <TableHead>Processo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Advogado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Abertura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  Nenhum caso encontrado.
                </TableCell>
              </TableRow>
            ) : (
              cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-[200px] font-medium">
                    <span className="line-clamp-2">{c.title}</span>
                  </TableCell>
                  <TableCell>
                    <Legal className="text-muted-foreground">
                      {c.caseNumber ?? "—"}
                    </Legal>
                  </TableCell>
                  <TableCell className="text-sm">{c.clientName}</TableCell>
                  <TableCell className="text-sm">{c.lawyerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.caseType}
                  </TableCell>
                  <TableCell>
                    <Badge variant={CASE_PRIORITY_VARIANT[c.priority]}>
                      {CASE_PRIORITY_LABELS[c.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <CaseStatusSelect
                      caseId={c.id}
                      currentStatusId={c.statusId}
                      statuses={caseStatuses}
                      canWrite={canWrite}
                      currentStatusName={c.statusName}
                      currentStatusColor={c.statusColor}
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDate(c.openedAt)}
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
