import type { CasePriority, LeadSource, LeadStatus } from "@prisma/client";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Novo",
  CONTACTED: "Contatado",
  QUALIFIED: "Qualificado",
  PROPOSAL: "Proposta",
  NEGOTIATION: "Negociação",
  CONVERTED: "Convertido",
  LOST: "Perdido",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  WEBSITE: "Site",
  REFERRAL: "Indicação",
  SOCIAL_MEDIA: "Redes sociais",
  PHONE: "Telefone",
  EMAIL: "E-mail",
  WALK_IN: "Presencial",
  TRIAGE: "Triagem",
  OTHER: "Outro",
};

export const CASE_PRIORITY_LABELS: Record<CasePriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const LEAD_KANBAN_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "CONVERTED",
  "LOST",
];

export const LEAD_STATUS_VARIANT: Record<
  LeadStatus,
  "gold" | "default" | "warning" | "success" | "muted" | "destructive"
> = {
  NEW: "gold",
  CONTACTED: "default",
  QUALIFIED: "default",
  PROPOSAL: "warning",
  NEGOTIATION: "warning",
  CONVERTED: "success",
  LOST: "muted",
};

export const CASE_PRIORITY_VARIANT: Record<
  CasePriority,
  "muted" | "default" | "warning" | "destructive"
> = {
  LOW: "muted",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
};

export const CRM_NAV_ITEMS = [
  { href: "/dashboard/crm", label: "Visão Geral", exact: true },
  { href: "/dashboard/crm/leads", label: "Leads" },
  { href: "/dashboard/crm/kanban", label: "Funil de Leads" },
  { href: "/dashboard/crm/clientes", label: "Clientes" },
  { href: "/dashboard/crm/casos", label: "Casos" },
  { href: "/dashboard/kanban", label: "Kanban Jurídico" },
  { href: "/dashboard/crm/historico", label: "Histórico" },
] as const;
