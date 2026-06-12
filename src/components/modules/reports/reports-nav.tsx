"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { REPORT_NAV_ITEMS } from "@/constants/reports";
import type { ReportType } from "@/types/reports";

interface ReportsNavProps {
  visibleTypes: ReportType[];
}

export function ReportsNav({ visibleTypes }: ReportsNavProps) {
  const pathname = usePathname();
  const items = REPORT_NAV_ITEMS.filter((item) =>
    visibleTypes.includes(item.id)
  );

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-gold text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
