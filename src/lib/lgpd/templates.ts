import type { LegalDocumentType } from "@prisma/client";

interface DocumentTemplate {
  title: string;
  summary: string;
  content: string;
}

const OFFICE_NAME = "Almeida & Associados";

export const LEGAL_DOCUMENT_TEMPLATES: Record<LegalDocumentType, DocumentTemplate> = {
  PRIVACY_POLICY: {
    title: "Política de Privacidade",
    summary:
      "Como coletamos, utilizamos, armazenamos e protegemos seus dados pessoais em conformidade com a LGPD.",
    content: `## 1. Controlador dos dados

O controlador dos dados pessoais tratados nesta plataforma é **${OFFICE_NAME}**, responsável pelas decisões referentes ao tratamento de dados pessoais dos titulares.

## 2. Dados coletados

Podemos coletar e tratar as seguintes categorias de dados:

- **Identificação:** nome, CPF/CNPJ, e-mail, telefone, endereço
- **Navegação:** endereço IP, cookies, páginas visitadas, data e hora de acesso
- **Atendimento jurídico:** informações sobre seu caso, documentos enviados, mensagens e histórico processual
- **Financeiro:** dados de contratos, parcelas e pagamentos vinculados ao atendimento

## 3. Finalidades do tratamento

Utilizamos seus dados para:

- Prestação de serviços jurídicos e comunicação com clientes
- Triagem e qualificação de demandas
- Gestão de processos, documentos e agenda
- Cumprimento de obrigações legais e regulatórias
- Melhoria da experiência na plataforma

## 4. Bases legais (LGPD)

O tratamento fundamenta-se nas bases legais previstas no art. 7º da Lei nº 13.709/2018, incluindo consentimento, execução de contrato, cumprimento de obrigação legal, exercício regular de direitos e legítimo interesse.

## 5. Compartilhamento

Seus dados podem ser compartilhados com prestadores de serviços essenciais (hospedagem, e-mail, armazenamento em nuvem), sempre mediante contratos que garantam proteção adequada. Não vendemos dados pessoais.

## 6. Retenção e segurança

Adotamos medidas técnicas e administrativas para proteger os dados contra acessos não autorizados. Os dados são mantidos pelo tempo necessário às finalidades descritas ou conforme exigência legal.

## 7. Direitos do titular

Você pode solicitar:

- Confirmação e acesso aos dados
- Correção de dados incompletos ou desatualizados
- Anonimização, bloqueio ou eliminação
- Portabilidade, quando aplicável
- Revogação do consentimento

## 8. Encarregado (DPO)

Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato pelo e-mail **privacidade@almeidaassociados.com.br**.

## 9. Alterações

Esta política pode ser atualizada. A versão vigente estará sempre disponível nesta página, com registro da data de publicação.`,
  },
  TERMS_OF_USE: {
    title: "Termos de Uso",
    summary:
      "Condições gerais para utilização do site, triagem jurídica, portal do cliente e sistemas digitais do escritório.",
    content: `## 1. Aceitação

Ao acessar ou utilizar os serviços digitais de **${OFFICE_NAME}**, você declara ter lido e concordado com estes Termos de Uso e com a Política de Privacidade.

## 2. Serviços oferecidos

A plataforma disponibiliza:

- Informações institucionais e conteúdo jurídico
- Formulários de contato e triagem jurídica online
- Área exclusiva do cliente (portal)
- Ferramentas internas de gestão para a equipe do escritório

## 3. Uso adequado

O usuário compromete-se a:

- Fornecer informações verdadeiras e atualizadas
- Não utilizar a plataforma para fins ilícitos
- Não tentar acessar áreas restritas sem autorização
- Respeitar direitos de propriedade intelectual do escritório

## 4. Triagem e contato

A triagem jurídica e os formulários de contato **não constituem contratação automática** de serviços advocatícios nem garantia de aceitação do caso. A análise definitiva depende de avaliação profissional.

## 5. Portal do cliente

O acesso ao portal é pessoal e intransferível. O titular é responsável pela confidencialidade de suas credenciais e pelas informações enviadas pela plataforma.

## 6. Propriedade intelectual

Textos, marcas, layout e demais conteúdos são de titularidade do escritório ou licenciados, sendo vedada reprodução sem autorização.

## 7. Limitação de responsabilidade

O escritório não se responsabiliza por indisponibilidades temporárias, falhas de terceiros ou uso indevido da plataforma pelo usuário, dentro dos limites da legislação aplicável.

## 8. Alterações e vigência

Estes termos podem ser atualizados a qualquer momento. O uso continuado após publicação de nova versão implica concordância com os termos revisados.

## 9. Foro

Fica eleito o foro da comarca de São Paulo/SP para dirimir controvérsias, com renúncia a qualquer outro, salvo disposição legal em contrário.`,
  },
};
