import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

async function checkStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, buckets: [], error: "missing env" };

  try {
    const res = await fetch(`${url}/storage/v1/bucket`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return { ok: false, buckets: [], error: `HTTP ${res.status}` };
    const buckets = (await res.json()) as Array<{ name: string; public: boolean }>;
    const required = ["client-documents", "triage-documents"];
    const names = buckets.map((b) => b.name);
    const missing = required.filter((name) => !names.includes(name));
    return { ok: missing.length === 0, buckets: names, missing };
  } catch (error) {
    return {
      ok: false,
      buckets: [],
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}

async function checkAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { ok: false, error: "missing public key" };

  const supabase = createClient(url, key);
  const { error } = await supabase.auth.signInWithPassword({
    email: "juridicoemail9@gmail.com",
    password: process.env.ADMIN_SEED_PASSWORD ?? "Admin@123",
  });
  return { ok: !error, error: error?.message };
}

async function main() {
  const [officeCount, userCount, admin, storage, auth] = await Promise.all([
    prisma.office.count(),
    prisma.user.count(),
    prisma.user.findFirst({
      where: { email: "juridicoemail9@gmail.com", role: "ADMIN" },
      select: { id: true, email: true, isActive: true },
    }),
    checkStorage(),
    checkAuth(),
  ]);

  const report = {
    database: { ok: officeCount > 0 && !!admin, officeCount, userCount, admin },
    supabaseAuth: auth,
    storage,
    env: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "(missing)",
      DEFAULT_OFFICE_SLUG: process.env.DEFAULT_OFFICE_SLUG ?? "(missing)",
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasPublishableKey: !!(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    console.error("HEALTH FAIL:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
