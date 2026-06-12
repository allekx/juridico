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
import { createPaymentAction } from "@/actions/financial";
import { PAYMENT_METHOD_LABELS } from "@/constants/financial";
import type { FinancialSelectOption } from "@/types/financial";
import type { ActionResult } from "@/types/auth";

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: "RECEIPT" | "EXPENSE";
  clients: FinancialSelectOption[];
  contracts: FinancialSelectOption[];
  cases: FinancialSelectOption[];
  defaultClientId?: string;
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  direction,
  clients,
  contracts,
  cases,
  defaultClientId,
}: PaymentFormDialogProps) {
  const [state, formAction, isPending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createPaymentAction, null);

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      window.location.reload();
    }
  }, [state?.success, onOpenChange]);

  const title = direction === "RECEIPT" ? "Novo recebimento" : "Novo pagamento";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="direction" value={direction} />

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="clientId">Cliente</Label>
              <Select
                id="clientId"
                name="clientId"
                defaultValue={defaultClientId ?? ""}
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
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="ds-input-group">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              placeholder={
                direction === "RECEIPT"
                  ? "Honorários, custas..."
                  : "Custas, despesas..."
              }
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="ds-input-group">
              <Label htmlFor="dueDate">Vencimento</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                required
                disabled={isPending}
              />
            </div>

            <div className="ds-input-group">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                name="status"
                defaultValue="PENDING"
                disabled={isPending}
              >
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago</option>
              </Select>
            </div>

            <div className="ds-input-group">
              <Label htmlFor="method">Forma</Label>
              <Select id="method" name="method" disabled={isPending}>
                <option value="">—</option>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="contractId">Contrato (opcional)</Label>
              <Select id="contractId" name="contractId" disabled={isPending}>
                <option value="">Nenhum</option>
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="ds-input-group">
              <Label htmlFor="caseId">Processo (opcional)</Label>
              <Select id="caseId" name="caseId" disabled={isPending}>
                <option value="">Nenhum</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="ds-input-group">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" rows={2} disabled={isPending} />
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
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
