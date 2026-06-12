import { JsonLd } from "@/components/seo/json-ld";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/json-ld";
import type { BlogPostDetail } from "@/types/blog";

interface ArticleJsonLdProps {
  post: BlogPostDetail;
  slug: string;
}

export function ArticleJsonLd({ post, slug }: ArticleJsonLdProps) {
  const path = `/blog/${slug}`;
  const breadcrumbs = [
    { name: "Início", path: "/" },
    { name: "Blog", path: "/blog" },
  ];

  if (post.category) {
    breadcrumbs.push({
      name: post.category.name,
      path: `/blog/categoria/${post.category.slug}`,
    });
  }

  breadcrumbs.push({ name: post.title, path });

  return (
    <JsonLd
      data={[
        buildArticleSchema(post, path),
        buildBreadcrumbSchema(breadcrumbs),
      ]}
    />
  );
}
