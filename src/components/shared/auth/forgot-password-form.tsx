"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/actions/auth/reset-password";
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

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(forgotPasswordAction, null);

  if (state?.success) {
    return (
      <Card variant="premium" className="w-full">
        <CardHeader className="text-center">
          <CardTitle>E-mail enviado</CardTitle>
          <CardDescription>
            Verifique sua caixa de entrada e siga as instruções para redefinir
            sua senha.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm text-primary transition-colors hover:underline"
          >
            Voltar ao login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card variant="premium" className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu e-mail para receber o link de recuperação
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

          <FormField label="E-mail" htmlFor="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              required
              disabled={isPending}
            />
          </FormField>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Enviando..." : "Enviar link de recuperação"}
          </Button>
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Voltar ao login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
