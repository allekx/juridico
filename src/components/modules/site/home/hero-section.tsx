import Link from "next/link";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Display, Lead, Overline } from "@/components/ui/typography";
import { HERO_CONTENT, OFFICE_INFO } from "@/constants/home-content";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gold-muted/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.06),_transparent_50%)]" />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="ds-container relative py-16 md:py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <Overline className="mb-4 block">{HERO_CONTENT.overline}</Overline>
            <Display className="text-balance text-3xl md:text-4xl lg:text-5xl">
              {HERO_CONTENT.title}
            </Display>
            <Lead className="mt-6">{HERO_CONTENT.subtitle}</Lead>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href="/triagem">
                  {HERO_CONTENT.ctaPrimary}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href="#areas">{HERO_CONTENT.ctaSecondary}</Link>
              </Button>
            </div>

            <ul className="mt-8 space-y-2.5">
              {HERO_CONTENT.trustBadges.map((badge) => (
                <li
                  key={badge}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-gold"
                    strokeWidth={1.5}
                  />
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl border border-border/60 bg-card p-8 shadow-premium">
              <div className="absolute -left-3 -top-3 h-full w-full rounded-2xl border border-gold/20" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant="gold">Consulta Gratuita</Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    OAB/SP
                  </span>
                </div>

                <blockquote className="font-display text-2xl font-medium leading-snug text-primary">
                  &ldquo;A justiça atrasa, mas não falha. Garantimos que
                  você chegue preparado.&rdquo;
                </blockquote>

                <div className="ds-divider" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="font-display text-3xl font-semibold text-primary">
                      25+
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Anos de atuação
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="font-display text-3xl font-semibold text-primary">
                      94%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Taxa de êxito
                    </p>
                  </div>
                </div>

                <Button asChild variant="premium" className="w-full" size="lg">
                  <a href={`tel:${OFFICE_INFO.phone.replace(/\D/g, "")}`}>
                    <Phone className="h-4 w-4" />
                    {OFFICE_INFO.phone}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
