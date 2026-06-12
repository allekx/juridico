import type { ClientFolderAction } from "@prisma/client";
import type { ClientFolderTab } from "@/types/client-folder";

export const CLIENT_FOLDER_TABS: { id: ClientFolderTab; label: string }[] = [
  { id: "documentos", label: "Documentos" },
  { id: "contratos", label: "Contratos" },
  { id: "procuracoes", label: "Procurações" },
  { id: "historico", label: "Histórico" },
  { id: "mensagens", label: "Mensagens" },
];

export const FOLDER_ACTION_LABELS: Record<ClientFolderAction, string> = {
  FILE_UPLOADED: "Upload",
  FILE_DOWNLOADED: "Download",
  FILE_DELETED: "Exclusão",
  FILE_VERSIONED: "Nova versão",
  CONTRACT_CREATED: "Contrato criado",
  CONTRACT_DELETED: "Contrato excluído",
  MESSAGE_SENT: "Mensagem",
};
