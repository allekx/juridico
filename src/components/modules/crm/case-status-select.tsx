"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import { updateCaseStatusAction } from "@/actions/crm/cases";
import type { CrmCaseStatusOption } from "@/types/crm";

interface CaseStatusSelectProps {
  caseId: string;
  currentStatusId: string;
  statuses: CrmCaseStatusOption[];
  canWrite?: boolean;
  currentStatusName?: string;
  currentStatusColor?: string;
}

export function CaseStatusSelect({
  caseId,
  currentStatusId,
  statuses,
  canWrite = true,
  currentStatusName,
  currentStatusColor,
}: CaseStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  if (!canWrite) {
    return (
      <div className="flex items-center gap-1.5">
        {currentStatusColor && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: currentStatusColor }}
          />
        )}
        <span className="text-sm">{currentStatusName}</span>
      </div>
    );
  }

  return (
    <Select
      value={currentStatusId}
      disabled={isPending}
      className="h-8 min-w-[140px] text-xs"
      onChange={(e) => {
        const statusId = e.target.value;
        startTransition(async () => {
          await updateCaseStatusAction(caseId, statusId);
        });
      }}
    >
      {statuses.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </Select>
  );
}
