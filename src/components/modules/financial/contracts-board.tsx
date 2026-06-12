"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/ui/typography";
import { CONTRACT_TYPE_LABELS } from "@/constants/financial";
import { FinancialFilters } from "@/components/modules/financial/financial-filters";
import { ContractFormDialog } from "@/components/modules/financial/contract-form-dialog";
import { ContractStatusBadge } from "@/components/modules/financial/status-badge";
import { formatCurrency, formatDate } from "@/lib/financial/format";
import type {
  ContractRow,
  FinancialListFilters,
  FinancialSelectOption,
} from "@/types/financial";

interface ContractsBoardProps {
  contracts: ContractRow[];
  filters: FinancialListFilters;
  clients: FinancialSelectOption[];
  cases: FinancialSelectOption[];
  canWrite: boolean;
}

export function ContractsBoard({
  contracts,
  filters,
  clients,
  cases,
  canWrite,
}: ContractsBoardProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editContract, setEditContract] = useState<ContractRow | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description={`${contracts.length} contrato${contracts.length !== 1 ? "s" : ""}`}
      >
        {canWrite && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo contrato
          </Button>
        )}
      </PageHeader>

      <FinancialFilters
        filters={filters}
        clients={clients}
        statusType="contract"
      />

      <div className="ds-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Parcelas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assinatura</TableHead>
              {canWrite && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 8 : 7} className="text-muted-foreground">
                  Nenhum contrato encontrado
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/financeiro/clientes/${c.client.id}`}
                      className="text-gold hover:underline"
                    >
                      {c.client.name}
                    </Link>
                  </TableCell>
                  <TableCell>{CONTRACT_TYPE_LABELS[c.type]}</TableCell>
                  <TableCell>
                    {c.value != null ? formatCurrency(c.value) : "—"}
                  </TableCell>
                  <TableCell>
                    {c.paidInstallments}/{c.installmentsCount}
                  </TableCell>
                  <TableCell>
                    <ContractStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>{formatDate(c.signedAt)}</TableCell>
                  {canWrite && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditContract(c)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {canWrite && (
        <>
          <ContractFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            clients={clients}
            cases={cases}
          />
          <ContractFormDialog
            open={Boolean(editContract)}
            onOpenChange={(open) => !open && setEditContract(null)}
            contract={editContract}
            clients={clients}
            cases={cases}
          />
        </>
      )}
    </div>
  );
}
