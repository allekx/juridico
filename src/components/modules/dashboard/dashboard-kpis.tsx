import Link from "next/link";
import {
  UserPlus,
  Briefcase,
  CheckCircle2,
  Users,
  FileText,
  DollarSign,
} from "lucide-react";
import { StatCard } from "@/components/modules/crm/stat-card";
import { formatCurrency } from "@/lib/dashboard/format";
import type { DashboardKpis } from "@/types/dashboard";

interface DashboardKpisProps {
  kpis: DashboardKpis;
  showRevenue?: boolean;
}

export function DashboardKpisGrid({
  kpis,
  showRevenue = true,
}: DashboardKpisProps) {
  const items = [
    {
      label: "Novos clientes",
      value: kpis.newClients,
      hint: kpis.newClientsHint,
      icon: UserPlus,
      variant: "success" as const,
      href: "/dashboard/crm/clientes",
    },
    {
      label: "Casos ativos",
      value: kpis.activeCases,
      hint: kpis.activeCasesHint,
      icon: Briefcase,
      variant: "default" as const,
      href: "/dashboard/crm/casos",
    },
    {
      label: "Casos concluídos",
      value: kpis.completedCases,
      hint: kpis.completedCasesHint,
      icon: CheckCircle2,
      variant: "gold" as const,
      href: "/dashboard/crm/casos",
    },
    {
      label: "Leads",
      value: kpis.totalLeads,
      hint: kpis.leadsHint,
      icon: Users,
      variant: "gold" as const,
      href: "/dashboard/crm/leads",
    },
    {
      label: "Documentos",
      value: kpis.totalDocuments,
      hint: kpis.documentsHint,
      icon: FileText,
      variant: "default" as const,
      href: "/dashboard/documentos",
    },
    ...(showRevenue
      ? [
          {
            label: "Receita",
            value: formatCurrency(kpis.revenue),
            hint: kpis.revenueHint,
            icon: DollarSign,
            variant: "success" as const,
            href: "/dashboard/financeiro",
          },
        ]
      : []),
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Link key={item.label} href={item.href} className="group">
          <StatCard
            label={item.label}
            value={item.value}
            hint={item.hint}
            icon={item.icon}
            variant={item.variant}
          />
        </Link>
      ))}
    </div>
  );
}
