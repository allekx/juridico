"use client";



import { useState, useTransition } from "react";

import Link from "next/link";

import { Bell, Check, ExternalLink } from "lucide-react";

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



interface NotificationBellProps {

  notifications: NotificationItem[];

  unreadCount: number;

}



function formatWhen(iso: string) {

  return new Intl.DateTimeFormat("pt-BR", {

    day: "2-digit",

    month: "short",

    hour: "2-digit",

    minute: "2-digit",

  }).format(new Date(iso));

}



function eventLabel(event: NotificationEvent | null) {

  if (!event) return null;

  return NOTIFICATION_EVENT_LABELS[event];

}



export function NotificationBell({

  notifications,

  unreadCount,

}: NotificationBellProps) {

  const [open, setOpen] = useState(false);

  const [isPending, startTransition] = useTransition();



  return (

    <div className="relative">

      <Button

        variant="ghost"

        size="sm"

        className="relative"

        onClick={() => setOpen(!open)}

        aria-label="Notificações"

      >

        <Bell className="h-4 w-4" />

        {unreadCount > 0 && (

          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-2xs font-bold text-destructive-foreground">

            {unreadCount > 9 ? "9+" : unreadCount}

          </span>

        )}

      </Button>



      {open && (

        <>

          <div

            className="fixed inset-0 z-40"

            onClick={() => setOpen(false)}

          />

          <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border border-border bg-card shadow-lg">

            <div className="flex items-center justify-between border-b px-4 py-3">

              <span className="font-medium">Notificações</span>

              <div className="flex items-center gap-1">

                {unreadCount > 0 && (

                  <Button

                    variant="ghost"

                    size="sm"

                    disabled={isPending}

                    onClick={() =>

                      startTransition(async () => {

                        await markAllNotificationsReadAction();

                        window.location.reload();

                      })

                    }

                  >

                    <Check className="h-3.5 w-3.5" />

                    Marcar todas

                  </Button>

                )}

              </div>

            </div>

            <ul className="max-h-96 overflow-y-auto">

              {notifications.length === 0 ? (

                <li className="px-4 py-8 text-center text-sm text-muted-foreground">

                  Nenhuma notificação

                </li>

              ) : (

                notifications.map((n) => {

                  const label = eventLabel(n.event);



                  return (

                    <li

                      key={n.id}

                      className={`border-b border-border/40 px-4 py-3 last:border-0 ${!n.readAt ? "bg-gold/5" : ""}`}

                    >

                      <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-1.5">

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

                              <Badge variant="gold" className="text-2xs shrink-0">

                                Nova

                              </Badge>

                            )}

                          </div>

                          <p className="mt-1 truncate text-sm font-medium">

                            {n.title}

                          </p>

                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">

                            {n.body}

                          </p>

                          <time className="mt-1 block text-2xs text-muted-foreground">

                            {formatWhen(n.createdAt)}

                          </time>

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

                          >

                            <Check className="h-3.5 w-3.5" />

                          </Button>

                        )}

                      </div>

                      {n.link && (

                        <Link

                          href={n.link}

                          className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"

                          onClick={() => setOpen(false)}

                        >

                          Abrir

                          <ExternalLink className="h-3 w-3" />

                        </Link>

                      )}

                    </li>

                  );

                })

              )}

            </ul>

            <div className="border-t px-4 py-2 text-center">

              <Link

                href="/dashboard/notificacoes"

                className="text-xs text-muted-foreground hover:text-foreground hover:underline"

                onClick={() => setOpen(false)}

              >

                Ver histórico completo

              </Link>

            </div>

          </div>

        </>

      )}

    </div>

  );

}


