export const KANBAN_COLUMNS = [
  {
    slug: "novo",
    name: "Novo",
    color: "#3B82F6",
    sortOrder: 1,
    isDefault: true,
    isFinal: false,
  },
  {
    slug: "triagem",
    name: "Triagem",
    color: "#8B5CF6",
    sortOrder: 2,
    isFinal: false,
  },
  {
    slug: "aguardando-documentos",
    name: "Aguardando Documentos",
    color: "#F59E0B",
    sortOrder: 3,
    isFinal: false,
  },
  {
    slug: "em-analise",
    name: "Em Análise",
    color: "#06B6D4",
    sortOrder: 4,
    isFinal: false,
  },
  {
    slug: "em-atendimento",
    name: "Em Atendimento",
    color: "#10B981",
    sortOrder: 5,
    isFinal: false,
  },
  {
    slug: "processo-protocolado",
    name: "Processo Protocolado",
    color: "#6366F1",
    sortOrder: 6,
    isFinal: false,
  },
  {
    slug: "finalizado",
    name: "Finalizado",
    color: "#22C55E",
    sortOrder: 7,
    isFinal: true,
  },
  {
    slug: "arquivado",
    name: "Arquivado",
    color: "#6B7280",
    sortOrder: 8,
    isFinal: true,
  },
] as const;

export type KanbanColumnSlug = (typeof KANBAN_COLUMNS)[number]["slug"];
