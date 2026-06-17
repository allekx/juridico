"use client";

import { EMPTY_VALUE } from "@/constants/copy";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, Legal } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { FinancialFilters } from "@/components/modules/financial/financial-filters";
import { formatCurrency } from "@/lib/financial/format";
import type {
  ClientFinancialSummary,
  FinancialListFilters,
  FinancialSelectOption,
} from "@/types/financial";

interface ClientsFinancialBoardProps {
  clients: ClientFinancialSummary[];
  filters: FinancialListFilters;
  clientOptions: FinancialSelectOption[];
}

export function ClientsFinancialBoard({
  clients,
  filters,
  clientOptions,
}: ClientsFinancialBoardProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro por cliente"
        description="Visão consolidada de contratos, recebimentos e inadimplência"
      />

      <FinancialFilters
        filters={filters}
        clients={clientOptions}
        showStatusFilter={false}
      />

      <div className="ds-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Contratos</TableHead>
              <TableHead>Valor contratado</TableHead>
              <TableHead>Recebido</TableHead>
              <TableHead>A receber</TableHead>
              <TableHead>Vencidas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/financeiro/clientes/${c.id}`}
                      className="font-medium text-gold hover:underline"
                    >
                      {c.name}
                    </Link>
                    {c.cpfCnpj && (
                      <p className="text-xs text-muted-foreground">
                        <Legal>{c.cpfCnpj}</Legal>
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{c.contractsCount}</TableCell>
                  <TableCell>{formatCurrency(c.totalContractValue)}</TableCell>
                  <TableCell className="text-success">
                    {formatCurrency(c.receiptsPaid)}
                  </TableCell>
                  <TableCell>{formatCurrency(c.receiptsPending)}</TableCell>
                  <TableCell>
                    {c.installmentsOverdue > 0 ? (
                      <Badge variant="destructive">{c.installmentsOverdue}</Badge>
                    ) : (
                      EMPTY_VALUE
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
