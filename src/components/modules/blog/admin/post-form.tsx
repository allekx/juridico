"use client";

import { useActionState, useState } from "react";
import { createPostAction, updatePostAction } from "@/actions/blog/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/forms/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/slug";
import type { ActionResult } from "@/types/auth";
import type { BlogCategory, BlogTag, BlogPost } from "@prisma/client";

type PostWithRelations = BlogPost & {
  tags: { tag: BlogTag }[];
};

interface PostFormProps {
  categories: BlogCategory[];
  tags: BlogTag[];
  post?: PostWithRelations;
}

export function PostForm({ categories, tags, post }: PostFormProps) {
  const isEditing = !!post;
  const action = isEditing
    ? updatePostAction.bind(null, post.id)
    : createPostAction;

  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(action, null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const selectedTagIds = post?.tags.map((t) => t.tag.id) ?? [];

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing || !slug) {
      setSlug(slugify(value));
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state?.success && isEditing && (
        <div className="rounded-md border border-success/20 bg-success/5 p-3 text-sm text-success">
          Artigo salvo com sucesso!
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Título" htmlFor="title" required>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              disabled={isPending}
            />
          </FormField>

          <FormField label="Slug (URL)" htmlFor="slug" hint="/blog/seu-slug">
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={isPending}
            />
          </FormField>

          <FormField label="Resumo" htmlFor="excerpt">
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={post?.excerpt ?? ""}
              rows={2}
              maxLength={500}
              disabled={isPending}
            />
          </FormField>

          <FormField label="Conteúdo" htmlFor="content" required>
            <Textarea
              id="content"
              name="content"
              defaultValue={post?.content ?? ""}
              rows={16}
              required
              disabled={isPending}
              className="font-mono text-sm"
            />
          </FormField>

          <FormField label="URL da imagem de capa" htmlFor="coverImageUrl">
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              defaultValue={post?.coverImageUrl ?? ""}
              placeholder="https://..."
              disabled={isPending}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Categoria" htmlFor="categoryId">
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={post?.categoryId ?? ""}
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tags" htmlFor="tags">
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={selectedTagIds.includes(tag.id)}
                    disabled={isPending}
                    className="rounded border-input"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Status" htmlFor="status" required>
            <select
              id="status"
              name="status"
              defaultValue={post?.status ?? "DRAFT"}
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Meta título" htmlFor="metaTitle" hint="Máx. 60 caracteres">
            <Input
              id="metaTitle"
              name="metaTitle"
              defaultValue={post?.metaTitle ?? ""}
              maxLength={255}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Meta descrição"
            htmlFor="metaDescription"
            hint="Máx. 160 caracteres | aparece no Google"
          >
            <Textarea
              id="metaDescription"
              name="metaDescription"
              defaultValue={post?.metaDescription ?? ""}
              rows={2}
              maxLength={500}
              disabled={isPending}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar artigo"}
        </Button>
      </div>
    </form>
  );
}
