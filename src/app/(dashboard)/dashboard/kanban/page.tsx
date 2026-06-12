import type { Metadata } from "next";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { getLegalKanbanBoard } from "@/lib/kanban/queries";
import { PageHeader } from "@/components/ui/typography";
import { LegalKanbanBoard } from "@/components/modules/kanban/legal-kanban-board";
import { KANBAN_COLUMNS } from "@/constants/kanban";

export const metadata: Metadata = {
  title: "Kanban Jurídico",
};

export default async function LegalKanbanPage() {
  const user = await withPermission("crm:read");
  const canWrite = hasPermission(user.role, "crm:write");

  const board = await getLegalKanbanBoard(user.officeId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban Jurídico"
        description={
          canWrite
            ? "Arraste os cards entre as colunas para atualizar o status automaticamente."
            : "Visualização do fluxo de trabalho dos processos."
        }
      />

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {KANBAN_COLUMNS.map((col) => (
          <span
            key={col.slug}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: col.color }}
            />
            {col.name}
          </span>
        ))}
        <span className="ml-auto self-center font-medium text-foreground">
          {board.totalCases} caso{board.totalCases !== 1 ? "s" : ""}
        </span>
      </div>

      <LegalKanbanBoard
        initialColumns={board.columns}
        canWrite={canWrite}
      />
    </div>
  );
}
