"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { withPermission } from "@/lib/auth/guards";
import { slugify } from "@/lib/slug";
import { blogTagSchema } from "@/schemas/blog";
import type { ActionResult } from "@/types/auth";

function revalidateBlog() {
  revalidatePath("/blog");
  revalidatePath("/dashboard/blog/tags");
}

export async function createTagAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await withPermission("blog:write");

  const parsed = blogTagSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);

  try {
    const tag = await prisma.blogTag.create({
      data: { officeId: user.officeId, name: parsed.data.name, slug },
    });
    revalidateBlog();
    return { success: true, data: { id: tag.id } };
  } catch {
    return { success: false, error: "Tag já existe ou dados inválidos" };
  }
}

export async function updateTagAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await withPermission("blog:write");

  const parsed = blogTagSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);

  try {
    await prisma.blogTag.update({
      where: { id, officeId: user.officeId },
      data: { name: parsed.data.name, slug },
    });
    revalidateBlog();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar tag" };
  }
}

export async function deleteTagAction(id: string): Promise<ActionResult> {
  const user = await withPermission("blog:write");

  await prisma.blogTag.delete({
    where: { id, officeId: user.officeId },
  });

  revalidateBlog();
  return { success: true };
}

export async function getTagsForAdmin() {
  const user = await withPermission("blog:read");

  return prisma.blogTag.findMany({
    where: { officeId: user.officeId },
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}
