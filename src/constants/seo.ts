import { OFFICE_INFO } from "@/constants/home-content";

export const SEO_DEFAULTS = {
  siteName: OFFICE_INFO.name,
  tagline: OFFICE_INFO.tagline,
  defaultTitle: `${OFFICE_INFO.name} — ${OFFICE_INFO.tagline}`,
  defaultDescription:
    "Escritório de advocacia em São Paulo com mais de 25 anos de experiência. Atuação em Direito Trabalhista, Empresarial, Família, Criminal, Tributário e mais. Consulta gratuita.",
  locale: "pt_BR" as const,
  language: "pt-BR",
  defaultOgImage: "/og-default.svg",
  defaultKeywords: [
    "advogado são paulo",
    "escritório de advocacia",
    "advocacia estratégica",
    "consulta jurídica gratuita",
    "advogado trabalhista",
    "advogado empresarial",
    "advogado criminal",
    "direito de família",
    "advogado previdenciário",
    "advogado tributário",
  ],
  geo: {
    region: "BR-SP",
    placename: "São Paulo",
    position: "-23.5505;-46.6333",
  },
} as const;
