"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { createLeadAction } from "@/actions/crm/leads";
import { LEAD_SOURCE_LABELS } from "@/constants/crm";
import type { CrmTeamMember } from "@/types/crm";

interface CreateLeadDialogProps {
  teamMembers: CrmTeamMember[];
}

export function CreateLeadDialog({ teamMembers }: CreateLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createLeadAction({
        name: form.get("name") as string,
        email: (form.get("email") as string) || undefined,
        phone: form.get("phone") as string,
        source: form.get("source") as string,
        interestArea: (form.get("interestArea") as string) || undefined,
        notes: (form.get("notes") as string) || undefined,
        assignedToId: (form.get("assignedToId") as string) || undefined,
      });

      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error ?? "Erro ao criar lead");
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Novo lead
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Novo lead</DialogTitle>
            <DialogDescription>
              Inclua um novo lead no funil comercial do escritório.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4">
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="ds-input-group">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="ds-input-group">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="ds-input-group">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input id="phone" name="phone" required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="ds-input-group">
                  <Label htmlFor="source">Origem *</Label>
                  <Select id="source" name="source" defaultValue="PHONE" required>
                    {Object.entries(LEAD_SOURCE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="ds-input-group">
                  <Label htmlFor="assignedToId">Responsável</Label>
                  <Select id="assignedToId" name="assignedToId" defaultValue="">
                    <option value="">Não atribuído</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="ds-input-group">
                <Label htmlFor="interestArea">Área de interesse</Label>
                <Input id="interestArea" name="interestArea" />
              </div>

              <div className="ds-input-group">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" name="notes" rows={3} />
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
                Criar lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
