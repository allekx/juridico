import type { AuditAction } from "@prisma/client";

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  LOGIN: "Login",
  LOGIN_FAILED: "Falha de login",
  LOGOUT: "Logout",
  CREATE: "Criação",
  UPDATE: "Alteração",
  DELETE: "Exclusão",
  UPLOAD: "Upload",
};

export const AUDIT_ENTITY_LABELS: Record<string, string> = {
  user: "Usuário",
  document: "Documento",
  contract: "Contrato",
  task: "Tarefa",
  appointment: "Compromisso",
  lead: "Lead",
  case: "Processo",
  payment: "Pagamento",
  installment: "Parcela",
  blog_post: "Artigo do blog",
  session: "Sessão",
};

export const AUDIT_PER_PAGE = 25;
