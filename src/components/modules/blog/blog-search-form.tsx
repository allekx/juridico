"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BlogSearchFormProps {
  defaultValue?: string;
}

export function BlogSearchForm({ defaultValue = "" }: BlogSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string)?.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    params.delete("page");

    router.push(`/blog?${params.toString()}`);
  }

  function clearSearch() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`/blog?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder="Buscar artigos..."
          className="pl-9"
        />
      </div>
      <Button type="submit" size="default">
        Buscar
      </Button>
      {defaultValue && (
        <Button type="button" variant="outline" size="icon" onClick={clearSearch}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}
