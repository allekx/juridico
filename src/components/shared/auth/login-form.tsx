"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/auth/login";
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

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    ActionResult<{ redirectTo: string }> | null,
    FormData
  >(loginAction, null);

  useEffect(() => {
    if (state?.success && state.data?.redirectTo) {
      router.replace(state.data.redirectTo);
    }
  }, [state, router]);

  return (
    <Card variant="premium" className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Acesse com suas credenciais corporativas
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        {redirectTo && (
          <input type="hidden" name="redirect" value={redirectTo} />
        )}

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

          <FormField label="Senha" htmlFor="password" required>
            <div className="space-y-1">
              <div className="flex items-center justify-end">
                <Link
                  href="/recuperar-senha"
                  className="text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={isPending}
              />
            </div>
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
