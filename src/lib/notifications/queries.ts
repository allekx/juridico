import { prisma } from "@/lib/prisma/client";
import type { NotificationEvent } from "@/constants/notifications";

export interface NotificationItem {
  id: string;
  type: string;
  event: NotificationEvent | null;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

function mapNotification(n: {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
  metadata: unknown;
}): NotificationItem {
  const metadata = n.metadata as { event?: NotificationEvent } | null;

  return {
    id: n.id,
    type: n.type,
    event: metadata?.event ?? null,
    title: n.title,
    body: n.body,
    link: n.link,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function getUserNotifications(
  userId: string,
  limit = 20
): Promise<NotificationItem[]> {
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return items.map(mapNotification);
}

export async function getUserNotificationsHistory(
  userId: string,
  options: { limit?: number; unreadOnly?: boolean } = {}
): Promise<{ items: NotificationItem[]; total: number; unreadCount: number }> {
  const limit = options.limit ?? 100;
  const where = {
    userId,
    ...(options.unreadOnly ? { readAt: null } : {}),
  };

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return {
    items: items.map(mapNotification),
    total,
    unreadCount,
  };
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}
