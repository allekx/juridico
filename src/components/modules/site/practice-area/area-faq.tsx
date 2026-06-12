import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "@/components/modules/site/home/section-header";
import type { PracticeAreaDetail } from "@/types/practice-area";

interface AreaFaqProps {
  area: PracticeAreaDetail;
}

export function AreaFaq({ area }: AreaFaqProps) {
  return (
    <section className="ds-section-sm border-t border-border/40 bg-muted/20">
      <div className="ds-container">
        <SectionHeader
          overline="Dúvidas frequentes"
          title="Perguntas e respostas"
          description={`Esclarecimentos sobre ${area.shortTitle.toLowerCase()}.`}
          align="center"
        />

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {area.faq.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`}>
                <AccordionTrigger className="font-display text-base font-medium text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
