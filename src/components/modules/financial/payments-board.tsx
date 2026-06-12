"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
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
import { PAYMENT_METHOD_LABELS } from "@/constants/financial";
import { FinancialFilters } from "@/components/modules/financial/financial-filters";
import { PaymentFormDialog } from "@/components/modules/financial/payment-form-dialog";
import { PaymentStatusBadge } from "@/components/modules/financial/status-badge";
import { MarkPaidButton } from "@/components/modules/financial/mark-paid-button";
import { formatCurrency, formatDate } from "@/lib/financial/format";
import type {
  FinancialListFilters,
  FinancialSelectOption,
  PaymentRow,
} from "@/types/financial";

interface PaymentsBoardProps {
  payments: PaymentRow[];
  direction: "RECEIPT" | "EXPENSE";
  filters: FinancialListFilters;
  clients: FinancialSelectOption[];
  contracts: FinancialSelectOption[];
  cases: FinancialSelectOption[];
  canWrite: boolean;
}

export function PaymentsBoard({
  payments,
  direction,
  filters,
  clients,
  contracts,
  cases,
  canWrite,
}: PaymentsBoardProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const title = direction === "RECEIPT" ? "Recebimentos" : "Pagamentos";

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={`${payments.length} lançamento${payments.length !== 1 ? "s" : ""}`}
      >
        {canWrite && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo {direction === "RECEIPT" ? "recebimento" : "pagamento"}
          </Button>
        )}
      </PageHeader>

      <FinancialFilters filters={filters} clients={clients} />

      <div className="ds-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead>Status</TableHead>
              {canWrite && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 7 : 6} className="text-muted-foreground">
                  Nenhum lançamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/financeiro/clientes/${p.client.id}`}
                      className="text-gold hover:underline"
                    >
                      {p.client.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {p.description ?? p.invoiceNumber ?? "—"}
                    {p.installment && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (parc. {p.installment.number})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(p.dueDate)}</TableCell>
                  <TableCell>{formatCurrency(p.amount)}</TableCell>
                  <TableCell>
                    {p.method ? PAYMENT_METHOD_LABELS[p.method] : "—"}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={p.status} />
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      {p.status !== "PAID" && (
                        <MarkPaidButton type="payment" id={p.id} />
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
        <PaymentFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          direction={direction}
          clients={clients}
          contracts={contracts}
          cases={cases}
        />
      )}
    </div>
  );
}
