import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPostCard } from "@/types/blog";

interface BlogPostCardProps {
  post: BlogPostCard;
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function BlogPostCardComponent({ post }: BlogPostCardProps) {
  return (
    <Card variant="interactive" className="group h-full overflow-hidden">
      {post.coverImageUrl && (
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <CardContent className="flex h-full flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.category && (
            <Link href={`/blog/categoria/${post.category.slug}`}>
              <Badge variant="gold">{post.category.name}</Badge>
            </Link>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(post.publishedAt)}
          </span>
        </div>

        <h2 className="font-display text-xl font-semibold leading-snug">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{post.author.name}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime} min
            </span>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-gold"
          >
            Ler
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
