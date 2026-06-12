"use client";

import { useActionState } from "react";
import { clientLoginAction } from "@/actions/auth/client-login";
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

export function ClientLoginForm() {
  const [state, formAction, isPending] = useActionState<
    ActionResult<{ redirectTo: string }> | null,
    FormData
  >(clientLoginAction, null);

  return (
    <Card variant="premium" className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Área do Cliente</CardTitle>
        <CardDescription>
          Acesse com seu CPF e senha para acompanhar seus processos
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

          <FormField label="CPF ou CNPJ" htmlFor="cpf" required>
            <Input
              id="cpf"
              name="cpf"
              placeholder="000.000.000-00"
              autoComplete="username"
              required
              disabled={isPending}
            />
          </FormField>

          <FormField label="Senha" htmlFor="password" required>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isPending}
            />
          </FormField>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
