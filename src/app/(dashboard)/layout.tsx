import type { Metadata } from "next";
import { DASHBOARD_ROLES } from "@/constants/roles";
import { AppSidebar } from "@/components/layout/dashboard/app-sidebar";
import { NotificationBell } from "@/components/layout/dashboard/notification-bell";
import { requireRole } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/constants/roles";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications/queries";
import { processDueReminders } from "@/lib/agenda/notifications";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(DASHBOARD_ROLES);

  await processDueReminders(user.officeId);

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id, 15),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <div className="hidden lg:block">
        <AppSidebar user={user} />
      </div>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center border-b border-border/60 bg-background/95 px-4 backdrop-blur-md lg:px-8">
          <h1 className="font-display text-lg font-semibold lg:hidden">
            Dashboard
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
            />
            <Badge variant="gold" className="hidden sm:inline-flex">
              {ROLE_LABELS[user.role]}
            </Badge>
            <span className="text-sm font-medium text-foreground">
              {user.name}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
