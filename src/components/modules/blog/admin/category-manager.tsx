"use client";

import { useActionState } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/blog/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { posts: number };
}

interface CategoryManagerProps {
  categories: CategoryRow[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [createState, createAction, isCreating] = useActionState<
    ActionResult | null,
    FormData
  >(createCategoryAction, null);

  return (
    <div className="space-y-8">
      <form action={createAction} className="rounded-lg border p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold">Nova categoria</h3>
        {createState?.error && (
          <p className="text-sm text-destructive">{createState.error}</p>
        )}
        {createState?.success && (
          <p className="text-sm text-success">Categoria criada!</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nome" htmlFor="name" required>
            <Input id="name" name="name" required disabled={isCreating} />
          </FormField>
          <FormField label="Slug" htmlFor="slug">
            <Input id="slug" name="slug" disabled={isCreating} />
          </FormField>
        </div>
        <FormField label="Descrição" htmlFor="description">
          <Textarea id="description" name="description" rows={2} disabled={isCreating} />
        </FormField>
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Criando..." : "Criar categoria"}
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
          {categories.map((cat) => (
            <CategoryRow key={cat.id} category={cat} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CategoryRow({ category }: { category: CategoryRow }) {
  const updateAction = updateCategoryAction.bind(null, category.id);
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(updateAction, null);

  async function handleDelete() {
    if (!confirm("Excluir esta categoria?")) return;
    await deleteCategoryAction(category.id);
    window.location.reload();
  }

  return (
    <TableRow>
      <TableCell colSpan={4} className="p-0">
        <form action={formAction} className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-4 sm:items-center">
          <Input name="name" defaultValue={category.name} disabled={isPending} />
          <Input name="slug" defaultValue={category.slug} disabled={isPending} />
          <span className="text-sm text-muted-foreground">
            {category._count.posts} artigo(s)
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
              disabled={category._count.posts > 0}
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
