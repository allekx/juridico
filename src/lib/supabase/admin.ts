import { createClient } from "@supabase/supabase-js";
import type { UserRole } from "@prisma/client";
import { getSupabaseUrl } from "@/lib/supabase/env";

export function getSupabaseServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    ""
  );
}

export function createAdminClient() {
  const serviceKey = getSupabaseServiceKey();
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
  }

  return createClient(getSupabaseUrl(), serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function syncUserRoleMetadata(
  userId: string,
  role: UserRole,
  officeId: string
): Promise<void> {
  try {
    const admin = createAdminClient();

    const { error } = await admin.auth.admin.updateUserById(userId, {
      app_metadata: { role, office_id: officeId },
    });

    if (error) {
      console.error("[auth] Falha ao sincronizar app_metadata:", error.message);
    }
  } catch (error) {
    console.error("[auth] syncUserRoleMetadata:", error);
  }
}
