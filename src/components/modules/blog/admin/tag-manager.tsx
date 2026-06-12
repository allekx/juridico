"use client";

import { useActionState } from "react";
import {
  createTagAction,
  deleteTagAction,
  updateTagAction,
} from "@/actions/blog/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/forms/form-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionResult } from "@/types/auth";

interface TagRow {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

interface TagManagerProps {
  tags: TagRow[];
}

export function TagManager({ tags }: TagManagerProps) {
  const [createState, createAction, isCreating] = useActionState<
    ActionResult | null,
    FormData
  >(createTagAction, null);

  return (
    <div className="space-y-8">
      <form action={createAction} className="rounded-lg border p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold">Nova tag</h3>
        {createState?.error && (
          <p className="text-sm text-destructive">{createState.error}</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nome" htmlFor="name" required>
            <Input id="name" name="name" required disabled={isCreating} />
          </FormField>
          <FormField label="Slug" htmlFor="slug">
            <Input id="slug" name="slug" disabled={isCreating} />
          </FormField>
        </div>
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Criando..." : "Criar tag"}
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Artigos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TagRow({ tag }: { tag: TagRow }) {
  const updateAction = updateTagAction.bind(null, tag.id);
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(updateAction, null);

  async function handleDelete() {
    if (!confirm("Excluir esta tag?")) return;
    await deleteTagAction(tag.id);
    window.location.reload();
  }

  return (
    <TableRow>
      <TableCell colSpan={4} className="p-0">
        <form action={formAction} className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-4 sm:items-center">
          <Input name="name" defaultValue={tag.name} disabled={isPending} />
          <Input name="slug" defaultValue={tag.slug} disabled={isPending} />
          <span className="text-sm text-muted-foreground">
            {tag._count.posts} artigo(s)
          </span>
          <div className="flex justify-end gap-2">
            <Button type="submit" size="sm" variant="outline" disabled={isPending}>
              Salvar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </div>
          {state?.error && (
            <p className="text-xs text-destructive sm:col-span-4">{state.error}</p>
          )}
        </form>
      </TableCell>
    </TableRow>
  );
}
