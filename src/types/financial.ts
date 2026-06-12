import type {
  ContractStatus,
  ContractType,
  PaymentDirection,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

export interface FinancialListFilters {
  clientId?: string;
  contractId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
}

export interface FinancialKpis {
  receiptsMonth: number;
  receiptsTotal: number;
  pendingReceipts: number;
  overdueInstallments: number;
  expensesMonth: number;
  activeContracts: number;
  pendingInstallments: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface NamedChartPoint {
  name: string;
  value: number;
  color?: string;
}

export interface FinancialChartData {
  cashFlowByMonth: ChartDataPoint[];
  receiptsByMonth: ChartDataPoint[];
  expensesByMonth: ChartDataPoint[];
  installmentsByStatus: NamedChartPoint[];
  topClientsByRevenue: NamedChartPoint[];
}

export interface FinancialDashboardData {
  kpis: FinancialKpis;
  charts: FinancialChartData;
  recentReceipts: PaymentRow[];
  overdueInstallments: InstallmentRow[];
}

export interface ContractRow {
  id: string;
  title: string;
  content: string;
  type: ContractType;
  status: ContractStatus;
  value: number | null;
  signedAt: string | null;
  expiresAt: string | null;
  client: { id: string; name: string };
  case: { id: string; title: string } | null;
  installmentsCount: number;
  paidInstallments: number;
  createdAt: string;
}

export interface InstallmentRow {
  id: string;
  number: number;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidAt: string | null;
  notes: string | null;
  client: { id: string; name: string };
  contract: { id: string; title: string };
  receipt: { id: string; invoiceNumber: string | null } | null;
}

export interface PaymentRow {
  id: string;
  invoiceNumber: string | null;
  description: string | null;
  amount: number;
  direction: PaymentDirection;
  status: PaymentStatus;
  method: PaymentMethod | null;
  dueDate: string;
  paidAt: string | null;
  client: { id: string; name: string };
  case: { id: string; title: string } | null;
  contract: { id: string; title: string } | null;
  installment: { id: string; number: number } | null;
}

export interface ClientFinancialSummary {
  id: string;
  name: string;
  cpfCnpj: string | null;
  contractsCount: number;
  totalContractValue: number;
  receiptsPaid: number;
  receiptsPending: number;
  installmentsOverdue: number;
}

export interface ClientFinancialDetail {
  client: { id: string; name: string; cpfCnpj: string | null; email: string | null };
  summary: {
    contractValue: number;
    receiptsPaid: number;
    receiptsPending: number;
    expensesPaid: number;
    installmentsOverdue: number;
  };
  contracts: ContractRow[];
  installments: InstallmentRow[];
  receipts: PaymentRow[];
  expenses: PaymentRow[];
}

export interface FinancialSelectOption {
  id: string;
  label: string;
}
