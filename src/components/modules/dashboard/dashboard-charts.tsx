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
import { CHART_COLORS } from "@/constants/dashboard";
import { formatCurrency } from "@/lib/dashboard/format";
import type { DashboardChartData } from "@/types/dashboard";

interface DashboardChartsProps {
  charts: DashboardChartData;
  showRevenue?: boolean;
}

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--card))",
  fontSize: "12px",
};

export function DashboardCharts({
  charts,
  showRevenue = true,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {showRevenue && (
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans font-medium">
              Receita mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height={280}>
              <AreaChart data={charts.revenueByMonth}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.gold} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
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
                  formatter={(value: number) => [formatCurrency(value), "Receita"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS.gold}
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans font-medium">
            Novos clientes por mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer height={240}>
            <BarChart data={charts.clientsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="value"
                fill={CHART_COLORS.success}
                radius={[4, 4, 0, 0]}
                name="Clientes"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans font-medium">
            Documentos por mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer height={240}>
            <BarChart data={charts.documentsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="value"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
                name="Documentos"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans font-medium">
            Leads por status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer height={260}>
            <BarChart data={charts.leadsByStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Leads">
                {charts.leadsByStatus.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans font-medium">
            Casos por status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer height={260}>
            <PieChart>
              <Pie
                data={charts.casesByStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {charts.casesByStatus.map((entry) => (
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
          </ChartContainer>
        </CardContent>
      </Card>
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
