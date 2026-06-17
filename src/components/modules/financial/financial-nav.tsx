"use client";

import { FINANCIAL_NAV_ITEMS } from "@/constants/financial";
import { AppTabNavLink } from "@/components/shared/navigation/app-nav-link";

export function FinancialNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px">
      {FINANCIAL_NAV_ITEMS.map((item) => (
        <AppTabNavLink
          key={item.href}
          href={item.href}
          label={item.label}
          exact={item.exact}
        />
      ))}
    </nav>
  );
}
