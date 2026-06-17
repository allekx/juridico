/** Textos padronizados para interface e comunicação institucional. */
export const EMPTY_VALUE = "Não informado";

export const TITLE_SEP = " | ";

export function pageTitle(section: string, context?: string) {
  return context ? `${section}${TITLE_SEP}${context}` : section;
}
