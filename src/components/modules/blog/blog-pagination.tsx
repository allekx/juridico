import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function BlogPagination({
  page,
  totalPages,
  basePath,
  searchParams = {},
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  function buildUrl(targetPage: number) {
    const params = new URLSearchParams(searchParams);
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {page > 1 && (
        <Button asChild variant="outline" size="sm">
          <Link href={buildUrl(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Link>
        </Button>
      )}
      <span className="px-4 text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      {page < totalPages && (
        <Button asChild variant="outline" size="sm">
          <Link href={buildUrl(page + 1)}>
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
