import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Tags, FolderOpen, ExternalLink } from "lucide-react";
import { getPostsForAdmin } from "@/actions/blog/posts";
import { withPermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeletePostButton } from "@/components/modules/blog/admin/delete-post-button";

export const metadata: Metadata = {
  title: "Blog — Administração",
};

const STATUS_LABELS = {
  DRAFT: { label: "Rascunho", variant: "muted" as const },
  PUBLISHED: { label: "Publicado", variant: "success" as const },
  ARCHIVED: { label: "Arquivado", variant: "warning" as const },
};

export default async function AdminBlogPage() {
  await withPermission("blog:read");
  const posts = await getPostsForAdmin();

  return (
    <div>
      <PageHeader title="Blog Jurídico" description="Gerencie artigos, categorias e tags.">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/blog/categorias">
              <FolderOpen className="h-4 w-4" />
              Categorias
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/blog/tags">
              <Tags className="h-4 w-4" />
              Tags
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/blog/novo">
              <Plus className="h-4 w-4" />
              Novo artigo
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Autor</TableHead>
            <TableHead>Atualizado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                Nenhum artigo cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => {
              const status = STATUS_LABELS[post.status];
              return (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>{post.author.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Intl.DateTimeFormat("pt-BR").format(post.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {post.status === "PUBLISHED" && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/blog/${post.id}/editar`}>
                          Editar
                        </Link>
                      </Button>
                      <DeletePostButton postId={post.id} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
