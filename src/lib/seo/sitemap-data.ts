import type { MetadataRoute } from "next";
import { getAllPracticeAreaSlugs } from "@/lib/practice-areas";
import { prisma } from "@/lib/prisma/client";
import { getPublicOfficeId } from "@/lib/blog/office";

type SitemapEntry = MetadataRoute.Sitemap[number] & { path: string };

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: SitemapEntry["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/areas-de-atuacao", priority: 0.9, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.85, changeFrequency: "daily" },
  { path: "/triagem", priority: 0.8, changeFrequency: "monthly" },
  { path: "/privacidade", priority: 0.3, changeFrequency: "yearly" },
  { path: "/termos", priority: 0.3, changeFrequency: "yearly" },
  { path: "/lgpd/exclusao-dados", priority: 0.4, changeFrequency: "yearly" },
];

async function getBlogEntries(): Promise<SitemapEntry[]> {
  try {
    const officeId = await getPublicOfficeId();

    const [posts, categories, tags] = await Promise.all([
      prisma.blogPost.findMany({
        where: { officeId, status: "PUBLISHED", publishedAt: { not: null } },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.blogCategory.findMany({
        where: {
          officeId,
          posts: {
            some: {
              officeId,
              status: "PUBLISHED",
              publishedAt: { not: null },
            },
          },
        },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogTag.findMany({
        where: {
          officeId,
          posts: {
            some: {
              officeId,
              status: "PUBLISHED",
              publishedAt: { not: null },
            },
          },
        },
        select: { slug: true },
      }),
    ]);

    const postEntries: SitemapEntry[] = posts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const categoryEntries: SitemapEntry[] = categories.map((category) => ({
      path: `/blog/categoria/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const tagEntries: SitemapEntry[] = tags.map((tag) => ({
      path: `/blog/tag/${tag.slug}`,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    return [...postEntries, ...categoryEntries, ...tagEntries];
  } catch {
    return [];
  }
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const staticEntries: SitemapEntry[] = STATIC_ROUTES.map((route) => ({
    path: route.path,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const practiceAreaEntries: SitemapEntry[] = getAllPracticeAreaSlugs().map(
    (slug) => ({
      path: `/areas-de-atuacao/${slug}`,
      changeFrequency: "monthly",
      priority: 0.85,
    })
  );

  const blogEntries = await getBlogEntries();

  return [...staticEntries, ...practiceAreaEntries, ...blogEntries];
}
