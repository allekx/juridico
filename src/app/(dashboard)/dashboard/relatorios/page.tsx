import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { withAuth } from "@/lib/auth/guards";
import { getVisibleReportTypes } from "@/lib/reports/permissions";
import { REPORT_NAV_ITEMS } from "@/constants/reports";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBarChart } from "lucide-react";

export const metadata: Metadata = {
  title: "Relatórios",
};

export default async function RelatoriosPage() {
  const user = await withAuth();
  const visibleTypes = getVisibleReportTypes(user.role);

  if (visibleTypes.length === 1) {
    const item = REPORT_NAV_ITEMS.find((i) => i.id === visibleTypes[0]);
    if (item) redirect(item.href);
  }

  const items = REPORT_NAV_ITEMS.filter((i) => visibleTypes.includes(i.id));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link key={item.id} href={item.href}>
          <Card
            variant="elevated"
            className="h-full transition-colors hover:border-gold/40"
          >
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="rounded-lg bg-muted p-2 text-gold">
                <FileBarChart className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-sans font-medium">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
