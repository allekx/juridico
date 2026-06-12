import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "@/constants/home-content";
import { SectionHeader } from "./section-header";

export function TeamSection() {
  return (
    <section id="equipe" className="ds-section scroll-mt-20">
      <div className="ds-container">
        <SectionHeader
          overline="Nossa equipe"
          title="Advogados especialistas"
          description="Profissionais com sólida formação acadêmica e experiência prática nos principais tribunais do país."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM_MEMBERS.map((member) => (
            <Card key={member.name} variant="elevated" className="group">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-md transition-transform group-hover:scale-105">
                  <span className="font-display text-2xl font-semibold text-primary-foreground">
                    {member.initials}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {member.name}
                </h3>
                <p className="mt-0.5 text-sm text-gold">{member.role}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {member.oab}
                </p>
                <Badge variant="muted" className="mt-3">
                  {member.specialty}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="ghost">
            <Link href="#contato">
              Agende com um de nossos especialistas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
