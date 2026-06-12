import type { Metadata } from "next";
import { withPermission } from "@/lib/auth/guards";
import { getFinancialDashboard } from "@/lib/financial/queries";
import { FinancialDashboard } from "@/components/modules/financial/financial-dashboard";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default async function FinanceiroPage() {
  const user = await withPermission("financeiro:read");
  const data = await getFinancialDashboard(user.officeId);

  return <FinancialDashboard data={data} />;
}
