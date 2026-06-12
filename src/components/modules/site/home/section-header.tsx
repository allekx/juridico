import { cn } from "@/lib/utils";
import { Overline, Heading, Lead } from "@/components/ui/typography";

interface SectionHeaderProps {
  overline?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  overline,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "mx-auto max-w-2xl text-center",
        align === "left" && "max-w-2xl",
        className
      )}
    >
      {overline && <Overline className="mb-3 block">{overline}</Overline>}
      <Heading className="text-balance">{title}</Heading>
      {description && (
        <Lead className={cn("mt-4", align === "center" && "mx-auto")}>
          {description}
        </Lead>
      )}
      {align === "center" && <div className="ds-divider-gold mx-auto mt-6" />}
    </div>
  );
}
