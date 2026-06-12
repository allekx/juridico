import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  AlertTriangle,
  Clock,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/financial/format";
import type { FinancialKpis } from "@/types/financial";

interface FinancialKpisProps {
  kpis: FinancialKpis;
}

const items = [
  {
    key: "receiptsMonth" as const,
    label: "Recebido no mês",
    icon: ArrowUpRight,
    href: "/dashboard/financeiro/recebimentos",
    accent: "text-success",
  },
  {
    key: "pendingReceipts" as const,
    label: "A receber",
    icon: Clock,
    href: "/dashboard/financeiro/recebimentos?status=PENDING",
    accent: "text-warning",
  },
  {
    key: "expensesMonth" as const,
    label: "Pagamentos no mês",
    icon: ArrowDownRight,
    href: "/dashboard/financeiro/pagamentos",
    accent: "text-destructive",
  },
  {
    key: "activeContracts" as const,
    label: "Contratos ativos",
    icon: FileText,
    href: "/dashboard/financeiro/contratos",
    accent: "text-gold",
    isCount: true,
  },
  {
    key: "overdueInstallments" as const,
    label: "Parcelas vencidas",
    icon: AlertTriangle,
    href: "/dashboard/financeiro/parcelas?status=OVERDUE",
    accent: "text-destructive",
    isCount: true,
  },
  {
    key: "receiptsTotal" as const,
    label: "Receita total",
    icon: Wallet,
    href: "/dashboard/financeiro/relatorios",
    accent: "text-foreground",
  },
];

export function FinancialKpisGrid({ kpis }: FinancialKpisProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        const value = kpis[item.key];

        return (
          <Link key={item.key} href={item.href}>
            <Card variant="elevated" className="transition-colors hover:border-gold/40">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-lg bg-muted p-2.5 ${item.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-display text-xl font-semibold">
                    {item.isCount ? value : formatCurrency(value)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
