"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import { updateLeadStatusAction } from "@/actions/crm/leads";
import { LEAD_STATUS_LABELS } from "@/constants/crm";
import type { LeadStatus } from "@prisma/client";

interface LeadStatusSelectProps {
  leadId: string;
  currentStatus: LeadStatus;
  canWrite?: boolean;
}

export function LeadStatusSelect({
  leadId,
  currentStatus,
  canWrite = true,
}: LeadStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  if (!canWrite) {
    return (
      <span className="text-sm">{LEAD_STATUS_LABELS[currentStatus]}</span>
    );
  }

  return (
    <Select
      value={currentStatus}
      disabled={isPending}
      className="h-8 min-w-[130px] text-xs"
      onChange={(e) => {
        const status = e.target.value as LeadStatus;
        startTransition(async () => {
          await updateLeadStatusAction(leadId, status);
        });
      }}
    >
      {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  );
}
