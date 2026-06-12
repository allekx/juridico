import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();

  if (!url || !key) return false;

  const placeholders = [
    "your-project.supabase.co",
    "your-anon-key",
    "your-publishable-key",
    "your-service-role-key",
  ];

  return !placeholders.some((p) => url.includes(p) || key.includes(p));
}
