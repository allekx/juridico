import { FinancialCharts } from "@/components/modules/financial/financial-charts";
import { FinancialFilters } from "@/components/modules/financial/financial-filters";
import { PageHeader } from "@/components/ui/typography";
import type {
  FinancialChartData,
  FinancialListFilters,
  FinancialSelectOption,
} from "@/types/financial";

interface ReportsBoardProps {
  charts: FinancialChartData;
  filters: FinancialListFilters;
  clients: FinancialSelectOption[];
}

export function ReportsBoard({ charts, filters, clients }: ReportsBoardProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Receitas, despesas, fluxo de caixa e desempenho por cliente"
      />

      <FinancialFilters
        filters={filters}
        clients={clients}
        showStatusFilter={false}
      />

      <FinancialCharts charts={charts} />
    </div>
  );
}
