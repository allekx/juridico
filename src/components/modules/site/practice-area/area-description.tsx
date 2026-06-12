import { Heading, Text } from "@/components/ui/typography";
import type { PracticeAreaDetail } from "@/types/practice-area";

interface AreaDescriptionProps {
  area: PracticeAreaDetail;
}

export function AreaDescription({ area }: AreaDescriptionProps) {
  return (
    <section className="ds-section-sm">
      <div className="ds-container">
        <div className="mx-auto max-w-3xl">
          <Heading className="text-balance">{area.description.title}</Heading>
          <div className="mt-6 space-y-4">
            {area.description.paragraphs.map((paragraph) => (
              <Text key={paragraph.slice(0, 40)} className="text-muted-foreground">
                {paragraph}
              </Text>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
