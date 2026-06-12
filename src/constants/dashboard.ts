import type { LeadStatus } from "@prisma/client";

export const CHART_COLORS = {
  primary: "#2c4a6e",
  gold: "#a8844a",
  success: "#3d7a5c",
  warning: "#b8860b",
  info: "#4a6fa5",
  muted: "#9ca3af",
  accent: "#8b5cf6",
} as const;

export const CHART_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.gold,
  CHART_COLORS.success,
  CHART_COLORS.info,
  CHART_COLORS.accent,
  CHART_COLORS.warning,
  CHART_COLORS.muted,
];

export const LEAD_STATUS_CHART_LABELS: Record<LeadStatus, string> = {
  NEW: "Novo",
  CONTACTED: "Contatado",
  QUALIFIED: "Qualificado",
  PROPOSAL: "Proposta",
  NEGOTIATION: "Negociação",
  CONVERTED: "Convertido",
  LOST: "Perdido",
};

export const LEAD_STATUS_CHART_COLORS: Record<LeadStatus, string> = {
  NEW: CHART_COLORS.gold,
  CONTACTED: CHART_COLORS.info,
  QUALIFIED: CHART_COLORS.primary,
  PROPOSAL: CHART_COLORS.warning,
  NEGOTIATION: CHART_COLORS.accent,
  CONVERTED: CHART_COLORS.success,
  LOST: CHART_COLORS.muted,
};
