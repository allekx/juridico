"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Kanban, Loader2 } from "lucide-react";
import { sendLeadToLegalKanbanAction } from "@/actions/crm/leads";
import { Button } from "@/components/ui/button";

interface SendLeadToLegalKanbanButtonProps {
  leadId: string;
  legalCaseId?: string | null;
}

export function SendLeadToLegalKanbanButton({
  leadId,
  legalCaseId,
}: SendLeadToLegalKanbanButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (legalCaseId) {
    return (
      <Button type="button" variant="default" asChild>
        <Link href="/dashboard/kanban">
          <Kanban className="h-4 w-4" />
          Ver no Kanban Jurídico
        </Link>
      </Button>
    );
  }

  function handleClick() {
    startTransition(async () => {
      const result = await sendLeadToLegalKanbanAction(leadId);
      if (result.success) {
        router.push("/dashboard/kanban");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="default"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Kanban className="h-4 w-4" />
      )}
      Enviar ao Kanban Jurídico
    </Button>
  );
}
