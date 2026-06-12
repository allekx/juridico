import { cn } from "@/lib/utils";

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
};

export function Display({
  className,
  as: Comp = "h1",
  ...props
}: TypographyProps) {
  return (
    <Comp
      className={cn(
        "font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl",
        className
      )}
      {...props}
    />
  );
}

export function Heading({
  className,
  as: Comp = "h2",
  ...props
}: TypographyProps) {
  return (
    <Comp
      className={cn(
        "font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl",
        className
      )}
      {...props}
    />
  );
}

export function Subheading({
  className,
  as: Comp = "h3",
  ...props
}: TypographyProps) {
  return (
    <Comp
      className={cn(
        "font-display text-xl font-medium tracking-tight text-foreground md:text-2xl",
        className
      )}
      {...props}
    />
  );
}

export function Title({
  className,
  as: Comp = "h4",
  ...props
}: TypographyProps) {
  return (
    <Comp
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function Text({
  className,
  as: Comp = "p",
  ...props
}: TypographyProps) {
  return (
    <Comp
      className={cn("text-base leading-relaxed text-foreground", className)}
      {...props}
    />
  );
}

export function Lead({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-lg leading-relaxed text-muted-foreground md:text-xl",
        className
      )}
      {...props}
    />
  );
}

export function Muted({
  className,
  as: Comp = "p",
  ...props
}: TypographyProps) {
  return (
    <Comp
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function Small({
  className,
  as: Comp = "span",
  ...props
}: TypographyProps) {
  return (
    <Comp className={cn("text-xs text-muted-foreground", className)} {...props} />
  );
}

export function Legal({
  className,
  as: Comp = "span",
  ...props
}: TypographyProps) {
  return (
    <Comp
      className={cn("font-mono text-sm tracking-wide text-foreground", className)}
      {...props}
    />
  );
}

export function Overline({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.15em] text-gold",
        className
      )}
      {...props}
    />
  );
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ds-page-header", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Heading className="ds-page-title">{title}</Heading>
          {description && (
            <p className="ds-page-description">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
