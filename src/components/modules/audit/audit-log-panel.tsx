import Link from "next/link";
import {
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Upload,
  ShieldAlert,
  Activity,
} from "lucide-react";
import type { AuditAction } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
} from "@/constants/audit";
import type {
  AuditLogItem,
  AuditLogStats,
  PaginatedAuditLogs,
} from "@/types/audit";

const ACTION_ICONS: Record<AuditAction, typeof Activity> = {
  LOGIN: LogIn,
  LOGIN_FAILED: ShieldAlert,
  LOGOUT: LogOut,
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
  UPLOAD: Upload,
};

const ACTION_VARIANTS: Record<
  AuditAction,
  "default" | "success" | "warning" | "destructive" | "muted" | "gold"
> = {
  LOGIN: "success",
  LOGIN_FAILED: "destructive",
  LOGOUT: "muted",
  CREATE: "gold",
  UPDATE: "default",
  DELETE: "destructive",
  UPLOAD: "success",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

function buildPageUrl(
  page: number,
  filters: { action?: string; q?: string; entityType?: string }
) {
  const params = new URLSearchParams();
  if (filters.action) params.set("action", filters.action);
  if (filters.q) params.set("q", filters.q);
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

interface AuditLogPanelProps {
  stats: AuditLogStats;
  result: PaginatedAuditLogs;
  filters: {
    action?: string;
    q?: string;
    entityType?: string;
  };
}

export function AuditLogPanel({ stats, result, filters }: AuditLogPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Hoje" value={stats.today} />
        <StatCard label="Sessões" value={stats.logins} />
        <StatCard label="Uploads" value={stats.uploads} />
        <StatCard label="Alterações" value={stats.updates} />
        <StatCard label="Exclusões" value={stats.deletions} />
      </div>

      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-medium">
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3" method="get">
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Buscar por usuário ou descrição..."
              className="min-w-[220px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <select
              name="action"
              defaultValue={filters.action ?? ""}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todas as ações</option>
              {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              name="entityType"
              defaultValue={filters.entityType ?? ""}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(AUDIT_ENTITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              Filtrar
            </Button>
            {(filters.action || filters.q || filters.entityType) && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/admin/auditoria">Limpar</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-medium">
            Registro de atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum evento encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {result.items.map((item) => (
                <AuditLogRow key={item.id} item={item} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
              <p className="text-sm text-muted-foreground">
                Página {result.page} de {result.totalPages} ({result.total}{" "}
                registros)
              </p>
              <div className="flex gap-2">
                {result.page > 1 && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/dashboard/admin/auditoria${buildPageUrl(result.page - 1, filters)}`}
                    >
                      Anterior
                    </Link>
                  </Button>
                )}
                {result.page < result.totalPages && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/dashboard/admin/auditoria${buildPageUrl(result.page + 1, filters)}`}
                    >
                      Próxima
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card variant="elevated">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function AuditLogRow({ item }: { item: AuditLogItem }) {
  const Icon = ACTION_ICONS[item.action];
  const variant = ACTION_VARIANTS[item.action];
  const entityLabel =
    AUDIT_ENTITY_LABELS[item.entityType] ?? item.entityType;

  return (
    <div className="flex gap-3 rounded-lg border border-border/60 bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={variant} className="text-2xs">
            {AUDIT_ACTION_LABELS[item.action]}
          </Badge>
          <Badge variant="outline" className="text-2xs">
            {entityLabel}
          </Badge>
          <time className="text-xs text-muted-foreground">
            {formatDate(item.createdAt)}
          </time>
        </div>
        <p className="mt-1 text-sm font-medium">{item.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {item.actorName}
          {item.actorEmail ? ` · ${item.actorEmail}` : ""}
          {item.ipAddress ? ` · IP ${item.ipAddress}` : ""}
        </p>
      </div>
    </div>
  );
}
