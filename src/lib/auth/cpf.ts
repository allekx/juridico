export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "").slice(0, 14);
}

export function formatCpf(value: string): string {
  const digits = normalizeCpf(value);
  if (digits.length !== 11) return value;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function cpfToPortalEmail(cpf: string): string {
  return `${normalizeCpf(cpf)}@portal.client`;
}

export function isValidCpfLength(cpf: string): boolean {
  const digits = normalizeCpf(cpf);
  return digits.length === 11 || digits.length === 14;
}
