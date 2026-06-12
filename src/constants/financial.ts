import type {
  ContractStatus,
  ContractType,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

export const FINANCIAL_NAV_ITEMS = [
  { href: "/dashboard/financeiro", label: "Dashboard", exact: true },
  { href: "/dashboard/financeiro/contratos", label: "Contratos" },
  { href: "/dashboard/financeiro/parcelas", label: "Parcelas" },
  { href: "/dashboard/financeiro/recebimentos", label: "Recebimentos" },
  { href: "/dashboard/financeiro/pagamentos", label: "Pagamentos" },
  { href: "/dashboard/financeiro/clientes", label: "Por Cliente" },
  { href: "/dashboard/financeiro/relatorios", label: "Relatórios" },
] as const;

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  SIGNED: "Assinado",
  ACTIVE: "Ativo",
  EXPIRED: "Expirado",
  CANCELLED: "Cancelado",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  FEE_AGREEMENT: "Honorários",
  SERVICE: "Prestação de serviços",
  POWER_OF_ATTORNEY: "Procuração",
  NDA: "NDA",
  OTHER: "Outro",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
  REFUNDED: "Estornado",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "PIX",
  BANK_TRANSFER: "Transferência",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  CASH: "Dinheiro",
  CHECK: "Cheque",
  BOLETO: "Boleto",
  OTHER: "Outro",
};

export const CONTRACT_STATUS_VARIANT: Record<
  ContractStatus,
  "muted" | "default" | "warning" | "success" | "destructive"
> = {
  DRAFT: "muted",
  SENT: "default",
  SIGNED: "success",
  ACTIVE: "success",
  EXPIRED: "warning",
  CANCELLED: "destructive",
};

export const PAYMENT_STATUS_VARIANT: Record<
  PaymentStatus,
  "muted" | "default" | "warning" | "success" | "destructive"
> = {
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "muted",
  REFUNDED: "default",
};

export const FINANCIAL_CHART_COLORS = {
  receipt: "hsl(var(--gold))",
  expense: "hsl(var(--destructive))",
  pending: "hsl(var(--warning))",
  paid: "hsl(var(--success))",
  overdue: "hsl(var(--destructive))",
} as const;
