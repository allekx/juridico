"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BlogPostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { withPermission } from "@/lib/auth/guards";
import { slugify, calculateReadingTime } from "@/lib/slug";
import { logCreate, logDelete, logUpdate } from "@/lib/audit/service";
import { blogPostSchema } from "@/schemas/blog";
import type { ActionResult } from "@/types/auth";

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

function parsePostFormData(formData: FormData) {
  const tagIds = formData.getAll("tagIds").map(String).filter(Boolean);

  return blogPostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content"),
    coverImageUrl: formData.get("coverImageUrl") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    tagIds,
    status: formData.get("status"),
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
  });
}

async function syncPostTags(postId: string, tagIds: string[]) {
  await prisma.blogPostTag.deleteMany({ where: { postId } });
  if (tagIds.length > 0) {
    await prisma.blogPostTag.createMany({
      data: tagIds.map((tagId) => ({ postId, tagId })),
    });
  }
}

export async function createPostAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await withPermission("blog:write");
  const parsed = parsePostFormData(formData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.title);
  const status = data.status as BlogPostStatus;
  const publishedAt =
    status === "PUBLISHED" ? new Date() : null;

  if (status === "PUBLISHED") {
    await withPermission("blog:publish");
  }

  try {
    const post = await prisma.blogPost.create({
      data: {
        officeId: user.officeId,
        authorId: user.id,
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.coverImageUrl || null,
        categoryId: data.categoryId || null,
        status,
        publishedAt,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        readingTime: calculateReadingTime(data.content),
      },
    });

    if (data.tagIds?.length) {
      await syncPostTags(post.id, data.tagIds);
    }

    await logCreate(user, "blog_post", post.id, `Artigo criado: ${post.title}`, {
      status: post.status,
      slug: post.slug,
    });

    revalidateBlogPaths(slug);
    redirect(`/dashboard/blog/${post.id}/editar`);
  } catch {
    return { success: false, error: "Slug já existe ou dados inválidos" };
  }
}

export async function updatePostAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await withPermission("blog:write");
  const parsed = parsePostFormData(formData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.title);
  const status = data.status as BlogPostStatus;

  if (status === "PUBLISHED") {
    await withPermission("blog:publish");
  }

  const existing = await prisma.blogPost.findFirst({
    where: { id, officeId: user.officeId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Artigo não encontrado" };
  }

  const publishedAt =
    status === "PUBLISHED" && !existing.publishedAt
      ? new Date()
      : status !== "PUBLISHED"
        ? null
        : existing.publishedAt;

  try {
    await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.coverImageUrl || null,
        categoryId: data.categoryId || null,
        status,
        publishedAt,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        readingTime: calculateReadingTime(data.content),
      },
    });

    await syncPostTags(id, data.tagIds ?? []);
    await logUpdate(user, "blog_post", id, `Artigo alterado: ${data.title}`, {
      status,
      slug,
    });
    revalidateBlogPaths(slug);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar artigo" };
  }
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  const user = await withPermission("blog:write");

  const existing = await prisma.blogPost.findFirst({
    where: { id, officeId: user.officeId, deletedAt: null },
    select: { title: true },
  });

  await prisma.blogPost.update({
    where: { id, officeId: user.officeId },
    data: { deletedAt: new Date() },
  });

  if (existing) {
    await logDelete(user, "blog_post", id, `Artigo excluído: ${existing.title}`);
  }

  revalidateBlogPaths();
  return { success: true };
}

export async function getPostsForAdmin() {
  const user = await withPermission("blog:read");

  return prisma.blogPost.findMany({
    where: { officeId: user.officeId, deletedAt: null },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPostForAdmin(id: string) {
  const user = await withPermission("blog:read");

  return prisma.blogPost.findFirst({
    where: { id, officeId: user.officeId, deletedAt: null },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function getCategoriesAndTagsForForm() {
  const user = await withPermission("blog:read");

  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({
      where: { officeId: user.officeId },
      orderBy: { name: "asc" },
    }),
    prisma.blogTag.findMany({
      where: { officeId: user.officeId },
      orderBy: { name: "asc" },
    }),
  ]);

  return { categories, tags };
}
