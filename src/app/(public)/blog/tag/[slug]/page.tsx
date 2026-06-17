import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostCardComponent } from "@/components/modules/blog/blog-post-card";
import { BlogSidebar } from "@/components/modules/blog/blog-sidebar";
import { BlogPagination } from "@/components/modules/blog/blog-pagination";
import { SectionHeader } from "@/components/modules/site/home/section-header";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import {
  getPublishedPosts,
  getPublishedCategories,
  getPublishedTags,
  getTagBySlug,
} from "@/lib/blog/queries";

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Tag não encontrada" };

  return buildMetadata({
    title: `#${tag.name} | Blog Jurídico`,
    description: `Artigos jurídicos marcados com ${tag.name}. Conteúdo especializado do escritório Almeida & Associados.`,
    path: `/blog/tag/${slug}`,
    keywords: [tag.name, "blog jurídico", "advocacia"],
  });
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const [result, categories, tags] = await Promise.all([
    getPublishedPosts({ tag: slug, page }),
    getPublishedCategories(),
    getPublishedTags(),
  ]);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: `#${tag.name}`, path: `/blog/tag/${slug}` },
        ])}
      />
      <section className="border-b border-border/40 bg-muted/20 py-12">
        <div className="ds-container">
          <SectionHeader
            overline="Tag"
            title={`#${tag.name}`}
            align="center"
          />
        </div>
      </section>

      <section className="ds-section-sm">
        <div className="ds-container">
          <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="grid gap-6 sm:grid-cols-2">
                {result.items.map((post) => (
                  <BlogPostCardComponent key={post.id} post={post} />
                ))}
              </div>
              <div className="mt-10">
                <BlogPagination
                  page={result.page}
                  totalPages={result.totalPages}
                  basePath={`/blog/tag/${slug}`}
                />
              </div>
            </div>
            <BlogSidebar
              categories={categories}
              tags={tags}
              activeTag={slug}
            />
          </div>
        </div>
      </section>
    </>
  );
}
