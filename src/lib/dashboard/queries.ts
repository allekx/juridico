import { prisma } from "@/lib/prisma/client";
import {
  LEAD_STATUS_CHART_COLORS,
  LEAD_STATUS_CHART_LABELS,
} from "@/constants/dashboard";
import type {
  ChartDataPoint,
  DashboardChartData,
  DashboardData,
  DashboardKpis,
} from "@/types/dashboard";
import type { LeadStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/dashboard/format";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getLast6Months(): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: monthKey(d),
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    });
  }

  return months;
}

function buildMonthlySeries(
  months: { key: string; label: string }[],
  records: { date: Date; value?: number }[]
): ChartDataPoint[] {
  const totals = new Map(months.map((m) => [m.key, 0]));

  for (const record of records) {
    const key = monthKey(record.date);
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + (record.value ?? 1));
    }
  }

  return months.map((m) => ({
    label: m.label,
    value: totals.get(m.key) ?? 0,
  }));
}

function decimalToNumber(value: { toNumber(): number } | null | undefined): number {
  if (!value) return 0;
  return value.toNumber();
}

export async function getDashboardData(
  officeId: string
): Promise<DashboardData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const monthStart = startOfMonth(now);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const months = getLast6Months();

  const [
    newClients,
    activeCases,
    completedCases,
    totalLeads,
    newLeads,
    totalDocuments,
    newDocuments,
    revenueTotal,
    revenueMonth,
    clientsCreated,
    documentsCreated,
    paidPayments,
    leadsByStatus,
    casesGrouped,
    caseStatuses,
  ] = await Promise.all([
    prisma.client.count({
      where: {
        officeId,
        deletedAt: null,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.case.count({
      where: { officeId, deletedAt: null, closedAt: null },
    }),
    prisma.case.count({
      where: {
        officeId,
        deletedAt: null,
        OR: [{ closedAt: { not: null } }, { status: { isFinal: true } }],
      },
    }),
    prisma.lead.count({ where: { officeId, deletedAt: null } }),
    prisma.lead.count({
      where: {
        officeId,
        deletedAt: null,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.document.count({
      where: { officeId, deletedAt: null, isTemplate: false },
    }),
    prisma.document.count({
      where: {
        officeId,
        deletedAt: null,
        isTemplate: false,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.payment.aggregate({
      where: {
        officeId,
        deletedAt: null,
        direction: "RECEIPT",
        status: "PAID",
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        officeId,
        deletedAt: null,
        direction: "RECEIPT",
        status: "PAID",
        paidAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.client.findMany({
      where: {
        officeId,
        deletedAt: null,
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
    }),
    prisma.document.findMany({
      where: {
        officeId,
        deletedAt: null,
        isTemplate: false,
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
    }),
    prisma.payment.findMany({
      where: {
        officeId,
        deletedAt: null,
        direction: "RECEIPT",
        status: "PAID",
        paidAt: { gte: sixMonthsAgo },
      },
      select: { paidAt: true, amount: true },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { officeId, deletedAt: null },
      _count: { _all: true },
    }),
    prisma.case.groupBy({
      by: ["statusId"],
      where: { officeId, deletedAt: null },
      _count: { _all: true },
    }),
    prisma.caseStatus.findMany({
      where: { officeId, isActive: true },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const revenue = decimalToNumber(revenueTotal._sum.amount);
  const revenueThisMonth = decimalToNumber(revenueMonth._sum.amount);

  const kpis: DashboardKpis = {
    newClients,
    newClientsHint: "Últimos 30 dias",
    activeCases,
    activeCasesHint: "Em andamento",
    completedCases,
    completedCasesHint: "Finalizados",
    totalLeads,
    leadsHint: `${newLeads} novos este mês`,
    totalDocuments,
    documentsHint: `${newDocuments} nos últimos 30 dias`,
    revenue,
    revenueHint: `${formatCurrency(revenueThisMonth)} este mês`,
  };

  const statusMap = new Map(caseStatuses.map((s) => [s.id, s]));

  const charts: DashboardChartData = {
    revenueByMonth: buildMonthlySeries(
      months,
      paidPayments
        .filter((p) => p.paidAt)
        .map((p) => ({
          date: p.paidAt!,
          value: decimalToNumber(p.amount),
        }))
    ),
    clientsByMonth: buildMonthlySeries(
      months,
      clientsCreated.map((c) => ({ date: c.createdAt }))
    ),
    documentsByMonth: buildMonthlySeries(
      months,
      documentsCreated.map((d) => ({ date: d.createdAt }))
    ),
    leadsByStatus: leadsByStatus.map((item) => ({
      name: LEAD_STATUS_CHART_LABELS[item.status as LeadStatus],
      value: item._count._all,
      color: LEAD_STATUS_CHART_COLORS[item.status as LeadStatus],
    })),
    casesByStatus: casesGrouped.map((item) => {
      const status = statusMap.get(item.statusId);
      return {
        name: status?.name ?? "Desconhecido",
        value: item._count._all,
        color: status?.color ?? "#6B7280",
      };
    }),
  };

  return { kpis, charts };
}

