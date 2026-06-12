import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Lead } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Triagem enviada",
  robots: { index: false },
};

export default function TriageSuccessPage() {
  return (
    <section className="ds-section">
      <div className="ds-container">
        <Card variant="premium" className="mx-auto max-w-lg text-center">
          <CardContent className="p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.5} />
            </div>
            <Heading className="text-2xl">Triagem enviada com sucesso!</Heading>
            <Lead className="mt-4">
              Recebemos suas informações. Nossa equipe analisará seu caso e
              entrará em contato em até 24 horas úteis.
            </Lead>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/">
                  Voltar ao início
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/blog">
                  Ler artigos jurídicos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
