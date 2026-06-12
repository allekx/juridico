import { prisma } from "@/lib/prisma/client";
import {
  CASE_PRIORITY_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
} from "@/constants/crm";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/constants/financial";
import { buildDateRange } from "@/lib/reports/filters";
import { decimalToNumber, formatDate } from "@/lib/financial/format";
import type {
  CasesReportData,
  ClientsReportData,
  FinancialReportData,
  LawyersReportData,
  LeadsConversionReportData,
  ReportFilters,
  ReportType,
} from "@/types/reports";
import type { Prisma } from "@prisma/client";

const CLIENT_TYPE_LABELS = { INDIVIDUAL: "PF", COMPANY: "PJ" } as const;

function formatReportDate(date: Date | null | undefined): string {
  if (!date) return "";
  return formatDate(date.toISOString());
}

export async function getClientsReport(
  officeId: string,
  filters: ReportFilters = {}
): Promise<ClientsReportData> {
  const createdAt = buildDateRange(filters.dateFrom, filters.dateTo);

  const where: Prisma.ClientWhereInput = {
    officeId,
    deletedAt: null,
    ...(createdAt && { createdAt }),
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { email: { contains: filters.q, mode: "insensitive" } },
        { cpfCnpj: { contains: filters.q, mode: "insensitive" } },
      ],
    }),
    ...(filters.lawyerId && { assignedLawyerId: filters.lawyerId }),
  };

  const [rows, total, active] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        assignedLawyer: { include: { user: { select: { name: true } } } },
        _count: { select: { cases: { where: { deletedAt: null } } } },
      },
      orderBy: { name: "asc" },
      take: 2000,
    }),
    prisma.client.count({ where: { officeId, deletedAt: null } }),
    prisma.client.count({
      where: { officeId, deletedAt: null, isActive: true },
    }),
  ]);

  const periodCount = rows.length;

  return {
    summary: [
      { label: "Total de clientes", value: total },
      { label: "Clientes ativos", value: active },
      { label: "No período / filtro", value: periodCount },
    ],
    rows: rows.map((c) => ({
      id: c.id,
      name: c.name,
      type: CLIENT_TYPE_LABELS[c.type],
      cpfCnpj: c.cpfCnpj ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      city: c.city ?? "",
      state: c.state ?? "",
      lawyerName: c.assignedLawyer?.user.name ?? "",
      casesCount: c._count.cases,
      isActive: c.isActive ? "Ativo" : "Inativo",
      createdAt: formatReportDate(c.createdAt),
    })),
  };
}

export async function getCasesReport(
  officeId: string,
  filters: ReportFilters = {}
): Promise<CasesReportData> {
  const openedAt = buildDateRange(filters.dateFrom, filters.dateTo);

  const where: Prisma.CaseWhereInput = {
    officeId,
    deletedAt: null,
    ...(openedAt && { openedAt }),
    ...(filters.lawyerId && { lawyerId: filters.lawyerId }),
    ...(filters.status && { statusId: filters.status }),
    ...(filters.q && {
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { caseNumber: { contains: filters.q, mode: "insensitive" } },
        { client: { name: { contains: filters.q, mode: "insensitive" } } },
      ],
    }),
  };

  const [rows, active, closed, urgent] = await Promise.all([
    prisma.case.findMany({
      where,
      include: {
        client: { select: { name: true } },
        lawyer: { select: { name: true } },
        status: { select: { name: true } },
      },
      orderBy: { openedAt: "desc" },
      take: 2000,
    }),
    prisma.case.count({
      where: { officeId, deletedAt: null, closedAt: null },
    }),
    prisma.case.count({
      where: { officeId, deletedAt: null, closedAt: { not: null } },
    }),
    prisma.case.count({
      where: {
        officeId,
        deletedAt: null,
        closedAt: null,
        priority: "URGENT",
      },
    }),
  ]);

  return {
    summary: [
      { label: "Casos ativos", value: active },
      { label: "Encerrados", value: closed },
      { label: "Urgentes", value: urgent },
      { label: "No relatório", value: rows.length },
    ],
    rows: rows.map((c) => ({
      id: c.id,
      title: c.title,
      caseNumber: c.caseNumber ?? "",
      caseType: c.caseType,
      clientName: c.client.name,
      lawyerName: c.lawyer.name,
      statusName: c.status.name,
      priority: CASE_PRIORITY_LABELS[c.priority],
      court: c.court ?? "",
      openedAt: formatReportDate(c.openedAt),
      closedAt: formatReportDate(c.closedAt),
    })),
  };
}

export async function getLawyersReport(
  officeId: string,
  _filters: ReportFilters = {}
): Promise<LawyersReportData> {
  const lawyers = await prisma.lawyer.findMany({
    where: { officeId, deletedAt: null },
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { clients: { where: { deletedAt: null } } } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const userIds = lawyers.map((l) => l.user.id);

  const [caseCounts, taskCounts, receiptSums] = await Promise.all([
    prisma.case.groupBy({
      by: ["lawyerId"],
      where: { officeId, deletedAt: null, lawyerId: { in: userIds } },
      _count: { id: true },
    }),
    prisma.task.groupBy({
      by: ["assignedToId"],
      where: {
        officeId,
        deletedAt: null,
        assignedToId: { in: userIds },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      _count: { id: true },
    }),
    prisma.payment.groupBy({
      by: ["clientId"],
      where: {
        officeId,
        deletedAt: null,
        direction: "RECEIPT",
        status: "PAID",
      },
      _sum: { amount: true },
    }),
  ]);

  const activeCaseCounts = await prisma.case.groupBy({
    by: ["lawyerId"],
    where: {
      officeId,
      deletedAt: null,
      closedAt: null,
      lawyerId: { in: userIds },
    },
    _count: { id: true },
  });

  const caseMap = new Map(caseCounts.map((c) => [c.lawyerId, c._count.id]));
  const activeMap = new Map(
    activeCaseCounts.map((c) => [c.lawyerId, c._count.id])
  );
  const taskMap = new Map(taskCounts.map((t) => [t.assignedToId, t._count.id]));

  const clientLawyerReceipts = await prisma.client.findMany({
    where: {
      officeId,
      deletedAt: null,
      assignedLawyerId: { in: lawyers.map((l) => l.id) },
    },
    select: { id: true, assignedLawyerId: true },
  });

  const clientToLawyer = new Map(
    clientLawyerReceipts.map((c) => [c.id, c.assignedLawyerId])
  );
  const receiptByClient = new Map(
    receiptSums.map((r) => [r.clientId, decimalToNumber(r._sum.amount)])
  );

  const receiptsByLawyer = new Map<string, number>();
  for (const [clientId, amount] of receiptByClient) {
    const lawyerId = clientToLawyer.get(clientId);
    if (!lawyerId) continue;
    receiptsByLawyer.set(
      lawyerId,
      (receiptsByLawyer.get(lawyerId) ?? 0) + amount
    );
  }

  const rows = lawyers.map((l) => ({
    id: l.id,
    name: l.user.name,
    oab: `${l.oabNumber}/${l.oabState}`,
    specialty: l.specialty ?? "",
    isPartner: l.isPartner ? "Sim" : "Não",
    clientsCount: l._count.clients,
    activeCases: activeMap.get(l.user.id) ?? 0,
    totalCases: caseMap.get(l.user.id) ?? 0,
    pendingTasks: taskMap.get(l.user.id) ?? 0,
    receiptsTotal: receiptsByLawyer.get(l.id) ?? 0,
  }));

  const totalActiveCases = rows.reduce((s, r) => s + r.activeCases, 0);
  const totalClients = rows.reduce((s, r) => s + r.clientsCount, 0);

  return {
    summary: [
      { label: "Advogados", value: rows.length },
      { label: "Clientes atribuídos", value: totalClients },
      { label: "Casos ativos (equipe)", value: totalActiveCases },
      {
        label: "Receita atribuída (R$)",
        value: rows
          .reduce((s, r) => s + r.receiptsTotal, 0)
          .toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      },
    ],
    rows,
  };
}

export async function getFinancialReport(
  officeId: string,
  filters: ReportFilters = {}
): Promise<FinancialReportData> {
  const dueDate = buildDateRange(filters.dateFrom, filters.dateTo);

  const where: Prisma.PaymentWhereInput = {
    officeId,
    deletedAt: null,
    ...(dueDate && { dueDate }),
    ...(filters.q && {
      OR: [
        { description: { contains: filters.q, mode: "insensitive" } },
        { client: { name: { contains: filters.q, mode: "insensitive" } } },
      ],
    }),
  };

  const payments = await prisma.payment.findMany({
    where,
    include: { client: { select: { name: true } } },
    orderBy: { dueDate: "desc" },
    take: 2000,
  });

  let receiptsPaid = 0;
  let receiptsPending = 0;
  let expensesPaid = 0;
  let expensesPending = 0;

  for (const p of payments) {
    const amount = decimalToNumber(p.amount);
    if (p.direction === "RECEIPT") {
      if (p.status === "PAID") receiptsPaid += amount;
      else if (p.status === "PENDING" || p.status === "OVERDUE")
        receiptsPending += amount;
    } else {
      if (p.status === "PAID") expensesPaid += amount;
      else if (p.status === "PENDING" || p.status === "OVERDUE")
        expensesPending += amount;
    }
  }

  return {
    summary: [
      {
        label: "Recebido",
        value: receiptsPaid.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
      },
      {
        label: "A receber",
        value: receiptsPending.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
      },
      {
        label: "Pago (despesas)",
        value: expensesPaid.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
      },
      {
        label: "Saldo",
        value: (receiptsPaid - expensesPaid).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
      },
    ],
    rows: payments.map((p) => ({
      id: p.id,
      direction: p.direction === "RECEIPT" ? "Recebimento" : "Pagamento",
      clientName: p.client.name,
      description: p.description ?? "",
      amount: decimalToNumber(p.amount),
      status: PAYMENT_STATUS_LABELS[p.status],
      method: p.method ? PAYMENT_METHOD_LABELS[p.method] : "",
      dueDate: formatReportDate(p.dueDate),
      paidAt: formatReportDate(p.paidAt),
      invoiceNumber: p.invoiceNumber ?? "",
    })),
  };
}

export async function getLeadsConversionReport(
  officeId: string,
  filters: ReportFilters = {}
): Promise<LeadsConversionReportData> {
  const createdAt = buildDateRange(filters.dateFrom, filters.dateTo);

  const where: Prisma.LeadWhereInput = {
    officeId,
    deletedAt: null,
    ...(createdAt && { createdAt }),
    ...(filters.status && { status: filters.status as Prisma.EnumLeadStatusFilter }),
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { email: { contains: filters.q, mode: "insensitive" } },
      ],
    }),
  };

  const leads = await prisma.lead.findMany({
    where,
    include: {
      assignedTo: { select: { name: true } },
      convertedClient: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  const allLeads = await prisma.lead.findMany({
    where: { officeId, deletedAt: null, ...(createdAt && { createdAt }) },
    select: { status: true, source: true },
  });

  const total = allLeads.length;
  const converted = allLeads.filter((l) => l.status === "CONVERTED").length;
  const rate = total > 0 ? Math.round((converted / total) * 100) : 0;

  const byStatusMap = new Map<string, number>();
  for (const l of allLeads) {
    byStatusMap.set(l.status, (byStatusMap.get(l.status) ?? 0) + 1);
  }

  const bySourceMap = new Map<string, { total: number; converted: number }>();
  for (const l of allLeads) {
    const entry = bySourceMap.get(l.source) ?? { total: 0, converted: 0 };
    entry.total++;
    if (l.status === "CONVERTED") entry.converted++;
    bySourceMap.set(l.source, entry);
  }

  return {
    summary: [
      { label: "Total de leads", value: total },
      { label: "Convertidos", value: converted },
      { label: "Taxa de conversão", value: `${rate}%` },
      { label: "No relatório", value: leads.length },
    ],
    byStatus: Array.from(byStatusMap.entries()).map(([status, count]) => ({
      status: LEAD_STATUS_LABELS[status as keyof typeof LEAD_STATUS_LABELS],
      count,
    })),
    bySource: Array.from(bySourceMap.entries())
      .map(([source, data]) => ({
        source: LEAD_SOURCE_LABELS[source as keyof typeof LEAD_SOURCE_LABELS],
        total: data.total,
        converted: data.converted,
        rate: data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total),
    rows: leads.map((l) => {
      const daysToConvert =
        l.convertedAt && l.createdAt
          ? Math.round(
              (l.convertedAt.getTime() - l.createdAt.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;

      return {
        id: l.id,
        name: l.name,
        email: l.email ?? "",
        phone: l.phone ?? "",
        source: LEAD_SOURCE_LABELS[l.source],
        status: LEAD_STATUS_LABELS[l.status],
        interestArea: l.interestArea ?? "",
        assignedToName: l.assignedTo?.name ?? "",
        convertedClientName: l.convertedClient?.name ?? "",
        createdAt: formatReportDate(l.createdAt),
        convertedAt: formatReportDate(l.convertedAt),
        daysToConvert: daysToConvert != null ? String(daysToConvert) : "",
      };
    }),
  };
}

export async function getReportLawyerOptions(officeId: string) {
  const lawyers = await prisma.lawyer.findMany({
    where: { officeId, deletedAt: null },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { user: { name: "asc" } },
  });

  return lawyers.map((l) => ({
    userId: l.user.id,
    lawyerId: l.id,
    name: l.user.name,
  }));
}

export async function getReportData(
  type: ReportType,
  officeId: string,
  filters: ReportFilters = {}
) {
  switch (type) {
    case "clientes":
      return getClientsReport(officeId, filters);
    case "casos":
      return getCasesReport(officeId, filters);
    case "advogados":
      return getLawyersReport(officeId, filters);
    case "financeiro":
      return getFinancialReport(officeId, filters);
    case "leads":
      return getLeadsConversionReport(officeId, filters);
  }
}

export async function getReportRowsForExport(
  type: ReportType,
  officeId: string,
  filters: ReportFilters = {}
) {
  const data = await getReportData(type, officeId, filters);
  return "rows" in data ? data.rows : [];
}
