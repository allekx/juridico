import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, Legal } from "@/components/ui/typography";
import { ContractStatusBadge, PaymentStatusBadge } from "@/components/modules/financial/status-badge";
import { formatCurrency, formatDate } from "@/lib/financial/format";
import type { ClientFinancialDetail } from "@/types/financial";

interface ClientFinancialDetailViewProps {
  data: ClientFinancialDetail;
}

export function ClientFinancialDetailView({
  data,
}: ClientFinancialDetailViewProps) {
  const { client, summary } = data;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard/financeiro/clientes">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </Button>

      <PageHeader title={client.name} description="Resumo financeiro do cliente">
        {client.cpfCnpj && (
          <span className="text-sm text-muted-foreground">
            <Legal>{client.cpfCnpj}</Legal>
          </span>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Contratado", value: summary.contractValue },
          { label: "Recebido", value: summary.receiptsPaid },
          { label: "A receber", value: summary.receiptsPending },
          { label: "Despesas pagas", value: summary.expensesPaid },
          { label: "Parcelas vencidas", value: summary.installmentsOverdue, isCount: true },
        ].map((item) => (
          <Card key={item.label} variant="elevated">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="font-display text-xl font-semibold">
                {item.isCount ? item.value : formatCurrency(item.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Section title="Contratos" empty={data.contracts.length === 0}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Parcelas</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.contracts.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.title}</TableCell>
                <TableCell>
                  {c.value != null ? formatCurrency(c.value) : "—"}
                </TableCell>
                <TableCell>
                  {c.paidInstallments}/{c.installmentsCount}
                </TableCell>
                <TableCell>
                  <ContractStatusBadge status={c.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section title="Parcelas" empty={data.installments.length === 0}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.installments.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.number}</TableCell>
                <TableCell>{i.contract.title}</TableCell>
                <TableCell>{formatDate(i.dueDate)}</TableCell>
                <TableCell>{formatCurrency(i.amount)}</TableCell>
                <TableCell>
                  <PaymentStatusBadge status={i.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Recebimentos" empty={data.receipts.length === 0}>
          <MiniPayments rows={data.receipts} />
        </Section>
        <Section title="Pagamentos" empty={data.expenses.length === 0}>
          <MiniPayments rows={data.expenses} />
        </Section>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/documentos/${client.id}`}>Pasta digital</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/crm/clientes`}>CRM</Link>
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card variant="elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-sans font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {empty ? (
          <p className="px-6 py-4 text-sm text-muted-foreground">
            Nenhum registro
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function MiniPayments({
  rows,
}: {
  rows: ClientFinancialDetail["receipts"];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{p.description ?? "—"}</TableCell>
            <TableCell>{formatCurrency(p.amount)}</TableCell>
            <TableCell>
              <PaymentStatusBadge status={p.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
