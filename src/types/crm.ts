import type {
  CasePriority,
  ClientType,
  LeadSource,
  LeadStatus,
} from "@prisma/client";

export interface CrmListFilters {
  q?: string;
  status?: string;
  source?: string;
  assignedToId?: string;
  lawyerId?: string;
  priority?: string;
  type?: string;
  isActive?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CrmTeamMember {
  id: string;
  name: string;
  role: string;
}

export interface CrmDashboardStats {
  totalLeads: number;
  newLeads: number;
  totalClients: number;
  activeClients: number;
  activeCases: number;
  urgentCases: number;
  pendingTasks: number;
  conversionRate: number;
}

export interface CrmLeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  status: LeadStatus;
  interestArea: string | null;
  notes: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmLeadTriageDocument {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: Date;
}

export interface CrmLeadTriageDetail {
  id: string;
  practiceAreaSlug: string;
  completedAt: Date | null;
  cpfCnpj: string | null;
  city: string | null;
  state: string | null;
  additionalNotes: string | null;
  answers: { questionLabel: string; answer: string }[];
  documents: CrmLeadTriageDocument[];
  lawyerName: string | null;
  lawyerOab: string | null;
}

export interface CrmLeadDetail extends CrmLeadRow {
  triage: CrmLeadTriageDetail | null;
}

export interface CrmClientRow {
  id: string;
  name: string;
  type: ClientType;
  cpfCnpj: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  isActive: boolean;
  lawyerName: string | null;
  casesCount: number;
  createdAt: Date;
}

export interface CrmCaseRow {
  id: string;
  title: string;
  caseNumber: string | null;
  caseType: string;
  priority: CasePriority;
  clientName: string;
  lawyerName: string;
  statusId: string;
  statusName: string;
  statusColor: string;
  statusSlug: string;
  openedAt: Date;
  updatedAt: Date;
}

export interface CrmKanbanLeadCard {
  id: string;
  name: string;
  interestArea: string | null;
  source: LeadSource;
  assignedToName: string | null;
  createdAt: Date;
}

export interface CrmKanbanCaseCard {
  id: string;
  title: string;
  caseNumber: string | null;
  clientName: string;
  lawyerName: string;
  priority: CasePriority;
  statusId: string;
  openedAt: Date;
}

export interface CrmHistoryItem {
  id: string;
  type: "case_status" | "lead_created" | "case_opened";
  title: string;
  description: string | null;
  actorName: string;
  createdAt: Date;
  meta?: {
    caseId?: string;
    leadId?: string;
    statusColor?: string;
  };
}

export interface CrmSearchResult {
  leads: { id: string; name: string; email: string | null; status: LeadStatus }[];
  clients: { id: string; name: string; cpfCnpj: string | null }[];
  cases: { id: string; title: string; caseNumber: string | null }[];
}

export interface CrmCaseStatusOption {
  id: string;
  name: string;
  slug: string;
  color: string;
  sortOrder: number;
}
