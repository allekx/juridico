export interface DashboardKpis {
  newClients: number;
  newClientsHint: string;
  activeCases: number;
  activeCasesHint: string;
  completedCases: number;
  completedCasesHint: string;
  totalLeads: number;
  leadsHint: string;
  totalDocuments: number;
  documentsHint: string;
  revenue: number;
  revenueHint: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface StatusChartPoint {
  name: string;
  value: number;
  color: string;
}

export interface DashboardChartData {
  revenueByMonth: ChartDataPoint[];
  clientsByMonth: ChartDataPoint[];
  documentsByMonth: ChartDataPoint[];
  leadsByStatus: StatusChartPoint[];
  casesByStatus: StatusChartPoint[];
}

export interface DashboardData {
  kpis: DashboardKpis;
  charts: DashboardChartData;
}
