"use client";

import { useActionState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { contactAction } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/shared/forms/form-field";
import { OFFICE_INFO, PRACTICE_AREAS } from "@/constants/home-content";
import { ConsentCheckbox } from "@/components/modules/lgpd/consent-checkbox";
import { SectionHeader } from "./section-header";
import type { ActionResult } from "@/types/auth";

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Endereço",
    value: OFFICE_INFO.address,
  },
  {
    icon: Phone,
    label: "Telefone",
    value: OFFICE_INFO.phone,
    href: `tel:${OFFICE_INFO.phone.replace(/\D/g, "")}`,
  },
  {
    icon: Mail,
    label: "E-mail",
    value: OFFICE_INFO.email,
    href: `mailto:${OFFICE_INFO.email}`,
  },
  {
    icon: Clock,
    label: "Horário",
    value: OFFICE_INFO.hours,
  },
];

export function ContactSection() {
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(contactAction, null);

  if (state?.success) {
    return (
      <section id="contato" className="ds-section scroll-mt-20">
        <div className="ds-container">
          <Card variant="premium" className="mx-auto max-w-lg text-center">
            <CardContent className="p-10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <Mail className="h-6 w-6 text-success" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl font-semibold">
                Mensagem enviada!
              </h3>
              <p className="mt-2 text-muted-foreground">
                Recebemos seu contato e retornaremos em até 24 horas úteis.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="contato" className="ds-section scroll-mt-20">
      <div className="ds-container">
        <SectionHeader
          overline="Fale conosco"
          title="Entre em contato"
          description="Preencha o formulário e nossa equipe retornará em até 24 horas úteis."
        />

        <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
          <div className="space-y-6 lg:col-span-2">
            {CONTACT_INFO.map((info) => (
              <div key={info.label} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                  <info.icon
                    className="h-4 w-4 text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{info.label}</p>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="mt-0.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {info.value}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-border bg-muted/30 p-5">
              <p className="text-sm font-medium">Consulta gratuita</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Primeira consulta sem compromisso. Presencial ou por
                videoconferência.
              </p>
            </div>
          </div>

          <Card variant="elevated" className="lg:col-span-3">
            <CardContent className="p-6 md:p-8">
              <form action={formAction} className="space-y-5">
                {state?.error && (
                  <div
                    className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                    role="alert"
                  >
                    {state.error}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label="Nome completo" htmlFor="name" required>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Seu nome"
                      required
                      disabled={isPending}
                    />
                  </FormField>

                  <FormField label="Telefone" htmlFor="phone" required>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      required
                      disabled={isPending}
                    />
                  </FormField>
                </div>

                <FormField label="E-mail" htmlFor="email" required>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    disabled={isPending}
                  />
                </FormField>

                <FormField
                  label="Área de interesse"
                  htmlFor="area"
                  required
                >
                  <select
                    id="area"
                    name="area"
                    required
                    disabled={isPending}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:border-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecione uma área
                    </option>
                    {PRACTICE_AREAS.map((area) => (
                      <option key={area.slug} value={area.title}>
                        {area.title}
                      </option>
                    ))}
                    <option value="Outra">Outra</option>
                  </select>
                </FormField>

                <FormField label="Mensagem" htmlFor="message" required>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Descreva brevemente sua necessidade jurídica..."
                    rows={4}
                    required
                    disabled={isPending}
                  />
                </FormField>

                <ConsentCheckbox
                  id="contact-consent"
                  name="consent"
                  disabled={isPending}
                  showMarketing
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={isPending}
                >
                  {isPending ? "Enviando..." : "Enviar mensagem"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
