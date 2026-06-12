import type { BlogPostStatus } from "@prisma/client";

export interface BlogPostCard {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  readingTime: number;
  viewCount: number;
  author: { name: string; avatarUrl: string | null };
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
}

export interface BlogPostDetail extends BlogPostCard {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  status: BlogPostStatus;
  updatedAt: Date;
  categoryId: string | null;
  tagIds: string[];
}

export interface BlogCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { posts: number };
}

export interface BlogTagItem {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface BlogSearchParams {
  q?: string;
  category?: string;
  tag?: string;
  page?: number;
  perPage?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
