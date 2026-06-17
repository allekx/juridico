import type { UserRole } from "@prisma/client";
import {
  ADMIN_ROLES,
  CLIENT_ROLES,
  DASHBOARD_ROLES,
  FINANCIAL_ROLES,
} from "@/constants/roles";

export const PUBLIC_ROUTES = [
  "/",
  "/sobre",
  "/contato",
  "/areas-de-atuacao",
  "/equipe",
  "/blog",
  "/triagem",
  "/triagem/sucesso",
  "/privacidade",
  "/termos",
  "/lgpd/exclusao-dados",
  "/consulta",
];

export const PUBLIC_ROUTE_PREFIXES = ["/areas-de-atuacao/", "/blog/"];

export const AUTH_ROUTES = [
  "/login",
  "/recuperar-senha",
  "/redefinir-senha",
];

export const AUTH_CALLBACK_ROUTE = "/auth/callback";

interface RouteRule {
  pattern: RegExp;
  allowedRoles: UserRole[];
}

export const PROTECTED_ROUTE_RULES: RouteRule[] = [
  {
    pattern: /^\/portal(\/.*)?$/,
    allowedRoles: CLIENT_ROLES,
  },
  {
    pattern: /^\/dashboard\/admin(\/.*)?$/,
    allowedRoles: ADMIN_ROLES,
  },
  {
    pattern: /^\/dashboard\/financeiro(\/.*)?$/,
    allowedRoles: FINANCIAL_ROLES,
  },
  {
    pattern: /^\/dashboard(\/.*)?$/,
    allowedRoles: DASHBOARD_ROLES,
  },
];

export function isPublicRoute(pathname: string): boolean {
  if (AUTH_ROUTES.includes(pathname)) return true;
  if (pathname === AUTH_CALLBACK_ROUTE) return true;
  if (PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_RULES.some((rule) => rule.pattern.test(pathname));
}

export function getRouteAllowedRoles(pathname: string): UserRole[] | null {
  const rule = PROTECTED_ROUTE_RULES.find((r) => r.pattern.test(pathname));
  return rule?.allowedRoles ?? null;
}

export function canAccessRoute(pathname: string, role: UserRole): boolean {
  if (!isProtectedRoute(pathname)) return true;
  const allowedRoles = getRouteAllowedRoles(pathname);
  if (!allowedRoles) return true;
  return allowedRoles.includes(role);
}
