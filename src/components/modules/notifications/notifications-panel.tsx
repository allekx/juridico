"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notifications";
import {
  NOTIFICATION_EVENT_LABELS,
  NOTIFICATION_TYPE_VARIANT,
} from "@/constants/notifications";
import type { NotificationItem } from "@/lib/notifications/queries";
import type { NotificationEvent } from "@/constants/notifications";

interface NotificationsPanelProps {
  items: NotificationItem[];
  unreadCount: number;
  total: number;
  showViewAll?: boolean;
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function eventLabel(event: NotificationEvent | null) {
  if (!event) return null;
  return NOTIFICATION_EVENT_LABELS[event];
}

export function NotificationsPanel({
  items,
  unreadCount,
  total,
  showViewAll = true,
}: NotificationsPanelProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {unreadCount > 0 ? (
            <span>
              <strong className="text-foreground">{unreadCount}</strong> não
              lida{unreadCount !== 1 ? "s" : ""} de {total}
            </span>
          ) : (
            <span>{total} notificação{total !== 1 ? "ões" : ""} no histórico</span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await markAllNotificationsReadAction();
                window.location.reload();
              })
            }
          >
            <Check className="h-4 w-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <ul className="ds-surface divide-y divide-border/60">
        {items.length === 0 ? (
          <li className="px-6 py-12 text-center text-sm text-muted-foreground">
            Nenhuma notificação no histórico
          </li>
        ) : (
          items.map((n) => {
            const label = eventLabel(n.event);

            return (
              <li
                key={n.id}
                className={`flex gap-4 px-4 py-4 sm:px-6 ${!n.readAt ? "bg-gold/5" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {label && (
                      <Badge
                        variant={
                          NOTIFICATION_TYPE_VARIANT[
                            n.type as keyof typeof NOTIFICATION_TYPE_VARIANT
                          ] ?? "default"
                        }
                        className="text-2xs"
                      >
                        {label}
                      </Badge>
                    )}
                    {!n.readAt && (
                      <Badge variant="gold" className="text-2xs">
                        Nova
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 font-medium">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  <time className="mt-2 block text-xs text-muted-foreground">
                    {formatWhen(n.createdAt)}
                  </time>
                  {n.link && (
                    <Link
                      href={n.link}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Abrir
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                {!n.readAt && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await markNotificationReadAction(n.id);
                        window.location.reload();
                      })
                    }
                    title="Marcar como lida"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </li>
            );
          })
        )}
      </ul>

      {showViewAll && items.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Exibindo as {items.length} mais recentes
        </p>
      )}
    </div>
  );
}
