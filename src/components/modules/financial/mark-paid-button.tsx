"use client";

import { useActionState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  markInstallmentPaidAction,
  markPaymentPaidAction,
} from "@/actions/financial";
import type { ActionResult } from "@/types/auth";

interface MarkPaidButtonProps {
  type: "payment" | "installment";
  id: string;
  disabled?: boolean;
}

export function MarkPaidButton({ type, id, disabled }: MarkPaidButtonProps) {
  const action =
    type === "installment"
      ? markInstallmentPaidAction.bind(null, id)
      : markPaymentPaidAction.bind(null, id);

  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(action, null);

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={disabled || isPending}
        title="Marcar como pago"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        <span className="sr-only">Marcar como pago</span>
      </Button>
    </form>
  );
}
