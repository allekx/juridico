import type { Metadata } from "next";
import { requirePortalClient } from "@/lib/portal/session";
import { prisma } from "@/lib/prisma/client";
import { ProfileView } from "@/components/modules/portal/profile-view";
import { PageHeader } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Meus Dados — Portal do Cliente",
};

export default async function PortalPerfilPage() {
  const { client } = await requirePortalClient();

  const fullClient = await prisma.client.findUnique({
    where: { id: client.id },
    include: {
      assignedLawyer: { include: { user: { select: { name: true } } } },
    },
  });

  if (!fullClient) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dados cadastrais"
        description="Suas informações de contato e cadastro no escritório."
      />
      <ProfileView
        client={{
          name: fullClient.name,
          type: fullClient.type,
          cpfCnpj: fullClient.cpfCnpj,
          email: fullClient.email,
          phone: fullClient.phone,
          phoneSecondary: fullClient.phoneSecondary,
          address: fullClient.address,
          city: fullClient.city,
          state: fullClient.state,
          zipCode: fullClient.zipCode,
          lawyerName: fullClient.assignedLawyer?.user.name ?? null,
        }}
      />
    </div>
  );
}
