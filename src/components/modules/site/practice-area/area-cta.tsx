import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Lead } from "@/components/ui/typography";
import { OFFICE_INFO } from "@/constants/home-content";
import type { PracticeAreaDetail } from "@/types/practice-area";

interface AreaCtaProps {
  area: PracticeAreaDetail;
}

export function AreaCta({ area }: AreaCtaProps) {
  const whatsappUrl = `https://wa.me/${OFFICE_INFO.whatsapp}?text=${encodeURIComponent(
    `Olá! Gostaria de agendar uma consulta sobre ${area.title}.`
  )}`;

  return (
    <section className="ds-section-sm">
      <div className="ds-container">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary via-primary to-primary/90 px-6 py-12 shadow-premium md:px-12 md:py-14">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <Heading className="text-balance text-primary-foreground">
              {area.cta.title}
            </Heading>
            <Lead className="mt-4 text-primary-foreground/80">
              {area.cta.description}
            </Lead>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="premium" size="xl">
                <Link href={`/#contato?area=${area.slug}`}>
                  Agendar consulta
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

            <a
              href={`tel:${OFFICE_INFO.phone.replace(/\D/g, "")}`}
              className="mt-6 inline-flex items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              {OFFICE_INFO.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
