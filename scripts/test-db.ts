import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "juridicoemail9@gmail.com" },
    select: { email: true, role: true },
  });
  console.log("DB OK:", user);
}

main()
  .catch((error) => {
    console.error("DB FAIL:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
