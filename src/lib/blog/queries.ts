import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { getPublicOfficeId } from "@/lib/blog/office";
import type {
  BlogPostCard,
  BlogPostDetail,
  BlogSearchParams,
  PaginatedResult,
} from "@/types/blog";

const POST_CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImageUrl: true,
  publishedAt: true,
  readingTime: true,
  viewCount: true,
  author: { select: { name: true, avatarUrl: true } },
  category: { select: { name: true, slug: true } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} satisfies Prisma.BlogPostSelect;

function mapPostCard(
  post: Prisma.BlogPostGetPayload<{ select: typeof POST_CARD_SELECT }>
): BlogPostCard {
  return {
    ...post,
    tags: post.tags.map((t) => t.tag),
  };
}

const publishedWhere = (officeId: string): Prisma.BlogPostWhereInput => ({
  officeId,
  status: "PUBLISHED",
  deletedAt: null,
  publishedAt: { lte: new Date() },
});

export async function getPublishedPosts(
  params: BlogSearchParams = {}
): Promise<PaginatedResult<BlogPostCard>> {
  const officeId = await getPublicOfficeId();
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(24, Math.max(1, params.perPage ?? 9));
  const skip = (page - 1) * perPage;

  const where: Prisma.BlogPostWhereInput = {
    ...publishedWhere(officeId),
  };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { excerpt: { contains: params.q, mode: "insensitive" } },
      { content: { contains: params.q, mode: "insensitive" } },
    ];
  }

  if (params.category) {
    where.category = { slug: params.category, officeId };
  }

  if (params.tag) {
    where.tags = { some: { tag: { slug: params.tag, officeId } } };
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      select: POST_CARD_SELECT,
      orderBy: { publishedAt: "desc" },
      skip,
      take: perPage,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    items: posts.map(mapPostCard),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<BlogPostDetail | null> {
  const officeId = await getPublicOfficeId();

  const post = await prisma.blogPost.findFirst({
    where: {
      ...publishedWhere(officeId),
      slug,
    },
    include: {
      author: { select: { name: true, avatarUrl: true } },
      category: { select: { name: true, slug: true } },
      tags: {
        select: {
          tagId: true,
          tag: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!post) return null;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    publishedAt: post.publishedAt,
    readingTime: post.readingTime,
    viewCount: post.viewCount,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    status: post.status,
    updatedAt: post.updatedAt,
    categoryId: post.categoryId,
    tagIds: post.tags.map((t) => t.tagId),
    author: post.author,
    category: post.category,
    tags: post.tags.map((t) => t.tag),
  };
}

export async function incrementPostViewCount(id: string): Promise<void> {
  await prisma.blogPost.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  tagIds: string[],
  limit = 3
): Promise<BlogPostCard[]> {
  const officeId = await getPublicOfficeId();

  const baseWhere: Prisma.BlogPostWhereInput = {
    ...publishedWhere(officeId),
    id: { not: postId },
  };

  if (categoryId) {
    const byCategory = await prisma.blogPost.findMany({
      where: { ...baseWhere, categoryId },
      select: POST_CARD_SELECT,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    if (byCategory.length >= limit) {
      return byCategory.map(mapPostCard);
    }

    const remaining = limit - byCategory.length;
    const excludeIds = [postId, ...byCategory.map((p) => p.id)];

    const byTags = await prisma.blogPost.findMany({
      where: {
        ...baseWhere,
        id: { notIn: excludeIds },
        tags: { some: { tagId: { in: tagIds } } },
      },
      select: POST_CARD_SELECT,
      orderBy: { publishedAt: "desc" },
      take: remaining,
    });

    return [...byCategory, ...byTags].map(mapPostCard);
  }

  const posts = await prisma.blogPost.findMany({
    where: baseWhere,
    select: POST_CARD_SELECT,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return posts.map(mapPostCard);
}

export async function getPublishedCategories() {
  const officeId = await getPublicOfficeId();

  return prisma.blogCategory.findMany({
    where: {
      officeId,
      posts: { some: publishedWhere(officeId) },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          posts: { where: publishedWhere(officeId) },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getPublishedTags() {
  const officeId = await getPublicOfficeId();

  return prisma.blogTag.findMany({
    where: {
      officeId,
      posts: {
        some: { post: publishedWhere(officeId) },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          posts: { where: { post: publishedWhere(officeId) } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  const officeId = await getPublicOfficeId();
  return prisma.blogCategory.findFirst({
    where: { slug, officeId },
    select: { id: true, name: true, slug: true, description: true },
  });
}

export async function getTagBySlug(slug: string) {
  const officeId = await getPublicOfficeId();
  return prisma.blogTag.findFirst({
    where: { slug, officeId },
    select: { id: true, name: true, slug: true },
  });
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const officeId = await getPublicOfficeId();
  const posts = await prisma.blogPost.findMany({
    where: publishedWhere(officeId),
    select: { slug: true },
  });
  return posts.map((p) => p.slug);
}
