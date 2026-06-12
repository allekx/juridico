"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ReportFilters } from "@/types/reports";
interface ReportFiltersBarProps {
  filters: ReportFilters;
  showLawyer?: boolean;
  showStatus?: boolean;
  statusOptions?: { value: string; label: string }[];
  lawyers?: { id: string; name: string }[];
}

export function ReportFiltersBar({
  filters,
  showLawyer = false,
  showStatus = false,
  statusOptions = [],
  lawyers = [],
}: ReportFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clear = () => router.push(pathname);

  return (
    <div className="ds-surface space-y-4 p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="ds-input-group">
          <Label htmlFor="q">Buscar</Label>
          <Input
            id="q"
            defaultValue={filters.q ?? ""}
            placeholder="Nome, e-mail..."
            onBlur={(e) => update("q", e.target.value)}
          />
        </div>

        <div className="ds-input-group">
          <Label htmlFor="dateFrom">De</Label>
          <Input
            id="dateFrom"
            type="date"
            defaultValue={filters.dateFrom ?? ""}
            onChange={(e) => update("dateFrom", e.target.value)}
          />
        </div>

        <div className="ds-input-group">
          <Label htmlFor="dateTo">Até</Label>
          <Input
            id="dateTo"
            type="date"
            defaultValue={filters.dateTo ?? ""}
            onChange={(e) => update("dateTo", e.target.value)}
          />
        </div>

        {showLawyer && (
          <div className="ds-input-group">
            <Label htmlFor="lawyerId">Advogado</Label>
            <Select
              id="lawyerId"
              defaultValue={filters.lawyerId ?? ""}
              onChange={(e) => update("lawyerId", e.target.value)}
            >
              <option value="">Todos</option>
              {lawyers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {showStatus && statusOptions.length > 0 && (
          <div className="ds-input-group">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              defaultValue={filters.status ?? ""}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="">Todos</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={clear}>
        Limpar filtros
      </Button>
    </div>
  );
}
