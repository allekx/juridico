import type { TriageQuestionsMap } from "@/types/triage";

const yesNo = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

export const TRIAGE_QUESTIONS: TriageQuestionsMap = {
  trabalhista: [
    {
      key: "situacao",
      label: "Qual é a sua situação?",
      type: "radio",
      required: true,
      options: [
        { value: "empregado", label: "Sou empregado(a)" },
        { value: "empregador", label: "Sou empregador(a)" },
        { value: "ex-empregado", label: "Fui demitido(a)" },
      ],
    },
    {
      key: "tipo_demanda",
      label: "Tipo de demanda",
      type: "select",
      required: true,
      options: [
        { value: "rescisao", label: "Rescisão / verbas rescisórias" },
        { value: "assedio", label: "Assédio moral ou sexual" },
        { value: "acidente", label: "Acidente de trabalho" },
        { value: "horas_extras", label: "Horas extras / adicionais" },
        { value: "consultoria_empresa", label: "Consultoria para empresa" },
        { value: "outro", label: "Outro" },
      ],
    },
    {
      key: "empresa_nome",
      label: "Nome da empresa (se aplicável)",
      type: "text",
      placeholder: "Razão social ou nome fantasia",
    },
    {
      key: "urgente",
      label: "Há prazo ou audiência nos próximos 15 dias?",
      type: "radio",
      required: true,
      options: yesNo,
    },
    {
      key: "detalhes",
      label: "Descreva brevemente o que aconteceu",
      type: "textarea",
      required: true,
      placeholder: "Conte os fatos principais...",
    },
  ],

  previdenciario: [
    {
      key: "tipo_beneficio",
      label: "Qual benefício você busca?",
      type: "select",
      required: true,
      options: [
        { value: "aposentadoria", label: "Aposentadoria" },
        { value: "auxilio_doenca", label: "Auxílio-doença" },
        { value: "bpc_loas", label: "BPC/LOAS" },
        { value: "pensao", label: "Pensão por morte" },
        { value: "revisao", label: "Revisão de benefício" },
        { value: "outro", label: "Outro" },
      ],
    },
    {
      key: "contribuicao_anos",
      label: "Há quantos anos você contribui?",
      type: "select",
      required: true,
      options: [
        { value: "menos_5", label: "Menos de 5 anos" },
        { value: "5_15", label: "Entre 5 e 15 anos" },
        { value: "15_30", label: "Entre 15 e 30 anos" },
        { value: "mais_30", label: "Mais de 30 anos" },
      ],
    },
    {
      key: "indeferido_inss",
      label: "O INSS já negou seu pedido?",
      type: "radio",
      required: true,
      options: yesNo,
    },
    {
      key: "trabalho_rural",
      label: "Já trabalhou no campo ou como autônomo?",
      type: "radio",
      required: true,
      options: yesNo,
    },
    {
      key: "detalhes",
      label: "Detalhes adicionais",
      type: "textarea",
      placeholder: "Informe número do benefício, datas, etc.",
    },
  ],

  familia: [
    {
      key: "tipo_demanda",
      label: "O que você precisa resolver?",
      type: "select",
      required: true,
      options: [
        { value: "divorcio", label: "Divórcio" },
        { value: "guarda", label: "Guarda de filhos" },
        { value: "pensao", label: "Pensão alimentícia" },
        { value: "inventario", label: "Inventário / herança" },
        { value: "uniao_estavel", label: "União estável" },
        { value: "outro", label: "Outro" },
      ],
    },
    {
      key: "possui_filhos",
      label: "Há filhos menores envolvidos?",
      type: "radio",
      required: true,
      options: yesNo,
    },
    {
      key: "consensual",
      label: "Há acordo entre as partes?",
      type: "radio",
      required: true,
      options: [
        { value: "sim", label: "Sim, consensual" },
        { value: "parcial", label: "Parcialmente" },
        { value: "nao", label: "Não, litigioso" },
      ],
    },
    {
      key: "bens",
      label: "Existem bens a partilhar?",
      type: "radio",
      required: true,
      options: yesNo,
    },
    {
      key: "detalhes",
      label: "Conte mais sobre sua situação",
      type: "textarea",
      required: true,
    },
  ],

  consumidor: [
    {
      key: "tipo_fornecedor",
      label: "Contra quem é a reclamação?",
      type: "select",
      required: true,
      options: [
        { value: "banco", label: "Banco / financeira" },
        { value: "telefonia", label: "Telefonia / internet" },
        { value: "plano_saude", label: "Plano de saúde" },
        { value: "ecommerce", label: "Loja online" },
        { value: "construtora", label: "Construtora" },
        { value: "outro", label: "Outro" },
      ],
    },
    {
      key: "tipo_problema",
      label: "Qual o problema?",
      type: "select",
      required: true,
      options: [
        { value: "cobranca_indevida", label: "Cobrança indevida" },
        { value: "produto_defeito", label: "Produto com defeito" },
        { value: "servico_nao_prestado", label: "Serviço não prestado" },
        { value: "cancelamento", label: "Cancelamento / arrependimento" },
        { value: "negativacao", label: "Negativação indevida" },
        { value: "outro", label: "Outro" },
      ],
    },
    {
      key: "valor_envolvido",
      label: "Valor aproximado envolvido (R$)",
      type: "text",
      placeholder: "Ex: 5.000,00",
    },
    {
      key: "procurou_procon",
      label: "Já registrou reclamação no Procon?",
      type: "radio",
      required: true,
      options: yesNo,
    },
    {
      key: "detalhes",
      label: "Descreva o ocorrido",
      type: "textarea",
      required: true,
    },
  ],

  empresarial: [
    {
      key: "porte_empresa",
      label: "Porte da empresa",
      type: "select",
      required: true,
      options: [
        { value: "mei", label: "MEI" },
        { value: "me", label: "ME / EPP" },
        { value: "medio", label: "Médio porte" },
        { value: "grande", label: "Grande porte" },
        { value: "startup", label: "Startup" },
      ],
    },
    {
      key: "tipo_demanda",
      label: "Tipo de demanda",
      type: "select",
      required: true,
      options: [
        { value: "contratos", label: "Contratos" },
        { value: "societario", label: "Questão societária" },
        { value: "compliance", label: "Compliance / LGPD" },
        { value: "recuperacao", label: "Recuperação judicial" },
        { value: "ma", label: "Fusão / aquisição" },
        { value: "consultoria", label: "Consultoria mensal" },
      ],
    },
    {
      key: "faturamento",
      label: "Faturamento anual aproximado",
      type: "select",
      options: [
        { value: "ate_360k", label: "Até R$ 360 mil" },
        { value: "360k_4m", label: "R$ 360 mil a R$ 4 milhões" },
        { value: "4m_50m", label: "R$ 4 a R$ 50 milhões" },
        { value: "acima_50m", label: "Acima de R$ 50 milhões" },
      ],
    },
    {
      key: "urgente",
      label: "Há prazo contratual ou judicial urgente?",
      type: "radio",
      required: true,
      options: yesNo,
    },
    {
      key: "detalhes",
      label: "Descreva a necessidade do escritório",
      type: "textarea",
      required: true,
    },
  ],

  imobiliario: [
    {
      key: "tipo_operacao",
      label: "Tipo de operação",
      type: "select",
      required: true,
      options: [
        { value: "compra", label: "Compra de imóvel" },
        { value: "venda", label: "Venda de imóvel" },
        { value: "locacao", label: "Locação" },
        { value: "usucapiao", label: "Usucapião" },
        { value: "condominio", label: "Condomínio" },
        { value: "litigio", label: "Litígio possessório" },
      ],
    },
    {
      key: "tipo_imovel",
      label: "Tipo de imóvel",
      type: "select",
      required: true,
      options: [
        { value: "residencial", label: "Residencial" },
        { value: "comercial", label: "Comercial" },
        { value: "terreno", label: "Terreno" },
        { value: "rural", label: "Rural" },
      ],
    },
    {
      key: "valor_imovel",
      label: "Valor aproximado do imóvel (R$)",
      type: "text",
      placeholder: "Ex: 500.000,00",
    },
    {
      key: "documentacao_regular",
      label: "A documentação está regular?",
      type: "radio",
      required: true,
      options: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" },
        { value: "nao_sei", label: "Não sei" },
      ],
    },
    {
      key: "detalhes",
      label: "Detalhes do caso",
      type: "textarea",
      required: true,
    },
  ],

  tributario: [
    {
      key: "tipo_contribuinte",
      label: "Você é",
      type: "radio",
      required: true,
      options: [
        { value: "pf", label: "Pessoa física" },
        { value: "pj", label: "Pessoa jurídica" },
      ],
    },
    {
      key: "tipo_demanda",
      label: "Tipo de demanda",
      type: "select",
      required: true,
      options: [
        { value: "autuacao", label: "Autuação fiscal" },
        { value: "planejamento", label: "Planejamento tributário" },
        { value: "recuperacao", label: "Recuperação de créditos" },
        { value: "execucao", label: "Execução fiscal" },
        { value: "transacao", label: "Transação tributária" },
      ],
    },
    {
      key: "orgao_fiscal",
      label: "Órgão fiscalizador",
      type: "select",
      options: [
        { value: "receita_federal", label: "Receita Federal" },
        { value: "sefaz", label: "SEFAZ estadual" },
        { value: "prefeitura", label: "Prefeitura (ISS)" },
        { value: "outro", label: "Outro" },
      ],
    },
    {
      key: "valor_debito",
      label: "Valor aproximado do débito (R$)",
      type: "text",
    },
    {
      key: "detalhes",
      label: "Descreva a situação fiscal",
      type: "textarea",
      required: true,
    },
  ],

  criminal: [
    {
      key: "situacao",
      label: "Situação atual",
      type: "select",
      required: true,
      options: [
        { value: "inquérito", label: "Inquérito policial" },
        { value: "processo", label: "Processo em andamento" },
        { value: "flagrante", label: "Acabei de ser detido" },
        { value: "investigacao", label: "Apenas investigação" },
        { value: "preventiva", label: "Consulta preventiva" },
      ],
    },
    {
      key: "tipo_crime",
      label: "Tipo de acusação (se souber)",
      type: "select",
      options: [
        { value: "patrimonial", label: "Crime patrimonial" },
        { value: "trafico", label: "Tráfico / drogas" },
        { value: "violencia", label: "Violência / lesão" },
        { value: "economico", label: "Crime econômico" },
        { value: "transito", label: "Trânsito" },
        { value: "outro", label: "Outro / não sei" },
      ],
    },
    {
      key: "preso",
      label: "Há alguém preso ou custodiado?",
      type: "radio",
      required: true,
      options: yesNo,
    },
    {
      key: "urgente",
      label: "Precisa de atendimento em até 24h?",
      type: "radio",
      required: true,
      options: yesNo,
    },
    {
      key: "detalhes",
      label: "Descreva os fatos (sem se incriminar)",
      type: "textarea",
      required: true,
      hint: "Informações são confidenciais e protegidas por sigilo profissional.",
    },
  ],
};

export const AREA_TO_SPECIALTY: Record<string, string[]> = {
  trabalhista: ["trabalhista", "trabalho", "previdenciário"],
  previdenciario: ["previdenciário", "previdencia", "trabalhista"],
  familia: ["família", "familia", "sucessões"],
  consumidor: ["consumidor", "cível", "civil"],
  empresarial: ["empresarial", "societário", "societario"],
  imobiliario: ["imobiliário", "imobiliario"],
  tributario: ["tributário", "tributario", "fiscal"],
  criminal: ["criminal", "penal"],
};
