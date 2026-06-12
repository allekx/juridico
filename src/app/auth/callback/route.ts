import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUserRoleMetadata } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma/client";
import { DEFAULT_REDIRECT } from "@/constants/roles";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

function loginRedirect(origin: string, error: string) {
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(error)}`
  );
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = safeRedirectPath(searchParams.get("next") ?? "/", "/");

  if (!code) {
    return loginRedirect(origin, "auth_callback_failed");
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error("[auth/callback] exchangeCodeForSession:", error?.message);
      await supabase.auth.signOut();
      return loginRedirect(origin, "auth_callback_failed");
    }

    let dbUser;
    try {
      dbUser = await prisma.user.findFirst({
        where: {
          id: data.user.id,
          deletedAt: null,
          isActive: true,
        },
      });
    } catch (dbError) {
      console.error("[auth/callback] Prisma:", dbError);
      await supabase.auth.signOut();
      return loginRedirect(origin, "db_unavailable");
    }

    if (!dbUser) {
      await supabase.auth.signOut();
      return loginRedirect(origin, "user_not_registered");
    }

    await syncUserRoleMetadata(dbUser.id, dbUser.role, dbUser.officeId);

    if (type === "recovery") {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}${DEFAULT_REDIRECT[dbUser.role]}`
    );
  } catch (error) {
    console.error("[auth/callback] Erro inesperado:", error);
    return loginRedirect(origin, "auth_callback_failed");
  }
}
