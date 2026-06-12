"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  createContractAction,
  updateContractAction,
} from "@/actions/financial";
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_TYPE_LABELS,
} from "@/constants/financial";
import type { ContractRow, FinancialSelectOption } from "@/types/financial";
import type { ActionResult } from "@/types/auth";

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: ContractRow | null;
  clients: FinancialSelectOption[];
  cases: FinancialSelectOption[];
  defaultClientId?: string;
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function ContractFormDialog({
  open,
  onOpenChange,
  contract,
  clients,
  cases,
  defaultClientId,
}: ContractFormDialogProps) {
  const isEdit = Boolean(contract);
  const action = isEdit
    ? updateContractAction.bind(null, contract!.id)
    : createContractAction;

  const [state, formAction, isPending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(action, null);

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      window.location.reload();
    }
  }, [state?.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar contrato" : "Novo contrato"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="ds-input-group">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              defaultValue={contract?.title ?? ""}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="clientId">Cliente</Label>
              <Select
                id="clientId"
                name="clientId"
                defaultValue={contract?.client.id ?? defaultClientId ?? ""}
                required
                disabled={isPending}
              >
                <option value="">Selecione</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="ds-input-group">
              <Label htmlFor="caseId">Processo (opcional)</Label>
              <Select
                id="caseId"
                name="caseId"
                defaultValue={contract?.case?.id ?? ""}
                disabled={isPending}
              >
                <option value="">Nenhum</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="ds-input-group">
              <Label htmlFor="type">Tipo</Label>
              <Select
                id="type"
                name="type"
                defaultValue={contract?.type ?? "FEE_AGREEMENT"}
                disabled={isPending}
              >
                {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="ds-input-group">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                name="status"
                defaultValue={contract?.status ?? "DRAFT"}
                disabled={isPending}
              >
                {Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="ds-input-group">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                min="0"
                defaultValue={contract?.value ?? ""}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="signedAt">Data de assinatura</Label>
              <Input
                id="signedAt"
                name="signedAt"
                type="date"
                defaultValue={toDateInput(contract?.signedAt ?? null)}
                disabled={isPending}
              />
            </div>
            <div className="ds-input-group">
              <Label htmlFor="expiresAt">Validade</Label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="date"
                defaultValue={toDateInput(contract?.expiresAt ?? null)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="ds-input-group">
            <Label htmlFor="content">Conteúdo / observações</Label>
            <Textarea
              id="content"
              name="content"
              rows={4}
              defaultValue={contract?.content ?? ""}
              placeholder="Descrição do contrato..."
              required
              disabled={isPending}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar" : "Criar contrato"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
