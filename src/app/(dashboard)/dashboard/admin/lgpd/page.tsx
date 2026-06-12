import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ADMIN_ROLES } from "@/constants/roles";
import { withRole } from "@/lib/auth/guards";
import {
  getConsentHistory,
  getDeletionRequests,
  getLegalDocumentsList,
  getLgpdAdminStats,
} from "@/lib/lgpd/queries";
import { AdminLgpdPanel } from "@/components/modules/lgpd/admin-lgpd-panel";
import { PageHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "LGPD — Administração",
};

export default async function AdminLgpdPage() {
  const user = await withRole(ADMIN_ROLES);

  const [stats, consents, deletions, documents] = await Promise.all([
    getLgpdAdminStats(user.officeId),
    getConsentHistory(user.officeId),
    getDeletionRequests(user.officeId),
    getLegalDocumentsList(user.officeId),
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
        title="Conformidade LGPD"
        description="Documentos legais, registro de consentimentos e solicitações de exclusão"
      />

      <AdminLgpdPanel
        stats={stats}
        consents={consents}
        deletions={deletions}
        documents={documents}
      />
    </div>
  );
}
