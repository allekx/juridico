"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitBranch, Loader2 } from "lucide-react";
import { sendLeadToKanbanAction } from "@/actions/crm/leads";
import { Button } from "@/components/ui/button";

interface SendLeadToKanbanButtonProps {
  leadId: string;
}

export function SendLeadToKanbanButton({ leadId }: SendLeadToKanbanButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await sendLeadToKanbanAction(leadId);
      if (result.success) {
        router.push("/dashboard/crm/kanban");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GitBranch className="h-4 w-4" />
        )}
        Mover no funil comercial
      </Button>
      <Button type="button" variant="outline" asChild>
        <Link href="/dashboard/crm/kanban">Abrir funil de leads</Link>
      </Button>
    </div>
  );
}
