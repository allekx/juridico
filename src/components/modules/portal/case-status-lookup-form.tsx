"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { lookupCaseStatusAction } from "@/actions/portal/lookup";
import { CaseProgressCard } from "@/components/modules/portal/case-progress-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/shared/forms/form-field";
import type { ActionResult } from "@/types/auth";
import type { PortalCaseProgress } from "@/lib/portal/queries";

type LookupState = ActionResult<{ progress: PortalCaseProgress }> | null;

export function CaseStatusLookupForm() {
  const [state, formAction, isPending] = useActionState<
    LookupState,
    FormData
  >(lookupCaseStatusAction, null);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <Card variant="premium">
        <CardHeader className="text-center">
          <CardTitle>Consulta de andamento</CardTitle>
          <CardDescription>
            Informe seus dados para visualizar a etapa atual do processo. Não é
            necessário cadastro nem senha.
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div
                className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                role="alert"
              >
                {state.error}
              </div>
            )}

            <FormField label="CPF ou CNPJ" htmlFor="cpfCnpj" required>
              <Input
                id="cpfCnpj"
                name="cpfCnpj"
                placeholder="000.000.000-00"
                inputMode="numeric"
                autoComplete="off"
                required
                disabled={isPending}
              />
            </FormField>

            <FormField
              label="Número do processo ou protocolo"
              htmlFor="reference"
              required
            >
              <Input
                id="reference"
                name="reference"
                placeholder="Informado pelo escritório"
                required
                disabled={isPending}
              />
            </FormField>

            <p className="text-xs text-muted-foreground">
              Use o número enviado pelo escritório no contrato, e-mail ou
              comunicação sobre o caso.
            </p>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              <Search className="h-4 w-4" />
              {isPending ? "Consultando..." : "Consultar andamento"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {state?.success && state.data?.progress && (
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Resultado da consulta</h2>
          <CaseProgressCard data={state.data.progress} />
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        É da equipe do escritório?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Acessar sistema interno
        </Link>
      </p>
    </div>
  );
}
