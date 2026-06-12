import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCpf } from "@/lib/auth/cpf";

interface ProfileViewProps {
  client: {
    name: string;
    type: string;
    cpfCnpj: string | null;
    email: string | null;
    phone: string | null;
    phoneSecondary: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    lawyerName: string | null;
  };
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}

export function ProfileView({ client }: ProfileViewProps) {
  const cpfDisplay =
    client.cpfCnpj && client.type === "INDIVIDUAL"
      ? formatCpf(client.cpfCnpj)
      : client.cpfCnpj;

  return (
    <Card variant="elevated">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl font-semibold">{client.name}</h2>
          <Badge variant="outline">
            {client.type === "INDIVIDUAL" ? "Pessoa Física" : "Pessoa Jurídica"}
          </Badge>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="CPF / CNPJ" value={cpfDisplay} />
          <Field label="E-mail" value={client.email} />
          <Field label="Telefone" value={client.phone} />
          <Field label="Telefone secundário" value={client.phoneSecondary} />
          <Field label="Advogado responsável" value={client.lawyerName} />
          <Field
            label="Cidade / UF"
            value={
              client.city && client.state
                ? `${client.city} / ${client.state}`
                : null
            }
          />
          <Field label="CEP" value={client.zipCode} />
        </div>

        {client.address && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Endereço
            </p>
            <p className="mt-0.5 text-sm">{client.address}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Para alterar seus dados cadastrais, envie uma mensagem pelo portal ou
          entre em contato com o escritório.
        </p>
      </CardContent>
    </Card>
  );
}
