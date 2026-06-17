"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createCaseAction } from "@/actions/crm/cases";
import { CASE_PRIORITY_LABELS } from "@/constants/crm";
import type { CrmTeamMember } from "@/types/crm";

interface CreateCaseDialogProps {
  teamMembers: CrmTeamMember[];
  redirectToKanban?: boolean;
}

export function CreateCaseDialog({
  teamMembers,
  redirectToKanban = true,
}: CreateCaseDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const lawyers = teamMembers.filter((m) =>
    ["ADMIN", "LAWYER", "ASSISTANT"].includes(m.role)
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createCaseAction({
        clientName: form.get("clientName") as string,
        email: (form.get("email") as string) || undefined,
        phone: (form.get("phone") as string) || undefined,
        cpfCnpj: (form.get("cpfCnpj") as string) || undefined,
        title: form.get("title") as string,
        caseType: form.get("caseType") as string,
        description: (form.get("description") as string) || undefined,
        lawyerId: form.get("lawyerId") as string,
        priority: form.get("priority") as string,
      });

      if (result.success) {
        setOpen(false);
        if (redirectToKanban) {
          router.push("/dashboard/kanban");
        } else {
          router.refresh();
        }
      } else {
        setError(result.error ?? "Erro ao criar caso");
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Novo caso
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Novo caso</DialogTitle>
            <DialogDescription>
              Cria o cliente (se ainda não existir) e adiciona o caso na coluna
              Novo do Kanban Jurídico.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="ds-input-group">
                <Label htmlFor="clientName">Nome do cliente *</Label>
                <Input id="clientName" name="clientName" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="ds-input-group">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="ds-input-group">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" />
                </div>
              </div>

              <div className="ds-input-group">
                <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                <Input id="cpfCnpj" name="cpfCnpj" />
              </div>

              <div className="ds-input-group">
                <Label htmlFor="title">Título do caso *</Label>
                <Input id="title" name="title" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="ds-input-group">
                  <Label htmlFor="caseType">Tipo / área *</Label>
                  <Input
                    id="caseType"
                    name="caseType"
                    placeholder="Ex.: Trabalhista"
                    required
                  />
                </div>
                <div className="ds-input-group">
                  <Label htmlFor="lawyerId">Advogado responsável *</Label>
                  <Select id="lawyerId" name="lawyerId" required defaultValue="">
                    <option value="" disabled>
                      Selecione
                    </option>
                    {lawyers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="ds-input-group">
                <Label htmlFor="priority">Prioridade</Label>
                <Select id="priority" name="priority" defaultValue="MEDIUM">
                  {Object.entries(CASE_PRIORITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="ds-input-group">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Criar caso
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
