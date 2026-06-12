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
  createAgendaEventAction,
  updateAgendaEventAction,
  deleteAgendaEventAction,
} from "@/actions/agenda";
import {
  AGENDA_EVENT_TYPES,
  NOTIFY_OPTIONS,
} from "@/constants/agenda";
import { toDateParam, toTimeInputValue } from "@/lib/agenda/date-utils";
import type { AgendaEventItem, AgendaSelectOption } from "@/lib/agenda/queries";
import type { CrmTeamMember } from "@/types/crm";
import type { ActionResult } from "@/types/auth";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: AgendaEventItem | null;
  defaultDate?: Date;
  teamMembers: CrmTeamMember[];
  clients: AgendaSelectOption[];
  cases: AgendaSelectOption[];
  canWrite: boolean;
  defaultLawyerId: string;
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  teamMembers,
  clients,
  cases,
  canWrite,
  defaultLawyerId,
}: EventFormDialogProps) {
  const isEdit = Boolean(event);
  const start = event ? new Date(event.startAt) : defaultDate ?? new Date();
  const end = event
    ? new Date(event.endAt)
    : new Date(start.getTime() + 60 * 60 * 1000);

  const action = isEdit
    ? updateAgendaEventAction.bind(null, event!.id)
    : createAgendaEventAction;

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

  if (!canWrite && !isEdit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar evento" : "Novo evento"}
          </DialogTitle>
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
              defaultValue={event?.title ?? ""}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="type">Tipo</Label>
              <Select
                id="type"
                name="type"
                defaultValue={event?.type ?? "MEETING"}
                disabled={isPending}
              >
                {AGENDA_EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="ds-input-group">
              <Label htmlFor="lawyerId">Responsável</Label>
              <Select
                id="lawyerId"
                name="lawyerId"
                defaultValue={event?.lawyerId ?? defaultLawyerId}
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
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="ds-input-group">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={toDateParam(start)}
                required
                disabled={isPending}
              />
            </div>
            <div className="ds-input-group">
              <Label htmlFor="startTime">Início</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                defaultValue={toTimeInputValue(start)}
                required
                disabled={isPending}
              />
            </div>
            <div className="ds-input-group">
              <Label htmlFor="endTime">Término</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                defaultValue={toTimeInputValue(end)}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="ds-input-group">
            <Label htmlFor="location">Local / link</Label>
            <Input
              id="location"
              name="location"
              defaultValue={event?.location ?? ""}
              placeholder="Ex: TRT-2, Sala 204 ou link da videoconferência"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="clientId">Cliente (opcional)</Label>
              <Select
                id="clientId"
                name="clientId"
                defaultValue={event?.clientId ?? ""}
                disabled={isPending}
              >
                <option value="">—</option>
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
                defaultValue={event?.caseId ?? ""}
                disabled={isPending}
              >
                <option value="">—</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="ds-input-group">
            <Label htmlFor="description">Observações</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={event?.description ?? ""}
              disabled={isPending}
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="notifyEnabled"
                defaultChecked={event?.notifyEnabled ?? false}
                disabled={isPending}
                className="h-4 w-4"
              />
              Ativar notificação
            </label>
            <div className="ds-input-group">
              <Label htmlFor="notifyMinutesBefore">Lembrar</Label>
              <Select
                id="notifyMinutesBefore"
                name="notifyMinutesBefore"
                defaultValue={String(event?.notifyMinutesBefore ?? 60)}
                disabled={isPending}
              >
                {NOTIFY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={async () => {
                  if (!confirm("Excluir este evento?")) return;
                  await deleteAgendaEventAction(event!.id);
                  onOpenChange(false);
                  window.location.reload();
                }}
              >
                Excluir
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar" : "Criar evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
