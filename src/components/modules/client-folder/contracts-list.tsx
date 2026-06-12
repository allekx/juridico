"use client";

import { useTransition } from "react";
import { FileSignature, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteClientContractAction } from "@/actions/client-folder";
import type { ClientContractItem } from "@/types/client-folder";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  SIGNED: "Assinado",
  ACTIVE: "Ativo",
  EXPIRED: "Expirado",
  CANCELLED: "Cancelado",
};

interface ContractsListProps {
  clientId: string;
  contracts: ClientContractItem[];
  canWrite?: boolean;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function ContractsList({
  clientId,
  contracts,
  canWrite = true,
}: ContractsListProps) {
  const [isPending, startTransition] = useTransition();

  if (contracts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum contrato cadastrado.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-card">
      {contracts.map((contract) => (
        <li
          key={contract.id}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileSignature className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{contract.title}</p>
                <Badge variant="outline" className="text-2xs">
                  {STATUS_LABELS[contract.status] ?? contract.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {contract.createdByName} · {formatDate(contract.createdAt)}
                {contract.value != null &&
                  ` · ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(contract.value)}`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-1">
            {contract.hasFile && (
              <Button asChild variant="ghost" size="sm">
                <a
                  href={`/api/clientes/${clientId}/arquivos/${contract.id}/download?type=contract`}
                  download
                >
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}
            {canWrite && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  if (!confirm(`Excluir contrato "${contract.title}"?`)) return;
                  startTransition(async () => {
                    await deleteClientContractAction(clientId, contract.id);
                    window.location.reload();
                  });
                }}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
