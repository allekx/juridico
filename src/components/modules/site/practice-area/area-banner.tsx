import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Overline, Display, Lead } from "@/components/ui/typography";
import type { PracticeAreaDetail } from "@/types/practice-area";

interface AreaBannerProps {
  area: PracticeAreaDetail;
}

export function AreaBanner({ area }: AreaBannerProps) {
  const Icon = area.icon;

  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-primary via-primary to-primary/90">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--gold)/0.12),_transparent_60%)]" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/5 blur-3xl" />

      <div className="ds-container relative py-16 md:py-20 lg:py-24">
        <Link
          href="/areas-de-atuacao"
          className="mb-8 inline-flex items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Todas as áreas
        </Link>

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <Overline className="mb-4 block text-gold">
              {area.banner.overline}
            </Overline>
            <Display className="text-balance text-3xl text-primary-foreground md:text-4xl lg:text-5xl">
              {area.banner.title}
            </Display>
            <Lead className="mt-6 text-primary-foreground/80">
              {area.banner.subtitle}
            </Lead>
            <div className="mt-8">
              <Button asChild variant="premium" size="lg">
                <Link href="/#contato">
                  Agendar consulta gratuita
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex">
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur">
              <Icon
                className="h-16 w-16 text-gold"
                strokeWidth={1}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
