import type { KanbanColumnSlug } from "@/constants/kanban";

export type ProcessStepState = "completed" | "current" | "pending";

export interface ProcessTimelineStepDefinition {
  id: string;
  label: string;
  description: string;
}

/** Etapas fixas exibidas ao cliente — ordem de acompanhamento processual. */
export const PROCESS_TIMELINE_STEPS: ProcessTimelineStepDefinition[] = [
  {
    id: "cadastro-recebido",
    label: "Cadastro recebido",
    description: "Seus dados foram registrados no escritório.",
  },
  {
    id: "documentos-enviados",
    label: "Documentos enviados",
    description: "Documentação necessária recebida ou em conferência.",
  },
  {
    id: "analise-juridica",
    label: "Análise jurídica",
    description: "Equipe analisando viabilidade e estratégia do caso.",
  },
  {
    id: "processo-protocolado",
    label: "Processo protocolado",
    description: "Ação distribuída ou petição protocolada no tribunal.",
  },
  {
    id: "audiencia-marcada",
    label: "Audiência marcada",
    description: "Audiência ou diligência agendada.",
  },
  {
    id: "finalizado",
    label: "Finalizado",
    description: "Caso encerrado ou concluído.",
  },
];

/** Índice da etapa atual com base no slug do status do kanban. */
const STATUS_SLUG_TO_STEP_INDEX: Record<KanbanColumnSlug | string, number> = {
  novo: 0,
  triagem: 0,
  "aguardando-documentos": 1,
  "em-analise": 2,
  "processo-protocolado": 3,
  "em-atendimento": 4,
  finalizado: 5,
  arquivado: 5,
};

export function getCurrentStepIndex(
  statusSlug: string,
  isFinal = false
): number {
  if (isFinal) return PROCESS_TIMELINE_STEPS.length;
  return STATUS_SLUG_TO_STEP_INDEX[statusSlug] ?? 0;
}
