import {
  Shield,
  Clock,
  Award,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import { getPracticeAreaSummaries } from "@/lib/practice-areas";

export const OFFICE_INFO = {
  name: "Almeida & Associados",
  tagline: "Advocacia Estratégica",
  phone: "(11) 3456-7890",
  whatsapp: "551134567890",
  email: "contato@almeidaassociados.com.br",
  address: "Av. Paulista, 1000, Bela Vista, São Paulo, SP",
  hours: "Segunda a sexta, 9h às 18h",
} as const;

export const HERO_CONTENT = {
  overline: "Escritório de Advocacia Premium",
  title: "Defendemos seus interesses com excelência e estratégia",
  subtitle:
    "Há mais de 25 anos, unimos tradição jurídica e visão moderna para entregar resultados em casos complexos, com atendimento personalizado e transparência.",
  ctaPrimary: "Agendar consulta gratuita",
  ctaSecondary: "Conheça nossas áreas",
  trustBadges: [
    "Primeira consulta sem compromisso",
    "Atendimento em até 24h",
    "Mais de 3.000 clientes atendidos",
  ],
} as const;

export interface Differential {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const DIFFERENTIALS: Differential[] = [
  {
    icon: Award,
    title: "Experiência Comprovada",
    description:
      "Mais de duas décadas de atuação em casos de alta complexidade nos tribunais estaduais e federais.",
  },
  {
    icon: Shield,
    title: "Sigilo Absoluto",
    description:
      "Tratamos cada caso com discrição e confidencialidade, protegendo seus dados e sua reputação.",
  },
  {
    icon: Clock,
    title: "Agilidade Estratégica",
    description:
      "Prazos monitorados em tempo real. Consulte o andamento do seu caso pelo site, sem necessidade de login.",
  },
  {
    icon: Handshake,
    title: "Atendimento Humanizado",
    description:
      "Cada cliente tem um advogado dedicado. Sem call centers, sem respostas automáticas.",
  },
];

export const PRACTICE_AREAS = getPracticeAreaSummaries();

export interface TeamMember {
  name: string;
  role: string;
  oab: string;
  specialty: string;
  initials: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Dr. Ricardo Almeida",
    role: "Sócio Fundador",
    oab: "OAB/SP 123.456",
    specialty: "Direito Empresarial e Societário",
    initials: "RA",
  },
  {
    name: "Dra. Camila Ferreira",
    role: "Sócia",
    oab: "OAB/SP 234.567",
    specialty: "Direito Trabalhista e Previdenciário",
    initials: "CF",
  },
  {
    name: "Dr. Eduardo Martins",
    role: "Advogado Sênior",
    oab: "OAB/SP 345.678",
    specialty: "Direito Criminal e Penal Empresarial",
    initials: "EM",
  },
  {
    name: "Dra. Beatriz Nogueira",
    role: "Advogada Sênior",
    oab: "OAB/SP 456.789",
    specialty: "Direito de Família e Sucessões",
    initials: "BN",
  },
];

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  caseType: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Marcos Oliveira",
    role: "CEO, Tech Solutions Ltda",
    content:
      "O escritório conduziu nossa reestruturação societária com precisão técnica e prazos impecáveis. Recomendo sem hesitar para qualquer empresa que busca segurança jurídica.",
    rating: 5,
    caseType: "Direito Empresarial",
  },
  {
    name: "Ana Paula Ribeiro",
    role: "Empresária",
    content:
      "Fui atendida com respeito e clareza em um momento muito difícil. A Dra. Beatriz explicou cada etapa do processo e me manteve informada o tempo todo.",
    rating: 5,
    caseType: "Direito de Família",
  },
  {
    name: "Carlos Mendes",
    role: "Diretor de RH",
    content:
      "Reduzimos em 40% as ações trabalhistas após a consultoria preventiva do escritório. Parceria de longo prazo que faz diferença no nosso negócio.",
    rating: 5,
    caseType: "Direito Trabalhista",
  },
];

export const STATS = [
  { value: "25+", label: "Anos de experiência" },
  { value: "3.200+", label: "Clientes atendidos" },
  { value: "94%", label: "Taxa de êxito" },
  { value: "18", label: "Advogados especialistas" },
] as const;

export const FAQ_ITEMS = [
  {
    question: "A primeira consulta é realmente gratuita?",
    answer:
      "Sim. A primeira consulta tem duração de até 40 minutos e serve para entendermos seu caso, avaliarmos a viabilidade jurídica e apresentarmos as possíveis estratégias, sem compromisso.",
  },
  {
    question: "Como funciona o acompanhamento do meu processo?",
    answer:
      "Utilize a Consulta de andamento no site com seu CPF ou CNPJ e o número do processo informado pelo escritório. A consulta é pública e não exige login.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos honorários fixos, por êxito, mensalidades para consultoria e parcelamento em casos específicos. Tudo formalizado em contrato com transparência total.",
  },
  {
    question: "Atendem clientes de outras cidades ou estados?",
    answer:
      "Sim. Atuamos em todo o território nacional, com correspondentes em todos os estados. Consultas podem ser realizadas por videoconferência.",
  },
  {
    question: "Quanto tempo leva para iniciar meu caso?",
    answer:
      "Após a consulta inicial e assinatura do contrato, iniciamos as providências em até 48 horas úteis. Em urgências, atuamos no mesmo dia.",
  },
] as const;

export const NAV_LINKS = [
  { label: "Diferenciais", href: "/#diferenciais" },
  { label: "Áreas", href: "/areas-de-atuacao" },
  { label: "Triagem", href: "/triagem" },
  { label: "Equipe", href: "/#equipe" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contato", href: "/#contato" },
] as const;
