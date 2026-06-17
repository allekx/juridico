"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLinkStatus } from "next/link";
import { NavLinkPendingTracker } from "@/components/shared/navigation/nav-progress";
import { cn } from "@/lib/utils";

interface AppNavLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  exact?: boolean;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

function NavLinkContent({
  label,
  icon,
  isActive,
}: {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
}) {
  const { pending } = useLinkStatus();

  return (
    <>
      <NavLinkPendingTracker />
      {icon}
      <span className="flex-1 truncate">{label}</span>
      {pending && (
        <Loader2
          className={cn(
            "h-3.5 w-3.5 shrink-0 animate-spin",
            isActive ? "text-sidebar-foreground" : "text-gold"
          )}
          aria-hidden
        />
      )}
    </>
  );
}

export function AppNavLink({
  href,
  label,
  icon,
  exact = false,
  className,
  activeClassName,
  onClick,
}: AppNavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onClick}
      className={cn(
        "ds-sidebar-item",
        isActive && (activeClassName ?? "ds-sidebar-item-active"),
        className
      )}
    >
      <NavLinkContent label={label} icon={icon} isActive={isActive} />
    </Link>
  );
}

interface AppTabNavLinkProps {
  href: string;
  label: string;
  exact?: boolean;
}

function TabNavLinkContent({ label }: { label: string }) {
  const { pending } = useLinkStatus();

  return (
    <>
      <NavLinkPendingTracker />
      {label}
      {pending && (
        <Loader2 className="ml-1.5 inline h-3 w-3 animate-spin text-gold" />
      )}
    </>
  );
}

export function AppTabNavLink({ href, label, exact = false }: AppTabNavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname.startsWith(href);

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "border-gold text-foreground"
          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
      )}
    >
      <TabNavLinkContent label={label} />
    </Link>
  );
}
