"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { updatePasswordAction } from "@/actions/auth/reset-password";
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

export function ResetPasswordForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(updatePasswordAction, null);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => router.push("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  if (state?.success) {
    return (
      <Card variant="premium" className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Senha atualizada</CardTitle>
          <CardDescription>
            Sua senha foi redefinida com sucesso. Redirecionando para o login...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card variant="premium" className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Nova senha</CardTitle>
        <CardDescription>Defina sua nova senha de acesso</CardDescription>
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

          <FormField
            label="Nova senha"
            htmlFor="password"
            required
            hint="Mínimo 8 caracteres, com maiúscula, minúscula e número"
          >
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              disabled={isPending}
            />
          </FormField>

          <FormField label="Confirmar senha" htmlFor="confirmPassword" required>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              disabled={isPending}
            />
          </FormField>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Salvando..." : "Redefinir senha"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
