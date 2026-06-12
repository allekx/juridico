"use server";

import { redirect } from "next/navigation";
import { logLogout } from "@/lib/audit/service";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/auth";

export async function logoutAction(): Promise<ActionResult> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (user) {
    await logLogout(user);
  }

  if (error) {
    return {
      success: false,
      error: "Erro ao encerrar sessão",
    };
  }

  redirect("/login");
}
