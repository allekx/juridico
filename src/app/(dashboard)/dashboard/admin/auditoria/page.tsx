import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { AuditAction } from "@prisma/client";
import { ADMIN_ROLES } from "@/constants/roles";
import { withRole } from "@/lib/auth/guards";
import { getAuditLogs, getAuditStats } from "@/lib/audit/queries";
import { AuditLogPanel } from "@/components/modules/audit/audit-log-panel";
import { PageHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Auditoria | Administração",
};

interface AuditoriaPageProps {
  searchParams: Promise<{
    action?: string;
    q?: string;
    entityType?: string;
    page?: string;
  }>;
}

export default async function AuditoriaPage({ searchParams }: AuditoriaPageProps) {
  const user = await withRole(ADMIN_ROLES);
  const params = await searchParams;

  const filters = {
    action: params.action as AuditAction | undefined,
    q: params.q,
    entityType: params.entityType,
    page: Number(params.page) || 1,
  };

  const [stats, result] = await Promise.all([
    getAuditStats(user.officeId),
    getAuditLogs(user.officeId, filters),
  ]);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard/admin">
          <ArrowLeft className="h-4 w-4" />
          Administração
        </Link>
      </Button>

      <PageHeader
        title="Auditoria do Sistema"
        description="Registro de logins, alterações, exclusões e uploads realizados pelos usuários"
      />

      <AuditLogPanel
        stats={stats}
        result={result}
        filters={{
          action: params.action,
          q: params.q,
          entityType: params.entityType,
        }}
      />
    </div>
  );
}
