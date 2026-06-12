import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/constants/home-content";
import { SectionHeader } from "./section-header";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="ds-section scroll-mt-20 border-t border-border/40 bg-muted/20"
    >
      <div className="ds-container">
        <SectionHeader
          overline="Dúvidas frequentes"
          title="Perguntas e respostas"
          description="Esclarecemos as principais dúvidas antes da sua consulta."
        />

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`}>
                <AccordionTrigger className="font-display text-base font-medium text-foreground">
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
