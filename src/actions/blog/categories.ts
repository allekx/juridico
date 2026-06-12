"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { withPermission } from "@/lib/auth/guards";
import { slugify } from "@/lib/slug";
import { blogCategorySchema } from "@/schemas/blog";
import type { ActionResult } from "@/types/auth";

function revalidateBlog() {
  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");
  revalidatePath("/dashboard/blog/categorias");
}

export async function createCategoryAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await withPermission("blog:write");

  const parsed = blogCategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);

  try {
    const category = await prisma.blogCategory.create({
      data: {
        officeId: user.officeId,
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
      },
    });
    revalidateBlog();
    return { success: true, data: { id: category.id } };
  } catch {
    return { success: false, error: "Categoria já existe ou dados inválidos" };
  }
}

export async function updateCategoryAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await withPermission("blog:write");

  const parsed = blogCategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);

  try {
    await prisma.blogCategory.update({
      where: { id, officeId: user.officeId },
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
      },
    });
    revalidateBlog();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar categoria" };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const user = await withPermission("blog:write");

  const postsCount = await prisma.blogPost.count({
    where: { categoryId: id, officeId: user.officeId, deletedAt: null },
  });

  if (postsCount > 0) {
    return {
      success: false,
      error: "Não é possível excluir categoria com artigos vinculados",
    };
  }

  await prisma.blogCategory.delete({
    where: { id, officeId: user.officeId },
  });

  revalidateBlog();
  return { success: true };
}

export async function getCategoriesForAdmin() {
  const user = await withPermission("blog:read");

  return prisma.blogCategory.findMany({
    where: { officeId: user.officeId },
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}
