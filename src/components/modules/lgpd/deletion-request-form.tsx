"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, ShieldAlert } from "lucide-react";
import { submitDeletionRequestAction } from "@/actions/lgpd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { ActionResult } from "@/types/auth";

export function DeletionRequestForm() {
  const [state, formAction, isPending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(submitDeletionRequestAction, null);

  if (state?.success) {
    return (
      <Card variant="elevated" className="mx-auto max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <ShieldAlert className="h-7 w-7 text-success" />
          </div>
          <h3 className="font-display text-xl font-semibold">
            Solicitação registrada
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Recebemos seu pedido de exclusão de dados. Nossa equipe analisará
            em até 15 dias úteis e responderá pelo e-mail informado.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Protocolo: {state.data?.id.slice(0, 8).toUpperCase()}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardContent className="p-6 md:p-8">
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="requesterName">Nome completo</Label>
              <Input
                id="requesterName"
                name="requesterName"
                required
                disabled={isPending}
              />
            </div>
            <div className="ds-input-group">
              <Label htmlFor="requesterEmail">E-mail</Label>
              <Input
                id="requesterEmail"
                name="requesterEmail"
                type="email"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="ds-input-group">
              <Label htmlFor="requesterPhone">Telefone (opcional)</Label>
              <Input
                id="requesterPhone"
                name="requesterPhone"
                type="tel"
                disabled={isPending}
              />
            </div>
            <div className="ds-input-group">
              <Label htmlFor="cpfCnpj">CPF ou CNPJ (opcional)</Label>
              <Input id="cpfCnpj" name="cpfCnpj" disabled={isPending} />
            </div>
          </div>

          <div className="ds-input-group">
            <Label htmlFor="reason">Motivo da solicitação</Label>
            <Textarea
              id="reason"
              name="reason"
              rows={5}
              required
              placeholder="Descreva quais dados deseja excluir e o contexto do atendimento..."
              disabled={isPending}
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-4">
            <input
              id="confirm"
              name="confirm"
              type="checkbox"
              value="on"
              required
              disabled={isPending}
              className="mt-1 h-4 w-4 rounded border-input"
            />
            <Label htmlFor="confirm" className="text-sm font-normal leading-relaxed">
              Confirmo que desejo solicitar a exclusão ou anonimização dos meus
              dados pessoais tratados pelo escritório, ciente de que algumas
              informações podem ser mantidas quando houver obrigação legal ou
              exercício de direitos.
            </Label>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar solicitação
          </Button>

          <p className="text-xs text-muted-foreground">
            Consulte também nossa{" "}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
