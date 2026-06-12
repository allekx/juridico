"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS_LABELS, CONTRACT_STATUS_LABELS } from "@/constants/financial";
import type { FinancialListFilters, FinancialSelectOption } from "@/types/financial";

interface FinancialFiltersProps {
  filters: FinancialListFilters;
  clients: FinancialSelectOption[];
  contracts?: FinancialSelectOption[];
  showContractFilter?: boolean;
  showStatusFilter?: boolean;
  statusType?: "payment" | "contract" | "installment";
}

export function FinancialFilters({
  filters,
  clients,
  contracts = [],
  showContractFilter = false,
  showStatusFilter = true,
  statusType = "payment",
}: FinancialFiltersProps) {
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

  const statusOptions =
    statusType === "contract"
      ? Object.entries(CONTRACT_STATUS_LABELS)
      : Object.entries(PAYMENT_STATUS_LABELS);

  return (
    <div className="ds-surface space-y-4 p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <div className="ds-input-group">
          <Label htmlFor="q">Buscar</Label>
          <Input
            id="q"
            defaultValue={filters.q ?? ""}
            placeholder="Nome, descrição..."
            onBlur={(e) => update("q", e.target.value)}
          />
        </div>

        <div className="ds-input-group">
          <Label htmlFor="clientId">Cliente</Label>
          <Select
            id="clientId"
            defaultValue={filters.clientId ?? ""}
            onChange={(e) => update("clientId", e.target.value)}
          >
            <option value="">Todos</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        {showContractFilter && (
          <div className="ds-input-group">
            <Label htmlFor="contractId">Contrato</Label>
            <Select
              id="contractId"
              defaultValue={filters.contractId ?? ""}
              onChange={(e) => update("contractId", e.target.value)}
            >
              <option value="">Todos</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        )}

        {showStatusFilter && (
          <div className="ds-input-group">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              defaultValue={filters.status ?? ""}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="">Todos</option>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        )}

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
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={clear}>
        Limpar filtros
      </Button>
    </div>
  );
}
