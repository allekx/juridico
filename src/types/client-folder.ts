import type { ClientFolderAction, ContractStatus } from "@prisma/client";

import type { DocumentItem } from "@/lib/documents/queries";



export type ClientFolderTab =

  | "documentos"

  | "contratos"

  | "procuracoes"

  | "historico"

  | "mensagens";



export interface ClientFolderSummary {

  id: string;

  name: string;

  type: string;

  cpfCnpj: string | null;

  email: string | null;

  phone: string | null;

  lawyerName: string | null;

  documentCount: number;

  contractCount: number;

  powerOfAttorneyCount: number;

  messageCount: number;

}



export interface ClientContractItem {

  id: string;

  title: string;

  status: ContractStatus;

  type: string;

  value: number | null;

  hasFile: boolean;

  signedAt: string | null;

  createdByName: string;

  createdAt: string;

}



export interface ClientMessageItem {

  id: string;

  subject: string | null;

  body: string;

  authorName: string;

  createdAt: string;

}



export interface ClientFolderEventItem {

  id: string;

  action: ClientFolderAction;

  description: string;

  actorName: string;

  entityType: string;

  createdAt: string;

}



export interface ClientFolderData {

  client: {

    id: string;

    name: string;

    type: string;

    cpfCnpj: string | null;

    email: string | null;

    phone: string | null;

    lawyerName: string | null;

  };

  documents: DocumentItem[];

  contracts: ClientContractItem[];

  powerOfAttorneys: DocumentItem[];

  messages: ClientMessageItem[];

  history: ClientFolderEventItem[];

}

