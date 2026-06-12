"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/forms/form-field";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  city: string;
  state: string;
  additionalNotes: string;
}

interface ContactStepProps {
  data: ContactFormData;
  onChange: (field: keyof ContactFormData, value: string) => void;
}

export function ContactStep({ data, onChange }: ContactStepProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <FormField label="Nome completo" htmlFor="name" required>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="E-mail" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            required
          />
        </FormField>
        <FormField label="Telefone / WhatsApp" htmlFor="phone" required>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            required
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="CPF ou CNPJ" htmlFor="cpfCnpj" className="sm:col-span-1">
          <Input
            id="cpfCnpj"
            value={data.cpfCnpj}
            onChange={(e) => onChange("cpfCnpj", e.target.value)}
          />
        </FormField>
        <FormField label="Cidade" htmlFor="city">
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </FormField>
        <FormField label="UF" htmlFor="state">
          <Input
            id="state"
            maxLength={2}
            value={data.state}
            onChange={(e) => onChange("state", e.target.value.toUpperCase())}
          />
        </FormField>
      </div>

      <FormField label="Observações adicionais" htmlFor="additionalNotes">
        <Textarea
          id="additionalNotes"
          value={data.additionalNotes}
          onChange={(e) => onChange("additionalNotes", e.target.value)}
          rows={3}
        />
      </FormField>
    </div>
  );
}
