import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Briefcase,
  AlertTriangle,
  CheckSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { withPermission } from "@/lib/auth/guards";
import {
  getCrmDashboardStats,
  getRecentLeadsForDashboard,
  getRecentCasesForDashboard,
} from "@/lib/crm/queries";
import { StatCard } from "@/components/modules/crm/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_VARIANT,
  CASE_PRIORITY_LABELS,
  CASE_PRIORITY_VARIANT,
} from "@/constants/crm";

export const metadata: Metadata = {
  title: "CRM — Visão Geral",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function CrmDashboardPage() {
  const user = await withPermission("crm:read");

  const [stats, recentLeads, recentCases] = await Promise.all([
    getCrmDashboardStats(user.officeId),
    getRecentLeadsForDashboard(user.officeId),
    getRecentCasesForDashboard(user.officeId),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Leads"
          value={stats.totalLeads}
          hint={`${stats.newLeads} novos`}
          icon={Users}
          variant="gold"
        />
        <StatCard
          label="Clientes ativos"
          value={stats.activeClients}
          hint={`${stats.totalClients} no total`}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          label="Casos ativos"
          value={stats.activeCases}
          hint={`${stats.urgentCases} urgentes`}
          icon={Briefcase}
          variant="default"
        />
        <StatCard
          label="Tarefas pendentes"
          value={stats.pendingTasks}
          icon={CheckSquare}
          variant="warning"
        />
        <StatCard
          label="Taxa de conversão"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          variant="success"
        />
        {stats.urgentCases > 0 && (
          <StatCard
            label="Casos urgentes"
            value={stats.urgentCases}
            hint="Requer atenção imediata"
            icon={AlertTriangle}
            variant="destructive"
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Leads recentes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/crm/leads">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhum lead cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <Badge variant="muted" className="text-2xs">
                          {LEAD_SOURCE_LABELS[lead.source]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={LEAD_STATUS_VARIANT[lead.status]}>
                          {LEAD_STATUS_LABELS[lead.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Casos recentes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/crm/casos">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caso</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCases.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhum caso cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentCases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="max-w-[180px] truncate font-medium">
                        {c.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.clientName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={CASE_PRIORITY_VARIANT[c.priority]}>
                          {CASE_PRIORITY_LABELS[c.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: c.statusColor }}
                          />
                          <span className="text-sm">{c.statusName}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/crm/kanban">Abrir Kanban</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/crm/historico">Ver histórico</Link>
        </Button>
      </div>
    </div>
  );
}
