/**
 * Cria/atualiza apenas o usuário admin no Prisma e no Supabase Auth.
 * Uso: npm run db:seed:admin
 */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "juridicoemail9@gmail.com";
const ADMIN_USER_ID = "00000000-0000-4000-a000-000000000001";
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? "Admin@123";
const OFFICE_SLUG = process.env.DEFAULT_OFFICE_SLUG ?? "almeida-associados";

async function main() {
  const office = await prisma.office.upsert({
    where: { slug: OFFICE_SLUG },
    update: {},
    create: {
      name: "Almeida & Associados",
      slug: OFFICE_SLUG,
      email: "contato@almeidaassociados.com.br",
      phone: "(11) 3456-7890",
      city: "São Paulo",
      state: "SP",
    },
  });

  const admin = await prisma.user.upsert({
    where: { id: ADMIN_USER_ID },
    update: {
      email: ADMIN_EMAIL,
      name: "Administrador",
      role: "ADMIN",
      isActive: true,
    },
    create: {
      id: ADMIN_USER_ID,
      officeId: office.id,
      email: ADMIN_EMAIL,
      name: "Administrador",
      role: "ADMIN",
    },
  });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.log("Admin no banco OK. Supabase Auth não sincronizado (faltam variáveis).");
    console.log({ email: admin.email, password: ADMIN_PASSWORD });
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const metadata = {
    app_metadata: { role: "ADMIN", office_id: office.id },
    user_metadata: { name: "Administrador" },
  };

  const { error } = await supabase.auth.admin.createUser({
    id: ADMIN_USER_ID,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    ...metadata,
  });

  if (error && !error.message.toLowerCase().includes("already")) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      ADMIN_USER_ID,
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        ...metadata,
      }
    );

    if (updateError) {
      throw new Error(`Supabase Auth: ${updateError.message}`);
    }
  }

  console.log("Admin pronto:", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    office: office.slug,
    supabaseSynced: true,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
