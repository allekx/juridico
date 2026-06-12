import { prisma } from "@/lib/prisma/client";

export async function getPublicOfficeId(): Promise<string> {
  const slug = process.env.DEFAULT_OFFICE_SLUG;

  if (slug) {
    const office = await prisma.office.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    });
    if (office) return office.id;
  }

  const office = await prisma.office.findFirst({
    where: { isActive: true },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!office) {
    throw new Error("Nenhum escritório configurado para o blog público.");
  }

  return office.id;
}
