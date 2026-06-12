"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FINANCIAL_CHART_COLORS } from "@/constants/financial";
import { formatCurrency } from "@/lib/financial/format";
import type { FinancialChartData } from "@/types/financial";

interface FinancialChartsProps {
  charts: FinancialChartData;
  compact?: boolean;
}

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--card))",
  fontSize: "12px",
};

export function FinancialCharts({ charts, compact = false }: FinancialChartsProps) {
  const revenueVsExpenses = charts.receiptsByMonth.map((r, idx) => ({
    label: r.label,
    receipts: r.value,
    expenses: charts.expensesByMonth[idx]?.value ?? 0,
  }));

  return (
    <div className={`grid gap-6 ${compact ? "" : "lg:grid-cols-2"}`}>
      <Card variant="elevated" className={compact ? "" : "lg:col-span-2"}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans font-medium">
            Receitas vs despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer height={compact ? 220 : 280}>
            <BarChart data={revenueVsExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "receipts" ? "Receitas" : "Despesas",
                ]}
              />
              <Legend />
              <Bar
                dataKey="receipts"
                name="Receitas"
                fill={FINANCIAL_CHART_COLORS.receipt}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="Despesas"
                fill={FINANCIAL_CHART_COLORS.expense}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans font-medium">
            Fluxo de caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer height={240}>
            <AreaChart data={charts.cashFlowByMonth}>
              <defs>
                <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={FINANCIAL_CHART_COLORS.receipt}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={FINANCIAL_CHART_COLORS.receipt}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatCurrency(value), "Saldo"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={FINANCIAL_CHART_COLORS.receipt}
                strokeWidth={2}
                fill="url(#cashFlowGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans font-medium">
            Parcelas por status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer height={240}>
            {charts.installmentsByStatus.length > 0 ? (
              <PieChart>
                <Pie
                  data={charts.installmentsByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {charts.installmentsByStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhuma parcela cadastrada
              </p>
            )}
          </ChartContainer>
        </CardContent>
      </Card>

      {!compact && charts.topClientsByRevenue.length > 0 && (
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans font-medium">
              Top clientes por receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height={260}>
              <BarChart data={charts.topClientsByRevenue} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [formatCurrency(value), "Receita"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Receita">
                  {charts.topClientsByRevenue.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ChartContainer({
  children,
  height,
}: {
  children: React.ReactElement;
  height: number;
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
