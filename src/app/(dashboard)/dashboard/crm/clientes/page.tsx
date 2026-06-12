import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, Wallet } from "lucide-react";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { getCrmClients } from "@/lib/crm/queries";
import { parseCrmFilters } from "@/lib/crm/filters";
import { PageHeader } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Legal } from "@/components/ui/typography";
import { AdvancedFilters } from "@/components/modules/crm/advanced-filters";

export const metadata: Metadata = {
  title: "CRM — Clientes",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function CrmClientesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withPermission("crm:read");
  const canViewFinancial = hasPermission(user.role, "financeiro:read");
  const params = await searchParams;
  const filters = parseCrmFilters(params);
  const clients = await getCrmClients(user.officeId, filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={`${clients.length} cliente${clients.length !== 1 ? "s" : ""} encontrado${clients.length !== 1 ? "s" : ""}`}
      />

      <AdvancedFilters filters={filters} entity="clientes" />

      <div className="ds-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF / CNPJ</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Advogado</TableHead>
              <TableHead className="text-right">Casos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Pasta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 text-center text-muted-foreground"
                >
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <Legal>{client.cpfCnpj ?? "—"}</Legal>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {client.type === "INDIVIDUAL" ? "PF" : "PJ"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {client.email && <p>{client.email}</p>}
                      {client.phone && (
                        <Legal className="text-muted-foreground">
                          {client.phone}
                        </Legal>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {client.city && client.state
                      ? `${client.city}/${client.state}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {client.lawyerName ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {client.casesCount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.isActive ? "success" : "muted"}>
                      {client.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canViewFinancial && (
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={`/dashboard/financeiro/clientes/${client.id}`}
                            title="Financeiro"
                          >
                            <Wallet className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/documentos/${client.id}`}>
                          <FolderOpen className="h-4 w-4" />
                          Abrir
                        </Link>
                      </Button>
                    </div>
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
