import type { Metadata } from "next";
import { withAuth } from "@/lib/auth/guards";
import { getUserNotificationsHistory } from "@/lib/notifications/queries";
import { NotificationsPanel } from "@/components/modules/notifications/notifications-panel";
import { PageHeader } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Notificações",
};

export default async function NotificacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ unread?: string }>;
}) {
  const user = await withAuth();
  const params = await searchParams;
  const unreadOnly = params.unread === "1";

  const { items, total, unreadCount } = await getUserNotificationsHistory(
    user.id,
    { limit: 200, unreadOnly }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificações"
        description="Alertas de leads, documentos, prazos e alterações de status."
      />

      <NotificationsPanel
        items={items}
        unreadCount={unreadCount}
        total={total}
        showViewAll={false}
      />
    </div>
  );
}
