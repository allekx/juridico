import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategoriesAndTagsForForm } from "@/actions/blog/posts";
import { withPermission } from "@/lib/auth/guards";
import { PostForm } from "@/components/modules/blog/admin/post-form";
import { PageHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Novo Artigo",
};

export default async function NewPostPage() {
  await withPermission("blog:write");
  const { categories, tags } = await getCategoriesAndTagsForForm();

  return (
    <div>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/blog">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Novo artigo"
        description="Crie um novo artigo para o blog jurídico."
      />

      <PostForm categories={categories} tags={tags} />
    </div>
  );
}
