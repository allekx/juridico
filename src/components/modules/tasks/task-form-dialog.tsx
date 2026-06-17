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
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
} from "@/actions/tasks";
import {
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from "@/constants/tasks";
import type { TaskRow } from "@/types/tasks";
import type { CrmTeamMember } from "@/types/crm";
import type { AgendaSelectOption } from "@/lib/agenda/queries";
import type { ActionResult } from "@/types/auth";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskRow | null;
  teamMembers: CrmTeamMember[];
  clients: AgendaSelectOption[];
  cases: AgendaSelectOption[];
  defaultAssigneeId: string;
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  teamMembers,
  clients,
  cases,
  defaultAssigneeId,
}: TaskFormDialogProps) {
  const isEdit = Boolean(task);
  const action = isEdit
    ? updateTaskAction.bind(null, task!.id)
    : createTaskAction;

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
          <DialogTitle>{isEdit ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
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
              defaultValue={task?.title ?? ""}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                name="status"
                defaultValue={task?.status ?? "PENDING"}
                disabled={isPending}
              >
                {TASK_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="ds-input-group">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                id="priority"
                name="priority"
                defaultValue={task?.priority ?? "MEDIUM"}
                disabled={isPending}
              >
                {TASK_PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="ds-input-group">
            <Label htmlFor="assignedToId">Advogado responsável</Label>
            <Select
              id="assignedToId"
              name="assignedToId"
              defaultValue={task?.assignedToId ?? defaultAssigneeId}
              required
              disabled={isPending}
            >
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="clientId">Cliente (opcional)</Label>
              <Select
                id="clientId"
                name="clientId"
                defaultValue={task?.clientId ?? ""}
                disabled={isPending}
              >
                <option value="">Nenhum</option>
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
                defaultValue={task?.caseId ?? ""}
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

          <div className="ds-input-group">
            <Label htmlFor="dueDate">Prazo (opcional)</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={toDateInput(task?.dueDate ?? null)}
              disabled={isPending}
            />
          </div>

          <div className="ds-input-group">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={task?.description ?? ""}
              disabled={isPending}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={async () => {
                  if (!confirm("Excluir esta tarefa?")) return;
                  await deleteTaskAction(task!.id);
                  onOpenChange(false);
                  window.location.reload();
                }}
              >
                Excluir
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar" : "Criar tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
