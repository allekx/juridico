import { withPermission } from "@/lib/auth/guards";
import { FinancialNav } from "@/components/modules/financial/financial-nav";

export default async function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await withPermission("financeiro:read");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Gestão Financeira
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contratos, parcelas, recebimentos e relatórios integrados aos clientes
        </p>
      </div>

      <FinancialNav />

      {children}
    </div>
  );
}
