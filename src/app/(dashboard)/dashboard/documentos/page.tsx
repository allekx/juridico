import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, Search } from "lucide-react";
import { withPermission } from "@/lib/auth/guards";
import { getClientsForFolder } from "@/lib/client-folder/queries";
import { PageHeader } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Legal } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Pasta Digital",
};

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await withPermission("documentos:read");
  const params = await searchParams;
  const q = params.q?.trim();

  const clients = await getClientsForFolder(user.officeId, q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pasta Digital"
        description="Sistema de documentos com tipos, versionamento, preview e Supabase Storage."
      />

      <form className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar cliente por nome, CPF ou e-mail..."
          className="pl-9"
          inputSize="sm"
        />
      </form>

      {clients.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {q ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/dashboard/documentos/${client.id}`}>
              <Card variant="interactive" className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug">{client.name}</p>
                      {client.cpfCnpj && (
                        <Legal className="mt-0.5 text-xs text-muted-foreground">
                          {client.cpfCnpj}
                        </Legal>
                      )}
                      {client.lawyerName && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {client.lawyerName}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1">
                        <Badge variant="muted" className="text-2xs">
                          {client.documentCount} docs
                        </Badge>
                        <Badge variant="muted" className="text-2xs">
                          {client.contractCount} contratos
                        </Badge>
                        <Badge variant="muted" className="text-2xs">
                          {client.powerOfAttorneyCount} procurações
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
