"use client";

import { useTransition } from "react";
import { deletePostAction } from "@/actions/blog/posts";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeletePostButtonProps {
  postId: string;
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Excluir este artigo?")) return;
    startTransition(async () => {
      await deletePostAction(postId);
      window.location.href = "/dashboard/blog";
    });
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
      {isPending ? "Excluindo..." : "Excluir"}
    </Button>
  );
}
