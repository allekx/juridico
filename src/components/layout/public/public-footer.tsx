import Link from "next/link";
import { Scale, MapPin, Phone, Mail } from "lucide-react";
import { OFFICE_INFO, NAV_LINKS, PRACTICE_AREAS } from "@/constants/home-content";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-primary text-primary-foreground">
      <div className="ds-container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Scale className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <span className="font-display text-lg font-semibold">
                {OFFICE_INFO.name}
              </span>
            </Link>
            <p className="mt-3 text-sm text-primary-foreground/70">
              Advocacia estratégica com mais de 25 anos de experiência em casos
              complexos.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Navegação
            </h4>
            <ul className="mt-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/consulta"
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  Consulta de andamento
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Áreas de Atuação
            </h4>
            <ul className="mt-4 space-y-2">
              {PRACTICE_AREAS.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/areas-de-atuacao/${area.slug}`}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {area.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Contato
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-primary-foreground/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                {OFFICE_INFO.address}
              </li>
              <li>
                <a
                  href={`tel:${OFFICE_INFO.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-2.5 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  <Phone className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  {OFFICE_INFO.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${OFFICE_INFO.email}`}
                  className="flex items-center gap-2.5 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  <Mail className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  {OFFICE_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="ds-divider mt-10 opacity-20" />

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-center text-sm text-primary-foreground/50 sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} {OFFICE_INFO.name}. Todos os direitos
            reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
            <Link
              href="/privacidade"
              className="transition-colors hover:text-primary-foreground"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="transition-colors hover:text-primary-foreground"
            >
              Termos de uso
            </Link>
            <Link
              href="/lgpd/exclusao-dados"
              className="transition-colors hover:text-primary-foreground"
            >
              Exclusão de dados
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
