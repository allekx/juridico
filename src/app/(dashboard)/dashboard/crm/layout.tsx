import { CrmNav } from "@/components/modules/crm/crm-nav";
import { GlobalSearch } from "@/components/modules/crm/global-search";

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            CRM Jurídico
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestão comercial de leads, clientes e casos
          </p>
        </div>
        <GlobalSearch />
      </div>

      <CrmNav />

      {children}
    </div>
  );
}
