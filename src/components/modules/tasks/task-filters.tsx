"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from "@/constants/tasks";
import type { TaskListFilters } from "@/types/tasks";
import type { CrmTeamMember } from "@/types/crm";
import type { AgendaSelectOption } from "@/lib/agenda/queries";

interface TaskFiltersProps {
  filters: TaskListFilters;
  teamMembers: CrmTeamMember[];
  clients: AgendaSelectOption[];
  cases: AgendaSelectOption[];
}

export function TaskFilters({
  filters,
  teamMembers,
  clients,
  cases,
}: TaskFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(
    Boolean(
      filters.status ||
        filters.assignedToId ||
        filters.clientId ||
        filters.caseId ||
        filters.priority ||
        filters.dueFrom ||
        filters.dueTo
    )
  );

  function apply(formData: FormData) {
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim()) {
        params.set(key, value.trim());
      }
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clear() {
    router.push(pathname);
  }

  const hasActive = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-4">
      <form action={apply} className="flex flex-wrap items-end gap-3">
        <div className="ds-input-group min-w-[200px] flex-1">
          <Label htmlFor="q" className="text-xs">
            Busca
          </Label>
          <Input
            id="q"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Título, cliente, processo..."
            inputSize="sm"
          />
        </div>

        <div className="ds-input-group min-w-[140px]">
          <Label htmlFor="status" className="text-xs">
            Status
          </Label>
          <Select id="status" name="status" defaultValue={filters.status ?? ""}>
            <option value="">Todos</option>
            {TASK_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        <Button type="submit" size="sm">
          Filtrar
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
        >
          <Filter className="h-4 w-4" />
          Mais filtros
        </Button>

        {hasActive && (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </form>

      {open && (
        <form
          action={apply}
          className="grid gap-4 rounded-lg border border-border/60 bg-card p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <input type="hidden" name="q" value={filters.q ?? ""} />
          <input type="hidden" name="status" value={filters.status ?? ""} />

          <div className="ds-input-group">
            <Label className="text-xs">Advogado / responsável</Label>
            <Select
              name="assignedToId"
              defaultValue={filters.assignedToId ?? ""}
            >
              <option value="">Todos</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="ds-input-group">
            <Label className="text-xs">Cliente</Label>
            <Select name="clientId" defaultValue={filters.clientId ?? ""}>
              <option value="">Todos</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="ds-input-group">
            <Label className="text-xs">Processo</Label>
            <Select name="caseId" defaultValue={filters.caseId ?? ""}>
              <option value="">Todos</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="ds-input-group">
            <Label className="text-xs">Prioridade</Label>
            <Select name="priority" defaultValue={filters.priority ?? ""}>
              <option value="">Todas</option>
              {TASK_PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="ds-input-group">
            <Label className="text-xs">Prazo de</Label>
            <Input
              type="date"
              name="dueFrom"
              defaultValue={filters.dueFrom ?? ""}
              inputSize="sm"
            />
          </div>

          <div className="ds-input-group">
            <Label className="text-xs">Prazo até</Label>
            <Input
              type="date"
              name="dueTo"
              defaultValue={filters.dueTo ?? ""}
              inputSize="sm"
            />
          </div>

          <div className="flex items-end sm:col-span-2 lg:col-span-3">
            <Button type="submit" size="sm">
              Aplicar filtros
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
