import { prisma } from "@/lib/prisma/client";
import {
  FINANCIAL_CHART_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/constants/financial";
import { decimalToNumber } from "@/lib/financial/format";
import type {
  ChartDataPoint,
  ClientFinancialDetail,
  ClientFinancialSummary,
  ContractRow,
  FinancialChartData,
  FinancialDashboardData,
  FinancialKpis,
  FinancialListFilters,
  FinancialSelectOption,
  InstallmentRow,
  PaymentRow,
} from "@/types/financial";
import type { PaymentStatus, Prisma } from "@prisma/client";

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
  records: { date: Date; value: number }[]
): ChartDataPoint[] {
  const totals = new Map(months.map((m) => [m.key, 0]));

  for (const record of records) {
    const key = monthKey(record.date);
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + record.value);
    }
  }

  return months.map((m) => ({
    label: m.label,
    value: totals.get(m.key) ?? 0,
  }));
}

function effectiveInstallmentStatus(
  status: PaymentStatus,
  dueDate: Date
): PaymentStatus {
  if (status === "PENDING" && dueDate < new Date()) return "OVERDUE";
  return status;
}

function buildPaymentWhere(
  officeId: string,
  direction: "RECEIPT" | "EXPENSE",
  filters: FinancialListFilters
): Prisma.PaymentWhereInput {
  const where: Prisma.PaymentWhereInput = {
    officeId,
    deletedAt: null,
    direction,
  };

  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.contractId) where.contractId = filters.contractId;
  if (filters.status) {
    where.status = filters.status as Prisma.EnumPaymentStatusFilter;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.dueDate = {};
    if (filters.dateFrom) {
      where.dueDate.gte = new Date(`${filters.dateFrom}T00:00:00`);
    }
    if (filters.dateTo) {
      where.dueDate.lte = new Date(`${filters.dateTo}T23:59:59`);
    }
  }

  if (filters.q) {
    where.OR = [
      { description: { contains: filters.q, mode: "insensitive" } },
      { invoiceNumber: { contains: filters.q, mode: "insensitive" } },
      { client: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  return where;
}

function buildInstallmentWhere(
  officeId: string,
  filters: FinancialListFilters
): Prisma.InstallmentWhereInput {
  const where: Prisma.InstallmentWhereInput = {
    officeId,
    deletedAt: null,
  };

  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.contractId) where.contractId = filters.contractId;

  if (filters.status === "OVERDUE") {
    where.status = "PENDING";
    where.dueDate = { lt: new Date() };
  } else if (filters.status) {
    where.status = filters.status as Prisma.EnumPaymentStatusFilter;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.dueDate = where.dueDate ?? {};
    if (filters.dateFrom) {
      (where.dueDate as Prisma.DateTimeFilter).gte = new Date(
        `${filters.dateFrom}T00:00:00`
      );
    }
    if (filters.dateTo) {
      (where.dueDate as Prisma.DateTimeFilter).lte = new Date(
        `${filters.dateTo}T23:59:59`
      );
    }
  }

  if (filters.q) {
    where.OR = [
      { notes: { contains: filters.q, mode: "insensitive" } },
      { client: { name: { contains: filters.q, mode: "insensitive" } } },
      { contract: { title: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  return where;
}

function mapPaymentRow(p: {
  id: string;
  invoiceNumber: string | null;
  description: string | null;
  amount: { toNumber(): number };
  direction: "RECEIPT" | "EXPENSE";
  status: PaymentStatus;
  method: string | null;
  dueDate: Date;
  paidAt: Date | null;
  client: { id: string; name: string };
  case: { id: string; title: string } | null;
  contract: { id: string; title: string } | null;
  installment: { id: string; number: number } | null;
}): PaymentRow {
  return {
    id: p.id,
    invoiceNumber: p.invoiceNumber,
    description: p.description,
    amount: decimalToNumber(p.amount),
    direction: p.direction,
    status: p.status,
    method: p.method as PaymentRow["method"],
    dueDate: p.dueDate.toISOString(),
    paidAt: p.paidAt?.toISOString() ?? null,
    client: p.client,
    case: p.case,
    contract: p.contract,
    installment: p.installment,
  };
}

function mapInstallmentRow(i: {
  id: string;
  number: number;
  amount: { toNumber(): number };
  dueDate: Date;
  status: PaymentStatus;
  paidAt: Date | null;
  notes: string | null;
  client: { id: string; name: string };
  contract: { id: string; title: string };
  receipt: { id: string; invoiceNumber: string | null } | null;
}): InstallmentRow {
  return {
    id: i.id,
    number: i.number,
    amount: decimalToNumber(i.amount),
    dueDate: i.dueDate.toISOString(),
    status: effectiveInstallmentStatus(i.status, i.dueDate),
    paidAt: i.paidAt?.toISOString() ?? null,
    notes: i.notes,
    client: i.client,
    contract: i.contract,
    receipt: i.receipt,
  };
}

export async function getFinancialClients(
  officeId: string
): Promise<FinancialSelectOption[]> {
  const clients = await prisma.client.findMany({
    where: { officeId, deletedAt: null, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 500,
  });

  return clients.map((c) => ({ id: c.id, label: c.name }));
}

export async function getFinancialContractsOptions(
  officeId: string,
  clientId?: string
): Promise<FinancialSelectOption[]> {
  const contracts = await prisma.contract.findMany({
    where: {
      officeId,
      deletedAt: null,
      ...(clientId ? { clientId } : {}),
    },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return contracts.map((c) => ({ id: c.id, label: c.title }));
}

export async function getFinancialCases(
  officeId: string,
  clientId?: string
): Promise<FinancialSelectOption[]> {
  const cases = await prisma.case.findMany({
    where: {
      officeId,
      deletedAt: null,
      ...(clientId ? { clientId } : {}),
    },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
    take: 200,
  });

  return cases.map((c) => ({ id: c.id, label: c.title }));
}

export async function getContracts(
  officeId: string,
  filters: FinancialListFilters = {}
): Promise<ContractRow[]> {
  const where: Prisma.ContractWhereInput = {
    officeId,
    deletedAt: null,
  };

  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.status) {
    where.status = filters.status as Prisma.EnumContractStatusFilter;
  }
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { client: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  const contracts = await prisma.contract.findMany({
    where,
    include: {
      client: { select: { id: true, name: true } },
      case: { select: { id: true, title: true } },
      installments: {
        where: { deletedAt: null },
        select: { status: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return contracts.map((c) => ({
    id: c.id,
    title: c.title,
    content: c.content,
    type: c.type,
    status: c.status,
    value: c.value ? decimalToNumber(c.value) : null,
    signedAt: c.signedAt?.toISOString() ?? null,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    client: c.client,
    case: c.case,
    installmentsCount: c.installments.length,
    paidInstallments: c.installments.filter((i) => i.status === "PAID").length,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function getInstallments(
  officeId: string,
  filters: FinancialListFilters = {}
): Promise<InstallmentRow[]> {
  const installments = await prisma.installment.findMany({
    where: buildInstallmentWhere(officeId, filters),
    include: {
      client: { select: { id: true, name: true } },
      contract: { select: { id: true, title: true } },
      receipt: { select: { id: true, invoiceNumber: true } },
    },
    orderBy: [{ dueDate: "asc" }, { number: "asc" }],
    take: 300,
  });

  return installments.map(mapInstallmentRow);
}

export async function getReceipts(
  officeId: string,
  filters: FinancialListFilters = {}
): Promise<PaymentRow[]> {
  const payments = await prisma.payment.findMany({
    where: buildPaymentWhere(officeId, "RECEIPT", filters),
    include: {
      client: { select: { id: true, name: true } },
      case: { select: { id: true, title: true } },
      contract: { select: { id: true, title: true } },
      installment: { select: { id: true, number: true } },
    },
    orderBy: [{ dueDate: "desc" }],
    take: 300,
  });

  return payments.map(mapPaymentRow);
}

export async function getExpenses(
  officeId: string,
  filters: FinancialListFilters = {}
): Promise<PaymentRow[]> {
  const payments = await prisma.payment.findMany({
    where: buildPaymentWhere(officeId, "EXPENSE", filters),
    include: {
      client: { select: { id: true, name: true } },
      case: { select: { id: true, title: true } },
      contract: { select: { id: true, title: true } },
      installment: { select: { id: true, number: true } },
    },
    orderBy: [{ dueDate: "desc" }],
    take: 300,
  });

  return payments.map(mapPaymentRow);
}

export async function getClientsFinancialSummary(
  officeId: string,
  filters: FinancialListFilters = {}
): Promise<ClientFinancialSummary[]> {
  const clients = await prisma.client.findMany({
    where: {
      officeId,
      deletedAt: null,
      ...(filters.q
        ? { name: { contains: filters.q, mode: "insensitive" } }
        : {}),
    },
    select: {
      id: true,
      name: true,
      cpfCnpj: true,
      contracts: {
        where: { deletedAt: null },
        select: { value: true },
      },
      payments: {
        where: { deletedAt: null, direction: "RECEIPT" },
        select: { amount: true, status: true },
      },
      installments: {
        where: {
          deletedAt: null,
          status: "PENDING",
          dueDate: { lt: new Date() },
        },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  return clients.map((c) => {
    const totalContractValue = c.contracts.reduce(
      (sum, ct) => sum + decimalToNumber(ct.value),
      0
    );
    const receiptsPaid = c.payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + decimalToNumber(p.amount), 0);
    const receiptsPending = c.payments
      .filter((p) => p.status === "PENDING" || p.status === "OVERDUE")
      .reduce((sum, p) => sum + decimalToNumber(p.amount), 0);

    return {
      id: c.id,
      name: c.name,
      cpfCnpj: c.cpfCnpj,
      contractsCount: c.contracts.length,
      totalContractValue,
      receiptsPaid,
      receiptsPending,
      installmentsOverdue: c.installments.length,
    };
  });
}

export async function getClientFinancialDetail(
  officeId: string,
  clientId: string
): Promise<ClientFinancialDetail | null> {
  const client = await prisma.client.findFirst({
    where: { id: clientId, officeId, deletedAt: null },
    select: { id: true, name: true, cpfCnpj: true, email: true },
  });

  if (!client) return null;

  const [contracts, installments, receipts, expenses] = await Promise.all([
    getContracts(officeId, { clientId }),
    getInstallments(officeId, { clientId }),
    getReceipts(officeId, { clientId }),
    getExpenses(officeId, { clientId }),
  ]);

  const contractValue = contracts.reduce((s, c) => s + (c.value ?? 0), 0);
  const receiptsPaid = receipts
    .filter((r) => r.status === "PAID")
    .reduce((s, r) => s + r.amount, 0);
  const receiptsPending = receipts
    .filter((r) => r.status === "PENDING" || r.status === "OVERDUE")
    .reduce((s, r) => s + r.amount, 0);
  const expensesPaid = expenses
    .filter((e) => e.status === "PAID")
    .reduce((s, e) => s + e.amount, 0);
  const installmentsOverdue = installments.filter(
    (i) => i.status === "OVERDUE"
  ).length;

  return {
    client,
    summary: {
      contractValue,
      receiptsPaid,
      receiptsPending,
      expensesPaid,
      installmentsOverdue,
    },
    contracts,
    installments,
    receipts,
    expenses,
  };
}

async function buildFinancialCharts(
  officeId: string
): Promise<FinancialChartData> {
  const months = getLast6Months();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [receipts, expenses, installments, topClients] = await Promise.all([
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
    prisma.payment.findMany({
      where: {
        officeId,
        deletedAt: null,
        direction: "EXPENSE",
        status: "PAID",
        paidAt: { gte: sixMonthsAgo },
      },
      select: { paidAt: true, amount: true },
    }),
    prisma.installment.findMany({
      where: { officeId, deletedAt: null },
      select: { status: true, dueDate: true },
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
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
  ]);

  const receiptsByMonth = buildMonthlySeries(
    months,
    receipts
      .filter((r) => r.paidAt)
      .map((r) => ({
        date: r.paidAt!,
        value: decimalToNumber(r.amount),
      }))
  );

  const expensesByMonth = buildMonthlySeries(
    months,
    expenses
      .filter((e) => e.paidAt)
      .map((e) => ({
        date: e.paidAt!,
        value: decimalToNumber(e.amount),
      }))
  );

  const cashFlowByMonth = months.map((m, idx) => ({
    label: m.label,
    value: receiptsByMonth[idx].value - expensesByMonth[idx].value,
  }));

  const statusCounts = { PAID: 0, PENDING: 0, OVERDUE: 0 };
  for (const inst of installments) {
    const status = effectiveInstallmentStatus(inst.status, inst.dueDate);
    if (status === "PAID") statusCounts.PAID++;
    else if (status === "OVERDUE") statusCounts.OVERDUE++;
    else if (status === "PENDING") statusCounts.PENDING++;
  }

  const installmentsByStatus = [
    {
      name: PAYMENT_STATUS_LABELS.PAID,
      value: statusCounts.PAID,
      color: FINANCIAL_CHART_COLORS.paid,
    },
    {
      name: PAYMENT_STATUS_LABELS.PENDING,
      value: statusCounts.PENDING,
      color: FINANCIAL_CHART_COLORS.pending,
    },
    {
      name: PAYMENT_STATUS_LABELS.OVERDUE,
      value: statusCounts.OVERDUE,
      color: FINANCIAL_CHART_COLORS.overdue,
    },
  ].filter((s) => s.value > 0);

  const clientIds = topClients.map((t) => t.clientId);
  const clientNames = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true },
  });
  const nameMap = new Map(clientNames.map((c) => [c.id, c.name]));

  const topClientsByRevenue = topClients.map((t) => ({
    name: nameMap.get(t.clientId) ?? "Cliente",
    value: decimalToNumber(t._sum.amount),
    color: FINANCIAL_CHART_COLORS.receipt,
  }));

  return {
    cashFlowByMonth,
    receiptsByMonth,
    expensesByMonth,
    installmentsByStatus,
    topClientsByRevenue,
  };
}

export async function getFinancialDashboard(
  officeId: string
): Promise<FinancialDashboardData> {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [
    receiptsMonthAgg,
    receiptsTotalAgg,
    pendingReceiptsAgg,
    expensesMonthAgg,
    activeContracts,
    pendingInstallments,
    overdueInstallmentsCount,
    recentReceipts,
    overdueInstallments,
    charts,
  ] = await Promise.all([
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
        status: { in: ["PENDING", "OVERDUE"] },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        officeId,
        deletedAt: null,
        direction: "EXPENSE",
        status: "PAID",
        paidAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.contract.count({
      where: {
        officeId,
        deletedAt: null,
        status: { in: ["SIGNED", "ACTIVE"] },
      },
    }),
    prisma.installment.count({
      where: { officeId, deletedAt: null, status: "PENDING" },
    }),
    prisma.installment.count({
      where: {
        officeId,
        deletedAt: null,
        status: "PENDING",
        dueDate: { lt: now },
      },
    }),
    getReceipts(officeId, {}),
    getInstallments(officeId, { status: "OVERDUE" }),
    buildFinancialCharts(officeId),
  ]);

  const kpis: FinancialKpis = {
    receiptsMonth: decimalToNumber(receiptsMonthAgg._sum.amount),
    receiptsTotal: decimalToNumber(receiptsTotalAgg._sum.amount),
    pendingReceipts: decimalToNumber(pendingReceiptsAgg._sum.amount),
    overdueInstallments: overdueInstallmentsCount,
    expensesMonth: decimalToNumber(expensesMonthAgg._sum.amount),
    activeContracts,
    pendingInstallments,
  };

  return {
    kpis,
    charts,
    recentReceipts: recentReceipts.slice(0, 8),
    overdueInstallments: overdueInstallments.slice(0, 8),
  };
}

export async function getFinancialReports(
  officeId: string,
  filters: FinancialListFilters = {}
): Promise<FinancialChartData> {
  const charts = await buildFinancialCharts(officeId);

  if (filters.clientId) {
    const receipts = await getReceipts(officeId, {
      ...filters,
      status: "PAID",
    });
    const expenses = await getExpenses(officeId, {
      ...filters,
      status: "PAID",
    });

    const months = getLast6Months();
    const receiptsByMonth = buildMonthlySeries(
      months,
      receipts
        .filter((r) => r.paidAt)
        .map((r) => ({
          date: new Date(r.paidAt!),
          value: r.amount,
        }))
    );
    const expensesByMonth = buildMonthlySeries(
      months,
      expenses
        .filter((e) => e.paidAt)
        .map((e) => ({
          date: new Date(e.paidAt!),
          value: e.amount,
        }))
    );

    charts.receiptsByMonth = receiptsByMonth;
    charts.expensesByMonth = expensesByMonth;
    charts.cashFlowByMonth = months.map((m, idx) => ({
      label: m.label,
      value: receiptsByMonth[idx].value - expensesByMonth[idx].value,
    }));
  }

  return charts;
}
