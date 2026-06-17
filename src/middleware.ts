import { type NextRequest, NextResponse } from "next/server";
import { DEFAULT_REDIRECT } from "@/constants/roles";
import {
  canAccessRoute,
  isAuthRoute,
  isProtectedRoute,
  isPublicRoute,
} from "@/lib/auth/routes";
import { extractRoleFromUser } from "@/lib/auth/roles";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user } = await updateSession(request);

  const isAuthenticated = !!user;
  const role = user ? extractRoleFromUser(user) : null;

  // Rotas de autenticação | redireciona se já logado
  if (isAuthRoute(pathname)) {
    if (isAuthenticated && role) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = DEFAULT_REDIRECT[role];
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  // Rotas públicas | acesso livre
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  // Rotas protegidas | exige autenticação
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = pathname.startsWith("/portal")
        ? "/portal/acesso"
        : "/login";
      if (!pathname.startsWith("/portal")) {
        redirectUrl.searchParams.set("redirect", pathname);
      }
      return NextResponse.redirect(redirectUrl);
    }

    if (!role) {
      // Sessão válida sem role no JWT | servidor valida pelo banco
      return supabaseResponse;
    }

    if (!canAccessRoute(pathname, role)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = DEFAULT_REDIRECT[role];
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
