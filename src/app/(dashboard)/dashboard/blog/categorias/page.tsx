import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategoriesForAdmin } from "@/actions/blog/categories";
import { withPermission } from "@/lib/auth/guards";
import { CategoryManager } from "@/components/modules/blog/admin/category-manager";
import { PageHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Categorias do Blog",
};

export default async function BlogCategoriesPage() {
  await withPermission("blog:read");
  const categories = await getCategoriesForAdmin();

  return (
    <div>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/blog">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao blog
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Categorias"
        description="Organize os artigos por categorias temáticas."
      />

      <CategoryManager categories={categories} />
    </div>
  );
}
