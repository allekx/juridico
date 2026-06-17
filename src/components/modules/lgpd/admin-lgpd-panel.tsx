"use client";
import { EMPTY_VALUE } from "@/constants/copy";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateDeletionStatusAction } from "@/actions/lgpd";
import {
  CONSENT_SOURCE_LABELS,
  CONSENT_TYPE_LABELS,
  DELETION_STATUS_LABELS,
  DELETION_STATUS_VARIANT,
  LEGAL_DOCUMENT_LABELS,
  SUBJECT_TYPE_LABELS,
} from "@/constants/lgpd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ConsentRecordRow,
  DeletionRequestRow,
  LegalDocumentListItem,
  LgpdAdminStats,
} from "@/types/lgpd";
import type { ActionResult } from "@/types/auth";

interface AdminLgpdPanelProps {
  stats: LgpdAdminStats;
  consents: ConsentRecordRow[];
  deletions: DeletionRequestRow[];
  documents: LegalDocumentListItem[];
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function DeletionStatusForm({ request }: { request: DeletionRequestRow }) {
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(updateDeletionStatusAction, null);

  return (
    <form action={formAction} className="mt-3 space-y-2 rounded-lg border p-3">
      <input type="hidden" name="requestId" value={request.id} />
      {state?.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-xs text-success">Status atualizado.</p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="ds-input-group">
          <Label htmlFor={`status-${request.id}`}>Status</Label>
          <Select
            id={`status-${request.id}`}
            name="status"
            defaultValue={request.status}
            disabled={isPending}
          >
            {Object.entries(DELETION_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="ds-input-group">
        <Label htmlFor={`notes-${request.id}`}>Observações internas</Label>
        <Textarea
          id={`notes-${request.id}`}
          name="adminNotes"
          rows={2}
          defaultValue={request.adminNotes ?? ""}
          disabled={isPending}
        />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Atualizar
      </Button>
    </form>
  );
}

export function AdminLgpdPanel({
  stats,
  consents,
  deletions,
  documents,
}: AdminLgpdPanelProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Consentimentos", value: stats.totalConsents },
          { label: "Este mês", value: stats.consentsThisMonth },
          { label: "Exclusões pendentes", value: stats.pendingDeletions },
          { label: "Documentos ativos", value: stats.activeDocuments },
        ].map((item) => (
          <Card key={item.label} variant="elevated">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="font-display text-2xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base font-sans font-medium">
            Documentos legais publicados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualizado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Nenhum documento cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{LEGAL_DOCUMENT_LABELS[doc.type]}</TableCell>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>v{doc.version}</TableCell>
                    <TableCell>
                      <Badge variant={doc.isActive ? "success" : "muted"}>
                        {doc.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(doc.updatedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base font-sans font-medium">
            Registro de consentimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Versão doc.</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Nenhum consentimento registrado
                  </TableCell>
                </TableRow>
              ) : (
                consents.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {c.subjectName ?? SUBJECT_TYPE_LABELS[c.subjectType]}
                        </p>
                        {c.subjectEmail && (
                          <p className="text-xs text-muted-foreground">
                            {c.subjectEmail}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.granted ? "success" : "destructive"}>
                        {CONSENT_TYPE_LABELS[c.consentType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {CONSENT_SOURCE_LABELS[c.source] ?? c.source}
                    </TableCell>
                    <TableCell>{c.documentVersion ?? EMPTY_VALUE}</TableCell>
                    <TableCell className="text-xs">{c.ipAddress ?? EMPTY_VALUE}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base font-sans font-medium">
            Solicitações de exclusão de dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {deletions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma solicitação registrada
            </p>
          ) : (
            deletions.map((d) => (
              <div
                key={d.id}
                className="rounded-lg border border-border/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{d.requesterName}</p>
                    <p className="text-sm text-muted-foreground">
                      {d.requesterEmail}
                      {d.cpfCnpj ? ` · ${d.cpfCnpj}` : ""}
                    </p>
                    <p className="mt-2 text-sm">{d.reason}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Solicitado em {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <Badge variant={DELETION_STATUS_VARIANT[d.status]}>
                    {DELETION_STATUS_LABELS[d.status]}
                  </Badge>
                </div>
                <DeletionStatusForm request={d} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
