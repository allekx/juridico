import { createClient } from "@supabase/supabase-js";
import type { UserRole } from "@prisma/client";
import { getSupabaseUrl } from "@/lib/supabase/env";

export function createAdminClient() {
  return createClient(
    getSupabaseUrl(),    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function syncUserRoleMetadata(
  userId: string,
  role: UserRole,
  officeId: string
) {
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role, office_id: officeId },
    user_metadata: { role, office_id: officeId },
  });

  if (error) {
    throw new Error(`Falha ao sincronizar perfil: ${error.message}`);
  }
}
