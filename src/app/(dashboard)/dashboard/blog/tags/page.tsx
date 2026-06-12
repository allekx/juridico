import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTagsForAdmin } from "@/actions/blog/tags";
import { withPermission } from "@/lib/auth/guards";
import { TagManager } from "@/components/modules/blog/admin/tag-manager";
import { PageHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tags do Blog",
};

export default async function BlogTagsPage() {
  await withPermission("blog:read");
  const tags = await getTagsForAdmin();

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
        title="Tags"
        description="Gerencie tags para classificação e busca de artigos."
      />

      <TagManager tags={tags} />
    </div>
  );
}
