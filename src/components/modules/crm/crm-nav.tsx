"use client";

import { CRM_NAV_ITEMS } from "@/constants/crm";
import { AppTabNavLink } from "@/components/shared/navigation/app-nav-link";

export function CrmNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px">
      {CRM_NAV_ITEMS.map((item) => (
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
