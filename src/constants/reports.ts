import type { ReportType } from "@/types/reports";

export const REPORT_NAV_ITEMS: {
  id: ReportType;
  href: string;
  label: string;
  description: string;
}[] = [
  {
    id: "clientes",
    href: "/dashboard/relatorios/clientes",
    label: "Clientes",
    description: "Cadastro, status e volume de casos por cliente",
  },
  {
    id: "casos",
    href: "/dashboard/relatorios/casos",
    label: "Casos",
    description: "Processos por status, advogado e prioridade",
  },
  {
    id: "advogados",
    href: "/dashboard/relatorios/advogados",
    label: "Advogados",
    description: "Carga de trabalho e desempenho da equipe jurídica",
  },
  {
    id: "financeiro",
    href: "/dashboard/relatorios/financeiro",
    label: "Financeiro",
    description: "Recebimentos, pagamentos e saldo no período",
  },
  {
    id: "leads",
    href: "/dashboard/relatorios/leads",
    label: "Conversão de Leads",
    description: "Funil comercial, taxas de conversão e origens",
  },
];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  clientes: "Clientes",
  casos: "Casos",
  advogados: "Advogados",
  financeiro: "Financeiro",
  leads: "Conversão de Leads",
};
