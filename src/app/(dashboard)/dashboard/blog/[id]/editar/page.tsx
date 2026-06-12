import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  getPostForAdmin,
  getCategoriesAndTagsForForm,
} from "@/actions/blog/posts";
import { withPermission } from "@/lib/auth/guards";
import { PostForm } from "@/components/modules/blog/admin/post-form";
import { PageHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditPostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostForAdmin(id);
  return { title: post ? `Editar: ${post.title}` : "Editar artigo" };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  await withPermission("blog:write");
  const { id } = await params;

  const [post, { categories, tags }] = await Promise.all([
    getPostForAdmin(id),
    getCategoriesAndTagsForForm(),
  ]);

  if (!post) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/blog">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        {post.status === "PUBLISHED" && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/blog/${post.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Ver publicado
            </Link>
          </Button>
        )}
      </div>

      <PageHeader
        title="Editar artigo"
        description={post.title}
      />

      <PostForm categories={categories} tags={tags} post={post} />
    </div>
  );
}
