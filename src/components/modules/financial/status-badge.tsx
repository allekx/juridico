import { Badge } from "@/components/ui/badge";
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_VARIANT,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANT,
} from "@/constants/financial";
import type { ContractStatus, PaymentStatus } from "@prisma/client";

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return (
    <Badge variant={CONTRACT_STATUS_VARIANT[status]}>
      {CONTRACT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={PAYMENT_STATUS_VARIANT[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
