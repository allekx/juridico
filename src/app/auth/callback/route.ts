import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUserRoleMetadata } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma/client";
import { DEFAULT_REDIRECT } from "@/constants/roles";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const dbUser = await prisma.user.findFirst({
        where: {
          id: data.user.id,
          deletedAt: null,
          isActive: true,
        },
      });

      if (dbUser) {
        await syncUserRoleMetadata(
          dbUser.id,
          dbUser.role,
          dbUser.officeId
        );
      }

      if (type === "recovery") {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const redirectPath = dbUser
        ? DEFAULT_REDIRECT[dbUser.role]
        : next;

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
