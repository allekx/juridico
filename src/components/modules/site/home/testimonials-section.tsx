import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TESTIMONIALS } from "@/constants/home-content";
import { SectionHeader } from "./section-header";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-gold text-gold"
              : "fill-muted text-muted"
          }`}
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section
      id="depoimentos"
      className="ds-section scroll-mt-20 border-y border-border/40 bg-primary/[0.02]"
    >
      <div className="ds-container">
        <SectionHeader
          overline="Depoimentos"
          title="O que nossos clientes dizem"
          description="A confiança de quem já resolveu seus problemas jurídicos conosco."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name} variant="elevated" className="h-full">
              <CardContent className="flex h-full flex-col p-6">
                <Quote
                  className="mb-4 h-8 w-8 text-gold/40"
                  strokeWidth={1}
                />
                <StarRating rating={testimonial.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>
                <div className="mt-6 border-t border-border/60 pt-4">
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <Badge variant="gold" className="mt-2">
                    {testimonial.caseType}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
