import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Settings, ScrollText } from "lucide-react";
import { ADMIN_ROLES } from "@/constants/roles";
import { withRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Administração",
};

const ADMIN_LINKS = [
  {
    href: "/dashboard/admin/auditoria",
    title: "Auditoria",
    description:
      "Logins, alterações, exclusões e uploads registrados por usuário e data",
    icon: ScrollText,
  },
  {
    href: "/dashboard/admin/lgpd",
    title: "Conformidade LGPD",
    description:
      "Política de privacidade, termos, consentimentos e exclusão de dados",
    icon: Shield,
  },
];

export default async function AdminPage() {
  await withRole(ADMIN_ROLES);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel Administrativo"
        description="Gerenciamento de usuários, papéis e configurações do escritório"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card
                variant="elevated"
                className="h-full transition-colors hover:border-gold/40"
              >
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="rounded-lg bg-muted p-2 text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-sans font-medium">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        <Card variant="elevated" className="opacity-60">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="rounded-lg bg-muted p-2">
              <Settings className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-sans font-medium">
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
