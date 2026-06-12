"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { CrmListFilters, CrmTeamMember, CrmCaseStatusOption } from "@/types/crm";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  CASE_PRIORITY_LABELS,
} from "@/constants/crm";
interface AdvancedFiltersProps {
  filters: CrmListFilters;
  entity: "leads" | "clientes" | "casos";
  teamMembers?: CrmTeamMember[];
  caseStatuses?: CrmCaseStatusOption[];
}

export function AdvancedFilters({
  filters,
  entity,
  teamMembers = [],
  caseStatuses = [],
}: AdvancedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(
    Boolean(
      filters.status ||
        filters.source ||
        filters.assignedToId ||
        filters.lawyerId ||
        filters.priority ||
        filters.type ||
        filters.isActive ||
        filters.dateFrom ||
        filters.dateTo
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
      <form
        action={apply}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="ds-input-group min-w-[200px] flex-1">
          <Label htmlFor="q" className="text-xs">
            Busca
          </Label>
          <Input
            id="q"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Nome, e-mail, processo..."
            inputSize="sm"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActive && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-2xs text-gold-foreground">
              !
            </span>
          )}
        </Button>

        <Button type="submit" size="sm">
          Aplicar
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
          className="grid gap-4 rounded-lg border border-border/60 bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {filters.q && (
            <input type="hidden" name="q" value={filters.q} />
          )}

          {entity === "leads" && (
            <>
              <FilterSelect
                name="status"
                label="Status"
                defaultValue={filters.status}
                options={Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
              />
              <FilterSelect
                name="source"
                label="Origem"
                defaultValue={filters.source}
                options={Object.entries(LEAD_SOURCE_LABELS).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
              />
              <FilterSelect
                name="assignedToId"
                label="Responsável"
                defaultValue={filters.assignedToId}
                options={teamMembers.map((m) => ({
                  value: m.id,
                  label: m.name,
                }))}
              />
            </>
          )}

          {entity === "clientes" && (
            <>
              <FilterSelect
                name="type"
                label="Tipo"
                defaultValue={filters.type}
                options={[
                  { value: "INDIVIDUAL", label: "Pessoa física" },
                  { value: "COMPANY", label: "Pessoa jurídica" },
                ]}
              />
              <FilterSelect
                name="isActive"
                label="Situação"
                defaultValue={filters.isActive}
                options={[
                  { value: "true", label: "Ativo" },
                  { value: "false", label: "Inativo" },
                ]}
              />
            </>
          )}

          {entity === "casos" && (
            <>
              <FilterSelect
                name="status"
                label="Status"
                defaultValue={filters.status}
                options={caseStatuses.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
              />
              <FilterSelect
                name="priority"
                label="Prioridade"
                defaultValue={filters.priority}
                options={Object.entries(CASE_PRIORITY_LABELS).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
              />
              <FilterSelect
                name="lawyerId"
                label="Advogado"
                defaultValue={filters.lawyerId}
                options={teamMembers.map((m) => ({
                  value: m.id,
                  label: m.name,
                }))}
              />
            </>
          )}

          <div className="ds-input-group">
            <Label htmlFor="dateFrom" className="text-xs">
              De
            </Label>
            <Input
              id="dateFrom"
              name="dateFrom"
              type="date"
              defaultValue={filters.dateFrom ?? ""}
              inputSize="sm"
            />
          </div>
          <div className="ds-input-group">
            <Label htmlFor="dateTo" className="text-xs">
              Até
            </Label>
            <Input
              id="dateTo"
              name="dateTo"
              type="date"
              defaultValue={filters.dateTo ?? ""}
              inputSize="sm"
            />
          </div>

          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <Button type="submit" size="sm">
              Aplicar filtros
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function FilterSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="ds-input-group">
      <Label htmlFor={name} className="text-xs">
        {label}
      </Label>
      <Select id={name} name={name} defaultValue={defaultValue ?? ""} className="h-8 text-xs">
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
