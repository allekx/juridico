"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/constants/roles";
import { NotificationBell } from "@/components/layout/dashboard/notification-bell";
import type { UserRole } from "@prisma/client";

interface DashboardHeaderProps {
  userName: string;
  userRole: UserRole;
}

interface NotificationPayload {
  notifications: Parameters<typeof NotificationBell>[0]["notifications"];
  unreadCount: number;
}

export function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const [data, setData] = useState<NotificationPayload>({
    notifications: [],
    unreadCount: 0,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) {
          setData({
            notifications: json.notifications ?? [],
            unreadCount: json.unreadCount ?? 0,
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-border/60 bg-background/95 px-4 backdrop-blur-md lg:px-8">
      <h1 className="font-display text-lg font-semibold lg:hidden">Dashboard</h1>
      <div className="ml-auto flex items-center gap-3">
        <NotificationBell
          notifications={data.notifications}
          unreadCount={data.unreadCount}
        />
        <Badge variant="gold" className="hidden sm:inline-flex">
          {ROLE_LABELS[userRole]}
        </Badge>
        <span className="text-sm font-medium text-foreground">{userName}</span>
      </div>
    </header>
  );
}
