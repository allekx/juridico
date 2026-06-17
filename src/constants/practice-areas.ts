import {
  Briefcase,
  Heart,
  Users,
  ShoppingCart,
  Building2,
  Home,
  Landmark,
  Gavel,
  type LucideIcon,
} from "lucide-react";
import type { PracticeAreaDetail } from "@/types/practice-area";

export const PRACTICE_AREA_SLUGS = [
  "trabalhista",
  "previdenciario",
  "familia",
  "consumidor",
  "empresarial",
  "imobiliario",
  "tributario",
  "criminal",
] as const;

export type PracticeAreaSlug = (typeof PRACTICE_AREA_SLUGS)[number];

const sharedBenefits = {
  consultoria: {
    title: "Consultoria preventiva",
    description:
      "Identificamos riscos antes que se tornem litígios, economizando tempo e recursos.",
  },
  acompanhamento: {
    title: "Acompanhamento personalizado",
    description:
      "Advogado dedicado ao seu caso, com atualizações pelo portal do cliente.",
  },
  estrategia: {
    title: "Estratégia sob medida",
    description:
      "Cada demanda recebe análise individualizada com foco no melhor resultado possível.",
  },
};

function area(
  data: Omit<PracticeAreaDetail, "icon"> & { icon: LucideIcon }
): PracticeAreaDetail {
  return data;
}

export const PRACTICE_AREAS_DATA: Record<PracticeAreaSlug, PracticeAreaDetail> = {
  trabalhista: area({
    slug: "trabalhista",
    title: "Direito Trabalhista",
    shortTitle: "Trabalhista",
    icon: Briefcase,
    metaDescription:
      "Advogados especialistas em Direito Trabalhista. Defesa de empresas e trabalhadores, ações rescisórias, acordos e consultoria preventiva.",
    banner: {
      overline: "Área de Atuação",
      title: "Direito Trabalhista",
      subtitle:
        "Assessoria completa para empresas e trabalhadores, da prevenção de passivos à defesa em ações individuais e coletivas.",
    },
    description: {
      title: "Proteção jurídica nas relações de trabalho",
      paragraphs: [
        "O Direito Trabalhista exige conhecimento técnico aprofundado e atualização constante diante das mudanças legislativas e jurisprudenciais. Nossa equipe atua tanto na defesa de empresas quanto na proteção dos direitos de trabalhadores.",
        "Oferecemos consultoria preventiva para reduzir passivos trabalhistas, estruturação de contratos e políticas internas, além de representação em reclamações trabalhistas, negociações coletivas e acordos extrajudiciais.",
        "Com mais de duas décadas de experiência perante a Justiça do Trabalho, combinamos visão estratégica e agilidade processual para alcançar os melhores resultados.",
      ],
    },
    benefits: {
      title: "Por que escolher nossa equipe trabalhista",
      items: [
        sharedBenefits.consultoria,
        {
          title: "Redução de passivos",
          description:
            "Auditorias trabalhistas e adequação de práticas para minimizar riscos futuros.",
        },
        sharedBenefits.acompanhamento,
        {
          title: "Negociação estratégica",
          description:
            "Atuação em acordos coletivos, homologações e transações com foco em economia.",
        },
      ],
    },
    cases: {
      title: "Casos que atendemos",
      items: [
        "Reclamações trabalhistas e defesas empresariais",
        "Rescisões contratuais e cálculos de verbas rescisórias",
        "Assédio moral e sexual no ambiente de trabalho",
        "Acidentes de trabalho e doenças ocupacionais",
        "Negociações sindicais e acordos coletivos",
        "Consultoria em terceirização e pejotização",
        "Execuções e cumprimentos de sentença trabalhista",
      ],
    },
    faq: [
      {
        question: "Fui demitido sem justa causa. Quais são meus direitos?",
        answer:
          "Você tem direito a aviso prévio, saldo de salário, férias proporcionais + 1/3, 13º proporcional, FGTS + multa de 40% e seguro-desemprego (se elegível). Analisamos seu contrato para identificar eventuais direitos adicionais.",
      },
      {
        question: "Minha empresa pode ser processada por um ex-funcionário?",
        answer:
          "Sim. Reclamações podem ocorrer até 2 anos após o término do contrato. Por isso, recomendamos documentação adequada e consultoria preventiva para reduzir riscos.",
      },
      {
        question: "É possível fazer acordo antes do julgamento?",
        answer:
          "Sim. A conciliação é incentivada em todas as fases. Nossa equipe negocia acordos vantajosos sempre que possível, reduzindo custos e tempo de processo.",
      },
    ],
    cta: {
      title: "Precisa de orientação trabalhista?",
      description:
        "Agende uma consulta e receba análise personalizada do seu caso, para empregador ou trabalhador.",
    },
  }),

  previdenciario: area({
    slug: "previdenciario",
    title: "Direito Previdenciário",
    shortTitle: "Previdenciário",
    icon: Heart,
    metaDescription:
      "Especialistas em Direito Previdenciário. Aposentadorias, benefícios por incapacidade, revisões e recursos junto ao INSS.",
    banner: {
      overline: "Área de Atuação",
      title: "Direito Previdenciário",
      subtitle:
        "Garantimos o acesso aos benefícios previdenciários com análise técnica de contribuições, revisões e recursos administrativos e judiciais.",
    },
    description: {
      title: "Seus direitos previdenciários assegurados",
      paragraphs: [
        "O sistema previdenciário brasileiro é complexo e as regras mudam frequentemente. Muitos segurados têm benefícios negados ou concedidos com valores inferiores ao devido.",
        "Nossa equipe previdenciária analisa seu histórico de contribuições, identifica a melhor regra de aposentadoria e atua em concessões, revisões e restabelecimentos de benefícios junto ao INSS e à Justiça Federal.",
        "Atendemos desde a fase administrativa até recursos em todas as instâncias, com foco em agilidade e maximização do valor do benefício.",
      ],
    },
    benefits: {
      title: "Nossos diferenciais previdenciários",
      items: [
        {
          title: "Análise de CNIS e contribuições",
          description:
            "Verificação completa do histórico para identificar falhas e oportunidades de correção.",
        },
        {
          title: "Simulação de aposentadoria",
          description:
            "Comparamos todas as regras de transição para encontrar a opção mais vantajosa.",
        },
        sharedBenefits.acompanhamento,
        {
          title: "Atuação administrativa e judicial",
          description:
            "Acompanhamos o processo do requerimento inicial até eventuais recursos.",
        },
      ],
    },
    cases: {
      title: "Casos que atendemos",
      items: [
        "Aposentadorias por idade, tempo de contribuição e especial",
        "Benefício de incapacidade temporária (auxílio-doença)",
        "Aposentadoria por incapacidade permanente",
        "Pensão por morte e auxílio-reclusão",
        "Revisão de benefícios (Vida Toda, Buraco Negro, etc.)",
        "Inclusão de tempo rural e períodos especiais",
        "Recursos contra indeferimento do INSS",
      ],
    },
    faq: [
      {
        question: "O INSS negou meu benefício. O que fazer?",
        answer:
          "É possível entrar com recurso administrativo em até 30 dias. Se mantido o indeferimento, podemos ingressar com ação judicial. Reunimos a documentação necessária e conduzimos todo o processo.",
      },
      {
        question: "Posso me aposentar antes dos 65 anos?",
        answer:
          "Depende do seu tempo de contribuição, idade e enquadramento nas regras de transição da Reforma de 2019. Fazemos simulação completa para identificar a melhor data.",
      },
      {
        question: "Trabalhei no campo. Esse tempo conta?",
        answer:
          "Sim. O tempo de trabalho rural pode ser computado com documentação adequada (ITR, notas fiscais, declarações de sindicato, etc.). Analisamos seu caso individualmente.",
      },
    ],
    cta: {
      title: "Dúvidas sobre aposentadoria ou benefício?",
      description:
        "Faça uma análise gratuita do seu histórico previdenciário com nossos especialistas.",
    },
  }),

  familia: area({
    slug: "familia",
    title: "Direito de Família",
    shortTitle: "Família",
    icon: Users,
    metaDescription:
      "Advogados de Família em São Paulo. Divórcio, guarda, pensão alimentícia, inventário, união estável e mediação familiar.",
    banner: {
      overline: "Área de Atuação",
      title: "Direito de Família e Sucessões",
      subtitle:
        "Conduzimos questões familiares com sensibilidade, discrição e firmeza técnica, buscando soluções justas e duradouras.",
    },
    description: {
      title: "Acompanhamento humanizado em momentos delicados",
      paragraphs: [
        "Questões familiares envolvem não apenas aspectos jurídicos, mas emoções e relações pessoais profundas. Nossa abordagem combina expertise técnica com comunicação clara e respeitosa.",
        "Atuamos em divórcios consensuais e litigiosos, partilha de bens, guarda e visitação, pensão alimentícia, reconhecimento e dissolução de união estável, além de inventários e planejamento sucessório.",
        "Sempre que possível, priorizamos a mediação e soluções consensuais. Quando necessário, defendemos seus interesses com vigor em juízo.",
      ],
    },
    benefits: {
      title: "Como conduzimos casos de família",
      items: [
        {
          title: "Sigilo e discrição",
          description:
            "Tratamos cada caso com absoluta confidencialidade e respeito à privacidade.",
        },
        {
          title: "Mediação familiar",
          description:
            "Buscamos acordos que preservem relações, especialmente quando há filhos envolvidos.",
        },
        sharedBenefits.estrategia,
        {
          title: "Atuação multidisciplinar",
          description:
            "Parceria com psicólogos e assistentes sociais quando necessário.",
        },
      ],
    },
    cases: {
      title: "Casos que atendemos",
      items: [
        "Divórcio consensual e litigioso",
        "Guarda compartilhada e unilateral",
        "Pensão alimentícia (fixação, revisão e execução)",
        "Partilha de bens e união estável",
        "Inventário judicial e extrajudicial",
        "Reconhecimento e negatória de paternidade",
        "Planejamento sucessório e testamentos",
      ],
    },
    faq: [
      {
        question: "Preciso de advogado para divórcio consensual?",
        answer:
          "Sim. Mesmo em casos amigáveis, a assistência de advogado é obrigatória. Conduzimos todo o processo de forma rápida e com custos reduzidos.",
      },
      {
        question: "Como é definida a guarda dos filhos?",
        answer:
          "A guarda compartilhada é a regra. O juiz avalia o melhor interesse da criança, considerando vínculos, capacidade dos pais e desejos do menor (se maduro suficiente).",
      },
      {
        question: "Posso alterar o valor da pensão alimentícia?",
        answer:
          "Sim, mediante ação de revisão quando houver mudança na capacidade financeira do alimentante ou nas necessidades do alimentado.",
      },
    ],
    cta: {
      title: "Precisa de orientação familiar?",
      description:
        "Agende uma consulta reservada. Estamos prontos para ouvir e orientar com empatia.",
    },
  }),

  consumidor: area({
    slug: "consumidor",
    title: "Direito do Consumidor",
    shortTitle: "Consumidor",
    icon: ShoppingCart,
    metaDescription:
      "Defesa do consumidor. Cobranças indevidas, produtos defeituosos, negativação, contratos abusivos e indenizações.",
    banner: {
      overline: "Área de Atuação",
      title: "Direito do Consumidor",
      subtitle:
        "Defendemos seus direitos contra práticas abusivas, cobranças indevidas e falhas na prestação de serviços.",
    },
    description: {
      title: "Seus direitos como consumidor protegidos",
      paragraphs: [
        "O Código de Defesa do Consumidor garante proteção contra práticas abusivas, publicidade enganosa, produtos defeituosos e serviços mal prestados. Mesmo assim, milhões de consumidores têm seus direitos violados diariamente.",
        "Atuamos em demandas contra bancos, operadoras de telefonia, planos de saúde, e-commerce, construtoras, seguradoras e demais fornecedores, buscando reparação integral dos danos.",
        "Priorizamos soluções rápidas via Procon e mediação. Quando necessário, ingressamos com ações judiciais para garantir indenização e cessação das práticas abusivas.",
      ],
    },
    benefits: {
      title: "Vantagens da nossa atuação",
      items: [
        {
          title: "Honorários acessíveis",
          description:
            "Muitas demandas consumeristas permitem honorários por êxito, reduzindo o risco financeiro.",
        },
        {
          title: "Agilidade processual",
          description:
            "Juizados Especiais Cíveis permitem resolução em meses, não anos.",
        },
        sharedBenefits.estrategia,
        {
          title: "Atuação em massa",
          description:
            "Experiência em ações coletivas contra grandes fornecedores.",
        },
      ],
    },
    cases: {
      title: "Casos que atendemos",
      items: [
        "Cobranças e negativação indevida (SPC/Serasa)",
        "Produtos com defeito e vícios ocultos",
        "Cancelamento de contratos e restituição de valores",
        "Práticas abusivas de bancos e financeiras",
        "Problemas com planos de saúde e negativa de cobertura",
        "Atraso e abandono de obra por construtoras",
        "Publicidade enganosa e propaganda falsa",
      ],
    },
    faq: [
      {
        question: "Fui negativado indevidamente. Como proceder?",
        answer:
          "Você pode exigir a exclusão do registro e indenização por danos morais. Providenciamos notificação extrajudicial e, se necessário, ação judicial com pedido de tutela de urgência.",
      },
      {
        question: "Posso cancelar um contrato e pedir devolução do dinheiro?",
        answer:
          "Em muitos casos, sim, especialmente em compras online (arrependimento em 7 dias) ou quando há descumprimento contratual pelo fornecedor.",
      },
      {
        question: "Vale a pena ir ao Juizado Especial?",
        answer:
          "Para causas até 40 salários mínimos (ou 20 sem advogado), o JEC é rápido e gratuito. Avaliamos a melhor estratégia para seu caso.",
      },
    ],
    cta: {
      title: "Teve seus direitos violados?",
      description:
        "Conte-nos o que aconteceu. A primeira análise é gratuita e sem compromisso.",
    },
  }),

  empresarial: area({
    slug: "empresarial",
    title: "Direito Empresarial",
    shortTitle: "Empresarial",
    icon: Building2,
    metaDescription:
      "Consultoria empresarial e societária. Contratos, fusões, compliance, governança corporativa e recuperação judicial.",
    banner: {
      overline: "Área de Atuação",
      title: "Direito Empresarial",
      subtitle:
        "Assessoria jurídica estratégica para empresas, da constituição à reestruturação, com foco em segurança e crescimento sustentável.",
    },
    description: {
      title: "Parceiro jurídico do seu negócio",
      paragraphs: [
        "Empresas de todos os portes enfrentam desafios jurídicos complexos: contratos, relações societárias, compliance regulatório, propriedade intelectual e litígios comerciais.",
        "Nossa equipe empresarial atua de forma preventiva e contenciosa, estruturando operações, negociando contratos nacionais e internacionais, conduzindo due diligence e representando empresas em disputas comerciais.",
        "Oferecemos consultoria mensal para PMEs e projetos sob demanda para operações específicas como fusões, aquisições e reestruturações societárias.",
      ],
    },
    benefits: {
      title: "Por que empresas nos escolhem",
      items: [
        sharedBenefits.consultoria,
        {
          title: "Contratos blindados",
          description:
            "Elaboração e revisão de contratos com cláusulas que protegem seus interesses.",
        },
        {
          title: "Governança corporativa",
          description:
            "Adequação a normas, acordos de sócios e políticas internas de compliance.",
        },
        {
          title: "Suporte em M&A",
          description:
            "Due diligence, estruturação e negociação em fusões e aquisições.",
        },
      ],
    },
    cases: {
      title: "Casos que atendemos",
      items: [
        "Constituição e alteração de contratos sociais",
        "Acordos de sócios e governança corporativa",
        "Contratos comerciais nacionais e internacionais",
        "Fusões, aquisições e reestruturações",
        "Recuperação judicial e extrajudicial",
        "Propriedade intelectual e proteção de marcas",
        "Disputas societárias e exclusão de sócios",
      ],
    },
    faq: [
      {
        question: "Minha startup precisa de assessoria jurídica desde o início?",
        answer:
          "Sim. Contratos sociais bem estruturados, acordos de sócios e proteção de PI desde o início evitam conflitos custosos no futuro.",
      },
      {
        question: "O que é due diligence e quando é necessária?",
        answer:
          "É uma auditoria jurídica completa de uma empresa, essencial em investimentos, aquisições e parcerias para identificar riscos e passivos ocultos.",
      },
      {
        question: "Oferecem consultoria mensal para PMEs?",
        answer:
          "Sim. Temos planos de assessoria jurídica mensal com horas inclusas para consultas, revisão de contratos e suporte contínuo.",
      },
    ],
    cta: {
      title: "Quer proteger e estruturar seu negócio?",
      description:
        "Agende uma reunião com nossa equipe empresarial e receba diagnóstico jurídico personalizado.",
    },
  }),

  imobiliario: area({
    slug: "imobiliario",
    title: "Direito Imobiliário",
    shortTitle: "Imobiliário",
    icon: Home,
    metaDescription:
      "Direito Imobiliário. Compra e venda, locação, usucapião, condomínio, incorporação e regularização fundiária.",
    banner: {
      overline: "Área de Atuação",
      title: "Direito Imobiliário",
      subtitle:
        "Segurança jurídica em transações imobiliárias, litígios possessórios, condomínios e regularização de imóveis.",
    },
    description: {
      title: "Tranquilidade nas suas operações imobiliárias",
      paragraphs: [
        "O mercado imobiliário envolve valores significativos e riscos jurídicos que podem comprometer investimentos. Documentação irregular, ônus ocultos e contratos mal elaborados são armadilhas comuns.",
        "Nossa equipe imobiliária conduz due diligence completa, elabora e revisa contratos de compra e venda, locação e permuta, além de atuar em ações de despejo, usucapião, divisão e demarcação.",
        "Assessoramos incorporadoras, condomínios, locadores e adquirentes com visão técnica e comercial para proteger patrimônio e viabilizar negócios.",
      ],
    },
    benefits: {
      title: "Segurança em cada transação",
      items: [
        {
          title: "Due diligence imobiliária",
          description:
            "Verificação de matrícula, ônus, débitos e conformidade documental antes da compra.",
        },
        {
          title: "Contratos à prova de riscos",
          description:
            "Cláusulas que protegem compradores, vendedores e locadores em todas as etapas.",
        },
        sharedBenefits.acompanhamento,
        {
          title: "Regularização fundiária",
          description:
            "Atuação em usucapião, retificação de área e desmembramento de lotes.",
        },
      ],
    },
    cases: {
      title: "Casos que atendemos",
      items: [
        "Compra e venda de imóveis residenciais e comerciais",
        "Contratos de locação e despejo",
        "Usucapião urbana e rural",
        "Condomínios e assembleias",
        "Incorporação imobiliária e loteamentos",
        "Ações possessórias (reintegração, manutenção, interdito)",
        "Regularização e retificação de matrícula",
      ],
    },
    faq: [
      {
        question: "Devo contratar advogado para comprar um imóvel?",
        answer:
          "É altamente recomendável. Analisamos a documentação, identificamos riscos e acompanhamos a escritura e registro para garantir segurança total na transação.",
      },
      {
        question: "O que é usucapião e quem pode requerer?",
        answer:
          "É um modo de adquirir propriedade pelo uso prolongado. Os requisitos variam (5 a 15 anos dependendo do tipo). Avaliamos se seu caso preenche as condições legais.",
      },
      {
        question: "Inquilino não paga aluguel. Como proceder?",
        answer:
          "Após notificação, podemos ingressar com ação de despejo por falta de pagamento. Em muitos casos, a liminar de desocupação é concedida rapidamente.",
      },
    ],
    cta: {
      title: "Vai comprar, vender ou alugar um imóvel?",
      description:
        "Garanta segurança jurídica na sua transação. Agende uma consulta com nossa equipe imobiliária.",
    },
  }),

  tributario: area({
    slug: "tributario",
    title: "Direito Tributário",
    shortTitle: "Tributário",
    icon: Landmark,
    metaDescription:
      "Direito Tributário. Planejamento fiscal, defesas administrativas, execuções fiscais e recuperação de créditos.",
    banner: {
      overline: "Área de Atuação",
      title: "Direito Tributário",
      subtitle:
        "Planejamento fiscal inteligente, defesa em autuações e recuperação de tributos pagos indevidamente.",
    },
    description: {
      title: "Eficiência fiscal com segurança jurídica",
      paragraphs: [
        "A carga tributária brasileira é uma das maiores do mundo, e a complexidade legislativa gera riscos constantes para empresas e pessoas físicas. Autuações, execuções fiscais e questionamentos sobre enquadramento são realidades do dia a dia.",
        "Nossa equipe tributária atua em planejamento fiscal lícito, defesas administrativas e judiciais contra autuações, recuperação de créditos tributários e negociação de débitos via transação tributária.",
        "Combinamos profundo conhecimento técnico com visão estratégica para reduzir carga fiscal de forma legal e sustentável.",
      ],
    },
    benefits: {
      title: "Estratégia tributária que gera resultados",
      items: [
        {
          title: "Planejamento fiscal",
          description:
            "Estruturação de operações para eficiência tributária dentro da legalidade.",
        },
        {
          title: "Defesa em autuações",
          description:
            "Impugnações administrativas e judiciais com argumentação técnica sólida.",
        },
        {
          title: "Recuperação de créditos",
          description:
            "Identificação e restituição de tributos pagos indevidamente ou a maior.",
        },
        {
          title: "Transação tributária",
          description:
            "Negociação de débitos com descontos significativos junto à PGFN.",
        },
      ],
    },
    cases: {
      title: "Casos que atendemos",
      items: [
        "Planejamento tributário empresarial",
        "Defesa em autuações da Receita Federal e estadual",
        "Execuções fiscais e embargos",
        "Recuperação de PIS, COFINS, ICMS e ISS",
        "Transação tributária e parcelamentos",
        "Consultoria em reforma tributária",
        "Mandados de segurança contra atos fiscais ilegais",
      ],
    },
    faq: [
      {
        question: "Recebi uma autuação fiscal. Qual o prazo para defesa?",
        answer:
          "O prazo varia conforme o tributo e o tipo de autuação, geralmente entre 15 e 30 dias. É fundamental agir rapidamente para preservar direitos de defesa.",
      },
      {
        question: "É possível recuperar tributos pagos a mais?",
        answer:
          "Sim. Mediante análise técnica, é possível pleitear restituição ou compensação de tributos pagos indevidamente nos últimos 5 anos.",
      },
      {
        question: "O que é transação tributária?",
        answer:
          "É um programa do governo que permite quitar débitos tributários com descontos de até 70% em juros e multas. Avaliamos se seu caso se enquadra.",
      },
    ],
    cta: {
      title: "Questões fiscais preocupam sua empresa?",
      description:
        "Agende diagnóstico tributário e descubra oportunidades de economia legal.",
    },
  }),

  criminal: area({
    slug: "criminal",
    title: "Direito Criminal",
    shortTitle: "Criminal",
    icon: Gavel,
    metaDescription:
      "Defesa criminal especializada. Inquéritos, tribunais do júri, habeas corpus, recursos e defesa empresarial penal.",
    banner: {
      overline: "Área de Atuação",
      title: "Direito Criminal",
      subtitle:
        "Defesa técnica e estratégica em todas as fases, do inquérito policial ao Supremo Tribunal Federal.",
    },
    description: {
      title: "Defesa criminal com rigor e dedicação",
      paragraphs: [
        "Enfrentar o sistema criminal é uma das experiências mais desgastantes que um cidadão pode vivenciar. A escolha do advogado criminalista é decisiva para o resultado do caso e para a preservação de direitos fundamentais.",
        "Nossa equipe criminal atua em inquéritos policiais, audiências de custódia, defesa pré-processual, tribunais do júri, recursos em todas as instâncias e habeas corpus com urgência.",
        "Também oferecemos consultoria em compliance penal empresarial e defesa de pessoas jurídicas em crimes ambientais, financeiros e contra a ordem tributária.",
      ],
    },
    benefits: {
      title: "Nossa atuação criminal",
      items: [
        {
          title: "Disponibilidade 24h",
          description:
            "Plantão para flagrantes, audiências de custódia e habeas corpus urgentes.",
        },
        {
          title: "Experiência em júri",
          description:
            "Atuação estratégica em plenário com preparação meticulosa de teses defensivas.",
        },
        sharedBenefits.estrategia,
        {
          title: "Defesa empresarial penal",
          description:
            "Compliance penal e defesa de empresas em crimes econômicos e ambientais.",
        },
      ],
    },
    cases: {
      title: "Casos que atendemos",
      items: [
        "Inquéritos policiais e defesa pré-processual",
        "Audiência de custódia e liberdade provisória",
        "Tribunal do Júri",
        "Habeas corpus e mandados de segurança criminal",
        "Crimes financeiros e contra a ordem tributária",
        "Crimes ambientais e de colarinho branco",
        "Recursos para Tribunais Superiores",
      ],
    },
    faq: [
      {
        question: "Fui convocado para depor na delegacia. Devo ir sem advogado?",
        answer:
          "Nunca. O direito ao silêncio e à assistência de advogado é constitucional. Acompanhamos depoimentos para garantir que seus direitos sejam respeitados.",
      },
      {
        question: "O que é habeas corpus e quando pode ser impetrado?",
        answer:
          "É uma ação que protege a liberdade de locomoção contra ilegalidade ou abuso de poder. Pode ser impetrado a qualquer momento quando há constrangimento ilegal.",
      },
      {
        question: "Quanto tempo dura um processo criminal?",
        answer:
          "Varia enormemente. Casos simples podem levar meses; júris e recursos podem estender por anos. Definimos estratégia com expectativas realistas desde a consulta inicial.",
      },
    ],
    cta: {
      title: "Precisa de defesa criminal urgente?",
      description:
        "Nossa equipe está disponível 24 horas. Entre em contato agora para assistência imediata.",
    },
  }),
};
