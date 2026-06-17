"use client";

import { REPORT_NAV_ITEMS } from "@/constants/reports";
import { AppTabNavLink } from "@/components/shared/navigation/app-nav-link";
import type { ReportType } from "@/types/reports";

interface ReportsNavProps {
  visibleTypes: ReportType[];
}

export function ReportsNav({ visibleTypes }: ReportsNavProps) {
  const items = REPORT_NAV_ITEMS.filter((item) =>
    visibleTypes.includes(item.id)
  );

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px">
      {items.map((item) => (
        <AppTabNavLink key={item.href} href={item.href} label={item.label} />
      ))}
    </nav>
  );
}
