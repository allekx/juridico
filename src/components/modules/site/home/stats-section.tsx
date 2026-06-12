import { STATS } from "@/constants/home-content";

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-14 md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--gold)/0.08),_transparent_70%)]" />

      <div className="ds-container relative">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-4xl font-semibold text-primary-foreground md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-primary-foreground/70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
