"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import { updateTaskStatusAction } from "@/actions/tasks";
import { TASK_STATUS_OPTIONS } from "@/constants/tasks";
import type { TaskStatus } from "@prisma/client";

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
  canWrite?: boolean;
}

export function TaskStatusSelect({
  taskId,
  currentStatus,
  canWrite = true,
}: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  if (!canWrite) {
    const label = TASK_STATUS_OPTIONS.find((s) => s.value === currentStatus)?.label;
    return <span className="text-sm">{label ?? currentStatus}</span>;
  }

  return (
    <Select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        const status = e.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED";
        startTransition(async () => {
          await updateTaskStatusAction(taskId, status);
          window.location.reload();
        });
      }}
      className="min-w-[140px]"
    >
      {TASK_STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </Select>
  );
}
