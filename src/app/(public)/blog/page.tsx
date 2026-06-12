import { Suspense } from "react";
import { BlogPostCardComponent } from "@/components/modules/blog/blog-post-card";
import { BlogSearchForm } from "@/components/modules/blog/blog-search-form";
import { BlogSidebar } from "@/components/modules/blog/blog-sidebar";
import { BlogPagination } from "@/components/modules/blog/blog-pagination";
import { SectionHeader } from "@/components/modules/site/home/section-header";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBlogSchema, buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import {
  getPublishedPosts,
  getPublishedCategories,
  getPublishedTags,
} from "@/lib/blog/queries";

export const metadata = buildMetadata({
  title: "Blog Jurídico",
  description:
    "Artigos, análises e orientações jurídicas do escritório Almeida & Associados. Conteúdo sobre direito trabalhista, empresarial, família, criminal e mais.",
  path: "/blog",
  keywords: [
    "blog jurídico",
    "artigos advocacia",
    "direito trabalhista",
    "direito empresarial",
    "orientação jurídica",
  ],
});

interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
    tag?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [result, categories, tags] = await Promise.all([
    getPublishedPosts({
      q: params.q,
      category: params.category,
      tag: params.tag,
      page,
    }),
    getPublishedCategories(),
    getPublishedTags(),
  ]);

  const searchParamsRecord: Record<string, string> = {};
  if (params.q) searchParamsRecord.q = params.q;
  if (params.category) searchParamsRecord.category = params.category;
  if (params.tag) searchParamsRecord.tag = params.tag;

  return (
    <>
      <JsonLd
        data={[
          buildBlogSchema(result.items.map((post) => ({
            title: post.title,
            slug: post.slug,
          }))),
          buildBreadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />
      <section className="border-b border-border/40 bg-muted/20 py-12 md:py-16">
        <div className="ds-container">
          <SectionHeader
            overline="Conteúdo jurídico"
            title="Blog"
            description="Análises, orientações e novidades do mundo jurídico."
            align="center"
          />
          <div className="mx-auto max-w-xl">
            <Suspense fallback={null}>
              <BlogSearchForm defaultValue={params.q} />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="ds-section-sm">
        <div className="ds-container">
          {params.q && (
            <p className="mb-6 text-sm text-muted-foreground">
              {result.total} resultado(s) para &ldquo;{params.q}&rdquo;
            </p>
          )}

          <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
            <div>
              {result.items.length === 0 ? (
                <div className="rounded-lg border border-dashed p-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhum artigo encontrado.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {result.items.map((post) => (
                      <BlogPostCardComponent key={post.id} post={post} />
                    ))}
                  </div>
                  <div className="mt-10">
                    <BlogPagination
                      page={result.page}
                      totalPages={result.totalPages}
                      basePath="/blog"
                      searchParams={searchParamsRecord}
                    />
                  </div>
                </>
              )}
            </div>

            <BlogSidebar
              categories={categories}
              tags={tags}
              activeCategory={params.category}
              activeTag={params.tag}
            />
          </div>
        </div>
      </section>
    </>
  );
}
