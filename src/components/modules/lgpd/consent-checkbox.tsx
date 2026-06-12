"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";

interface ConsentCheckboxProps {
  id: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  defaultChecked?: boolean;
  showMarketing?: boolean;
}

export function ConsentCheckbox({
  id,
  name,
  required = true,
  disabled = false,
  defaultChecked = false,
  showMarketing = false,
}: ConsentCheckboxProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          value="on"
          required={required}
          disabled={disabled}
          defaultChecked={defaultChecked}
          className="mt-1 h-4 w-4 rounded border-input"
        />
        <Label htmlFor={id} className="text-sm font-normal leading-relaxed">
          Li e aceito a{" "}
          <Link href="/privacidade" className="text-primary hover:underline" target="_blank">
            Política de Privacidade
          </Link>
          , os{" "}
          <Link href="/termos" className="text-primary hover:underline" target="_blank">
            Termos de Uso
          </Link>{" "}
          e autorizo o tratamento dos meus dados para atendimento e comunicação
          relacionada à minha solicitação, conforme a LGPD.
        </Label>
      </div>

      {showMarketing && (
        <div className="flex items-start gap-3 pl-0 sm:pl-7">
          <input
            id={`${id}-marketing`}
            name="marketing"
            type="checkbox"
            value="on"
            disabled={disabled}
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <Label
            htmlFor={`${id}-marketing`}
            className="text-sm font-normal text-muted-foreground"
          >
            Desejo receber comunicações e novidades do escritório (opcional).
          </Label>
        </div>
      )}
    </div>
  );
}
