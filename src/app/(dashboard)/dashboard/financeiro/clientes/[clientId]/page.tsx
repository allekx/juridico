import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { withPermission } from "@/lib/auth/guards";
import { getClientFinancialDetail } from "@/lib/financial/queries";
import { ClientFinancialDetailView } from "@/components/modules/financial/client-financial-detail";

export const metadata: Metadata = {
  title: "Cliente — Financeiro",
};

export default async function ClienteFinanceiroPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const user = await withPermission("financeiro:read");
  const { clientId } = await params;

  const data = await getClientFinancialDetail(user.officeId, clientId);
  if (!data) notFound();

  return <ClientFinancialDetailView data={data} />;
}
