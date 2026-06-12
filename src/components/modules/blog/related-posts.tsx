import { BlogPostCardComponent } from "./blog-post-card";
import { Heading } from "@/components/ui/typography";
import type { BlogPostCard } from "@/types/blog";

interface RelatedPostsProps {
  posts: BlogPostCard[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border/60 pt-12">
      <Heading className="mb-8 text-2xl">Artigos relacionados</Heading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCardComponent key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
