export type ReportType =
  | "clientes"
  | "casos"
  | "advogados"
  | "financeiro"
  | "leads";

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  lawyerId?: string;
  status?: string;
}

export interface ReportSummaryItem {
  label: string;
  value: string | number;
}

export interface ClientReportRow {
  id: string;
  name: string;
  type: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  lawyerName: string;
  casesCount: number;
  isActive: string;
  createdAt: string;
}

export interface CaseReportRow {
  id: string;
  title: string;
  caseNumber: string;
  caseType: string;
  clientName: string;
  lawyerName: string;
  statusName: string;
  priority: string;
  court: string;
  openedAt: string;
  closedAt: string;
}

export interface LawyerReportRow {
  id: string;
  name: string;
  oab: string;
  specialty: string;
  isPartner: string;
  clientsCount: number;
  activeCases: number;
  totalCases: number;
  pendingTasks: number;
  receiptsTotal: number;
}

export interface FinancialReportRow {
  id: string;
  direction: string;
  clientName: string;
  description: string;
  amount: number;
  status: string;
  method: string;
  dueDate: string;
  paidAt: string;
  invoiceNumber: string;
}

export interface LeadConversionRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  interestArea: string;
  assignedToName: string;
  convertedClientName: string;
  createdAt: string;
  convertedAt: string;
  daysToConvert: string;
}

export interface LeadSourceStat {
  source: string;
  total: number;
  converted: number;
  rate: number;
}

export interface LeadStatusStat {
  status: string;
  count: number;
}

export interface ClientsReportData {
  summary: ReportSummaryItem[];
  rows: ClientReportRow[];
}

export interface CasesReportData {
  summary: ReportSummaryItem[];
  rows: CaseReportRow[];
}

export interface LawyersReportData {
  summary: ReportSummaryItem[];
  rows: LawyerReportRow[];
}

export interface FinancialReportData {
  summary: ReportSummaryItem[];
  rows: FinancialReportRow[];
}

export interface LeadsConversionReportData {
  summary: ReportSummaryItem[];
  bySource: LeadSourceStat[];
  byStatus: LeadStatusStat[];
  rows: LeadConversionRow[];
}

export type ReportData =
  | ClientsReportData
  | CasesReportData
  | LawyersReportData
  | FinancialReportData
  | LeadsConversionReportData;
