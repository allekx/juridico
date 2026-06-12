import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OFFICE_INFO } from "@/constants/home-content";
import { Heading, Lead } from "@/components/ui/typography";

export function CtaSection() {
  const whatsappUrl = `https://wa.me/${OFFICE_INFO.whatsapp}?text=${encodeURIComponent(
    "Olá! Gostaria de agendar uma consulta jurídica."
  )}`;

  return (
    <section className="ds-section-sm">
      <div className="ds-container">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary via-primary to-primary/90 px-6 py-12 shadow-premium md:px-12 md:py-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gold/5 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <Heading className="text-balance text-primary-foreground">
              Precisa de orientação jurídica agora?
            </Heading>
            <Lead className="mt-4 text-primary-foreground/80">
              Agende sua consulta gratuita e receba uma análise preliminar do
              seu caso com um de nossos especialistas.
            </Lead>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="premium" size="xl">
                <Link href="#contato">
                  Agendar consulta gratuita
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="xl"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
