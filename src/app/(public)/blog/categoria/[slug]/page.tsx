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
  getCategoryBySlug,
} from "@/lib/blog/queries";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoria não encontrada" };

  const description =
    category.description ||
    `Artigos e orientações sobre ${category.name} publicados pelo escritório Almeida & Associados.`;

  return buildMetadata({
    title: `${category.name} — Blog Jurídico`,
    description,
    path: `/blog/categoria/${slug}`,
    keywords: [category.name, "blog jurídico", "advocacia"],
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [result, categories, tags] = await Promise.all([
    getPublishedPosts({ category: slug, page }),
    getPublishedCategories(),
    getPublishedTags(),
  ]);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: category.name, path: `/blog/categoria/${slug}` },
        ])}
      />
      <section className="border-b border-border/40 bg-muted/20 py-12">
        <div className="ds-container">
          <SectionHeader
            overline="Categoria"
            title={category.name}
            description={category.description ?? undefined}
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
                  basePath={`/blog/categoria/${slug}`}
                />
              </div>
            </div>
            <BlogSidebar
              categories={categories}
              tags={tags}
              activeCategory={slug}
            />
          </div>
        </div>
      </section>
    </>
  );
}
