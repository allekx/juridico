import type { Metadata } from "next";
import { CLIENT_ROLES } from "@/constants/roles";
import { PortalSidebar } from "@/components/layout/portal/portal-sidebar";
import { requireRole } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(CLIENT_ROLES);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <PortalSidebar user={user} />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center border-b border-border/60 bg-background/95 px-4 backdrop-blur-md lg:px-8">
          <h1 className="font-display text-lg font-semibold lg:hidden">
            Portal do Cliente
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <Badge variant="gold" className="hidden sm:inline-flex">
              Cliente
            </Badge>
            <span className="text-sm font-medium">{user.name}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
