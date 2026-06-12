import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ArticleJsonLd } from "@/components/modules/blog/article-json-ld";
import { RelatedPosts } from "@/components/modules/blog/related-posts";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  getPublishedPostBySlug,
  getRelatedPosts,
  incrementPostViewCount,
  getAllPublishedSlugs,
} from "@/lib/blog/queries";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPublishedPostBySlug(slug);
    if (!post) return { title: "Artigo não encontrado" };

    const title = post.metaTitle || post.title;
    const description =
      post.metaDescription || post.excerpt || "Artigo do blog jurídico.";

    return buildMetadata({
      title,
      description,
      path: `/blog/${slug}`,
      ogType: "article",
      image: post.coverImageUrl ?? undefined,
      imageAlt: post.title,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      keywords: [
        ...post.tags.map((tag) => tag.name),
        post.category?.name ?? "",
      ].filter(Boolean),
    });
  } catch {
    return { title: "Blog" };
  }
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getPublishedPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  await incrementPostViewCount(post.id);

  const related = await getRelatedPosts(
    post.id,
    post.categoryId,
    post.tagIds
  );

  return (
    <>
      <ArticleJsonLd post={post} slug={slug} />

      <article>
        {post.coverImageUrl && (
          <div className="aspect-[21/9] max-h-[400px] w-full overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="ds-container py-10 md:py-14">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao blog
          </Link>

          <header className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {post.category && (
                <Link href={`/blog/categoria/${post.category.slug}`}>
                  <Badge variant="gold">{post.category.name}</Badge>
                </Link>
              )}
              {post.tags.map((tag) => (
                <Link key={tag.slug} href={`/blog/tag/${tag.slug}`}>
                  <Badge variant="outline">{tag.name}</Badge>
                </Link>
              ))}
            </div>

            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-border/60 pb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readingTime} min de leitura
              </span>
            </div>
          </header>

          <div className="mx-auto mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-foreground">
            {post.content.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <RelatedPosts posts={related} />
          </div>
        </div>
      </article>
    </>
  );
}
