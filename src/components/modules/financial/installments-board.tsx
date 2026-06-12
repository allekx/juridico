"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers } from "lucide-react";
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
import { FinancialFilters } from "@/components/modules/financial/financial-filters";
import { GenerateInstallmentsDialog } from "@/components/modules/financial/generate-installments-dialog";
import { PaymentStatusBadge } from "@/components/modules/financial/status-badge";
import { MarkPaidButton } from "@/components/modules/financial/mark-paid-button";
import { formatCurrency, formatDate } from "@/lib/financial/format";
import type {
  ContractRow,
  FinancialListFilters,
  FinancialSelectOption,
  InstallmentRow,
} from "@/types/financial";

interface InstallmentsBoardProps {
  installments: InstallmentRow[];
  contracts: ContractRow[];
  filters: FinancialListFilters;
  clients: FinancialSelectOption[];
  contractOptions: FinancialSelectOption[];
  canWrite: boolean;
}

export function InstallmentsBoard({
  installments,
  contracts,
  filters,
  clients,
  contractOptions,
  canWrite,
}: InstallmentsBoardProps) {
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parcelas"
        description={`${installments.length} parcela${installments.length !== 1 ? "s" : ""}`}
      >
        {canWrite && (
          <Button onClick={() => setGenerateOpen(true)}>
            <Layers className="h-4 w-4" />
            Gerar parcelas
          </Button>
        )}
      </PageHeader>

      <FinancialFilters
        filters={filters}
        clients={clients}
        contracts={contractOptions}
        showContractFilter
        statusType="installment"
      />

      <div className="ds-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              {canWrite && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {installments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 7 : 6} className="text-muted-foreground">
                  Nenhuma parcela encontrada
                </TableCell>
              </TableRow>
            ) : (
              installments.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{i.number}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/financeiro/clientes/${i.client.id}`}
                      className="text-gold hover:underline"
                    >
                      {i.client.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {i.contract.title}
                  </TableCell>
                  <TableCell>{formatDate(i.dueDate)}</TableCell>
                  <TableCell>{formatCurrency(i.amount)}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={i.status} />
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      {i.status !== "PAID" && (
                        <MarkPaidButton type="installment" id={i.id} />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {canWrite && (
        <GenerateInstallmentsDialog
          open={generateOpen}
          onOpenChange={setGenerateOpen}
          contracts={contracts}
        />
      )}
    </div>
  );
}
