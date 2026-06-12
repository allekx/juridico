import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FinancialKpisGrid } from "@/components/modules/financial/financial-kpis";
import { FinancialCharts } from "@/components/modules/financial/financial-charts";
import { PaymentStatusBadge } from "@/components/modules/financial/status-badge";
import { formatCurrency, formatDate } from "@/lib/financial/format";
import type { FinancialDashboardData } from "@/types/financial";

interface FinancialDashboardProps {
  data: FinancialDashboardData;
}

export function FinancialDashboard({ data }: FinancialDashboardProps) {
  return (
    <div className="space-y-8">
      <FinancialKpisGrid kpis={data.kpis} />
      <FinancialCharts charts={data.charts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-sans font-medium">
              Últimos recebimentos
            </CardTitle>
            <Link
              href="/dashboard/financeiro/recebimentos"
              className="text-sm text-gold hover:underline"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      Nenhum recebimento registrado
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentReceipts.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.client.name}</TableCell>
                      <TableCell>{formatCurrency(r.amount)}</TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-sans font-medium">
              Parcelas vencidas
            </CardTitle>
            <Link
              href="/dashboard/financeiro/parcelas?status=OVERDUE"
              className="text-sm text-gold hover:underline"
            >
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.overdueInstallments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      Nenhuma parcela vencida
                    </TableCell>
                  </TableRow>
                ) : (
                  data.overdueInstallments.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>{i.client.name}</TableCell>
                      <TableCell>
                        {i.number}/{i.contract.title.slice(0, 20)}
                      </TableCell>
                      <TableCell>{formatDate(i.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(i.amount)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
