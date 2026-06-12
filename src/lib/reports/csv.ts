import type {
  CaseReportRow,
  ClientReportRow,
  FinancialReportRow,
  LawyerReportRow,
  LeadConversionRow,
  ReportType,
} from "@/types/reports";

function escapeCell(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

export function clientsToCsv(rows: ClientReportRow[]): string {
  return toCsv(
    [
      "Nome",
      "Tipo",
      "CPF/CNPJ",
      "E-mail",
      "Telefone",
      "Cidade",
      "UF",
      "Advogado",
      "Casos",
      "Status",
      "Cadastro",
    ],
    rows.map((r) => [
      r.name,
      r.type,
      r.cpfCnpj,
      r.email,
      r.phone,
      r.city,
      r.state,
      r.lawyerName,
      r.casesCount,
      r.isActive,
      r.createdAt,
    ])
  );
}

export function casesToCsv(rows: CaseReportRow[]): string {
  return toCsv(
    [
      "Título",
      "Número",
      "Tipo",
      "Cliente",
      "Advogado",
      "Status",
      "Prioridade",
      "Tribunal",
      "Abertura",
      "Encerramento",
    ],
    rows.map((r) => [
      r.title,
      r.caseNumber,
      r.caseType,
      r.clientName,
      r.lawyerName,
      r.statusName,
      r.priority,
      r.court,
      r.openedAt,
      r.closedAt,
    ])
  );
}

export function lawyersToCsv(rows: LawyerReportRow[]): string {
  return toCsv(
    [
      "Nome",
      "OAB",
      "Especialidade",
      "Sócio",
      "Clientes",
      "Casos ativos",
      "Casos total",
      "Tarefas pendentes",
      "Receita (R$)",
    ],
    rows.map((r) => [
      r.name,
      r.oab,
      r.specialty,
      r.isPartner,
      r.clientsCount,
      r.activeCases,
      r.totalCases,
      r.pendingTasks,
      r.receiptsTotal.toFixed(2),
    ])
  );
}

export function financialToCsv(rows: FinancialReportRow[]): string {
  return toCsv(
    [
      "Tipo",
      "Cliente",
      "Descrição",
      "Valor (R$)",
      "Status",
      "Forma",
      "Vencimento",
      "Pagamento",
      "Nota fiscal",
    ],
    rows.map((r) => [
      r.direction,
      r.clientName,
      r.description,
      r.amount.toFixed(2),
      r.status,
      r.method,
      r.dueDate,
      r.paidAt,
      r.invoiceNumber,
    ])
  );
}

export function leadsToCsv(rows: LeadConversionRow[]): string {
  return toCsv(
    [
      "Nome",
      "E-mail",
      "Telefone",
      "Origem",
      "Status",
      "Área de interesse",
      "Responsável",
      "Cliente convertido",
      "Criado em",
      "Convertido em",
      "Dias até conversão",
    ],
    rows.map((r) => [
      r.name,
      r.email,
      r.phone,
      r.source,
      r.status,
      r.interestArea,
      r.assignedToName,
      r.convertedClientName,
      r.createdAt,
      r.convertedAt,
      r.daysToConvert,
    ])
  );
}

export function reportToCsv(type: ReportType, rows: unknown[]): string {
  switch (type) {
    case "clientes":
      return clientsToCsv(rows as ClientReportRow[]);
    case "casos":
      return casesToCsv(rows as CaseReportRow[]);
    case "advogados":
      return lawyersToCsv(rows as LawyerReportRow[]);
    case "financeiro":
      return financialToCsv(rows as FinancialReportRow[]);
    case "leads":
      return leadsToCsv(rows as LeadConversionRow[]);
  }
}
