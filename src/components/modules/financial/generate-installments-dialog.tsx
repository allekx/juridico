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
import { Select } from "@/components/ui/select";
import { generateInstallmentsAction } from "@/actions/financial";
import { formatCurrency } from "@/lib/financial/format";
import type { ContractRow } from "@/types/financial";
import type { ActionResult } from "@/types/auth";

interface GenerateInstallmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contracts: ContractRow[];
}

export function GenerateInstallmentsDialog({
  open,
  onOpenChange,
  contracts,
}: GenerateInstallmentsDialogProps) {
  const eligible = contracts.filter(
    (c) => c.value && c.installmentsCount === 0
  );

  const [state, formAction, isPending] = useActionState<
    ActionResult<{ count: number }> | null,
    FormData
  >(generateInstallmentsAction, null);

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      window.location.reload();
    }
  }, [state?.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar parcelas</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="ds-input-group">
            <Label htmlFor="contractId">Contrato</Label>
            <Select id="contractId" name="contractId" required disabled={isPending}>
              <option value="">Selecione</option>
              {eligible.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} | {c.client.name} ({formatCurrency(c.value!)})
                </option>
              ))}
            </Select>
            {eligible.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhum contrato elegível (com valor e sem parcelas).
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="count">Número de parcelas</Label>
              <Input
                id="count"
                name="count"
                type="number"
                min={1}
                max={60}
                defaultValue={3}
                required
                disabled={isPending}
              />
            </div>
            <div className="ds-input-group">
              <Label htmlFor="firstDueDate">1ª parcela em</Label>
              <Input
                id="firstDueDate"
                name="firstDueDate"
                type="date"
                required
                disabled={isPending}
              />
            </div>
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
            <Button type="submit" disabled={isPending || eligible.length === 0}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Gerar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
