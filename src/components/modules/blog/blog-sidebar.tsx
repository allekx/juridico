import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BlogSidebarProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    _count?: { posts: number };
  }[];
  tags: {
    id: string;
    name: string;
    slug: string;
    _count?: { posts: number };
  }[];
  activeCategory?: string;
  activeTag?: string;
}

export function BlogSidebar({
  categories,
  tags,
  activeCategory,
  activeTag,
}: BlogSidebarProps) {
  return (
    <aside className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Categorias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Link
            href="/blog"
            className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
              !activeCategory && !activeTag ? "bg-accent font-medium" : ""
            }`}
          >
            Todos os artigos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog/categoria/${cat.slug}`}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                activeCategory === cat.slug ? "bg-accent font-medium" : ""
              }`}
            >
              <span>{cat.name}</span>
              {cat._count && (
                <span className="text-xs text-muted-foreground">
                  {cat._count.posts}
                </span>
              )}
            </Link>
          ))}
        </CardContent>
      </Card>

      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                  <Badge
                    variant={activeTag === tag.slug ? "default" : "outline"}
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
