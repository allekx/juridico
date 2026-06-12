import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Wallet } from "lucide-react";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { getClientFolder } from "@/lib/client-folder/queries";
import { PageHeader, Legal } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderTabNav } from "@/components/modules/client-folder/folder-tab-nav";
import { DocumentManager } from "@/components/modules/documents/document-manager";
import { FileUploadZone } from "@/components/modules/client-folder/file-upload-zone";
import { ContractsList } from "@/components/modules/client-folder/contracts-list";
import { MessagesPanel } from "@/components/modules/client-folder/messages-panel";
import { FolderHistory } from "@/components/modules/client-folder/folder-history";
import type { ClientFolderTab } from "@/types/client-folder";

export const metadata: Metadata = {
  title: "Pasta do Cliente",
};

const VALID_TABS: ClientFolderTab[] = [
  "documentos",
  "contratos",
  "procuracoes",
  "historico",
  "mensagens",
];

export default async function ClientFolderPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await withPermission("documentos:read");
  const canWrite = hasPermission(user.role, "documentos:write");
  const { clientId } = await params;
  const { tab: tabParam } = await searchParams;

  const activeTab: ClientFolderTab = VALID_TABS.includes(
    tabParam as ClientFolderTab
  )
    ? (tabParam as ClientFolderTab)
    : "documentos";

  const folder = await getClientFolder(user.officeId, clientId);
  if (!folder) notFound();

  const counts = {
    documentos: folder.documents.length,
    contratos: folder.contracts.length,
    procuracoes: folder.powerOfAttorneys.length,
    historico: folder.history.length,
    mensagens: folder.messages.length,
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard/documentos">
          <ArrowLeft className="h-4 w-4" />
          Voltar às pastas
        </Link>
      </Button>

      <PageHeader title={folder.client.name} description="Pasta digital do cliente">
        <div className="flex items-center gap-2">
          {hasPermission(user.role, "financeiro:read") && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/financeiro/clientes/${clientId}`}>
                <Wallet className="h-4 w-4" />
                Financeiro
              </Link>
            </Button>
          )}
          <Badge variant="outline">
            {folder.client.type === "INDIVIDUAL" ? "Pessoa Física" : "Pessoa Jurídica"}
          </Badge>
        </div>
      </PageHeader>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {folder.client.cpfCnpj && (
          <span>
            <Legal>{folder.client.cpfCnpj}</Legal>
          </span>
        )}
        {folder.client.email && (
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" />
            {folder.client.email}
          </span>
        )}
        {folder.client.phone && (
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {folder.client.phone}
          </span>
        )}
        {folder.client.lawyerName && (
          <span>Advogado: {folder.client.lawyerName}</span>
        )}
      </div>

      <FolderTabNav
        clientId={clientId}
        activeTab={activeTab}
        counts={counts}
      />

      <div className="pt-2">
        {activeTab === "documentos" && (
          <DocumentManager
            clientId={clientId}
            documents={folder.documents}
            canWrite={canWrite}
          />
        )}

        {activeTab === "contratos" && (
          <div className="space-y-6">
            {canWrite && (
              <FileUploadZone
                clientId={clientId}
                type="contract"
                label="Enviar contrato"
                showTitle
              />
            )}
            <ContractsList
              clientId={clientId}
              contracts={folder.contracts}
              canWrite={canWrite}
            />
          </div>
        )}

        {activeTab === "procuracoes" && (
          <DocumentManager
            clientId={clientId}
            documents={folder.powerOfAttorneys}
            canWrite={canWrite}
            fixedType="POWER_OF_ATTORNEY"
            showTypeFilter={false}
          />
        )}

        {activeTab === "historico" && (
          <FolderHistory events={folder.history} />
        )}

        {activeTab === "mensagens" && (
          <MessagesPanel
            clientId={clientId}
            messages={folder.messages}
            canWrite={canWrite}
          />
        )}
      </div>
    </div>
  );
}
