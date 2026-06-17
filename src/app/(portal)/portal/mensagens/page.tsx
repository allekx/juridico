import type { Metadata } from "next";
import { requirePortalClient } from "@/lib/portal/session";
import { getPortalMessages } from "@/lib/portal/queries";
import { PortalMessages } from "@/components/modules/portal/portal-messages";
import { PageHeader } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Mensagens | Portal do Cliente",
};

export default async function PortalMensagensPage() {
  const { user, client } = await requirePortalClient();
  const messages = await getPortalMessages(user.officeId, client.id, user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensagens"
        description="Converse com a equipe do escritório sobre seu caso."
      />
      <PortalMessages messages={messages} />
    </div>
  );
}
