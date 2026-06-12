import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { withAuth } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { getDashboardData } from "@/lib/dashboard/queries";
import { PageHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { DashboardKpisGrid } from "@/components/modules/dashboard/dashboard-kpis";
import { DashboardCharts } from "@/components/modules/dashboard/dashboard-charts";

export const metadata: Metadata = {
  title: "Dashboard",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const user = await withAuth();
  const showRevenue = hasPermission(user.role, "financeiro:read");

  const { kpis, charts } = await getDashboardData(user.officeId);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${getGreeting()}, ${user.name.split(" ")[0]}`}
        description="Visão geral do escritório — indicadores e tendências em tempo real."
      >
        <Button asChild size="sm">
          <Link href="/dashboard/crm">
            Abrir CRM
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHeader>

      <DashboardKpisGrid kpis={kpis} showRevenue={showRevenue} />

      <DashboardCharts charts={charts} showRevenue={showRevenue} />
    </div>
  );
}
