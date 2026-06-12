"use client";

import { useCallback, useState, useTransition } from "react";
import { GripVertical, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { moveKanbanCaseAction } from "@/actions/kanban";
import {
  CASE_PRIORITY_LABELS,
  CASE_PRIORITY_VARIANT,
} from "@/constants/crm";
import { cn } from "@/lib/utils";
import type { KanbanCardData, KanbanColumnData } from "@/types/kanban";

interface LegalKanbanBoardProps {
  initialColumns: KanbanColumnData[];
  canWrite?: boolean;
}

export function LegalKanbanBoard({
  initialColumns,
  canWrite = true,
}: LegalKanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const moveCardLocally = useCallback(
    (cardId: string, fromStatusId: string, toStatusId: string) => {
      if (fromStatusId === toStatusId) return;

      setColumns((prev) => {
        let movedCard: KanbanCardData | null = null;

        const without = prev.map((col) => {
          if (col.id !== fromStatusId) return col;
          const card = col.cards.find((c) => c.id === cardId);
          if (card) movedCard = { ...card, statusId: toStatusId };
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== cardId),
          };
        });

        if (!movedCard) return prev;

        return without.map((col) =>
          col.id === toStatusId
            ? { ...col, cards: [movedCard!, ...col.cards] }
            : col
        );
      });
    },
    []
  );

  function handleDrop(targetColumnId: string, cardId: string, sourceColumnId: string) {
    if (!canWrite || isPending) return;
    if (targetColumnId === sourceColumnId) return;

    setError(null);
    const snapshot = columns;
    moveCardLocally(cardId, sourceColumnId, targetColumnId);

    startTransition(async () => {
      const result = await moveKanbanCaseAction(cardId, targetColumnId);
      if (!result.success) {
        setColumns(snapshot);
        setError(result.error ?? "Erro ao salvar");
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Salvando alteração...
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            draggingId={draggingId}
            dropTargetId={dropTargetId}
            canWrite={canWrite && !isPending}
            onDragStart={(cardId) => setDraggingId(cardId)}
            onDragEnd={() => {
              setDraggingId(null);
              setDropTargetId(null);
            }}
            onDragEnter={() => setDropTargetId(column.id)}
            onDragLeave={() => setDropTargetId(null)}
            onDrop={(cardId, sourceColumnId) => {
              setDropTargetId(null);
              setDraggingId(null);
              handleDrop(column.id, cardId, sourceColumnId);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  draggingId,
  dropTargetId,
  canWrite,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDrop,
}: {
  column: KanbanColumnData;
  draggingId: string | null;
  dropTargetId: string | null;
  canWrite: boolean;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (cardId: string, sourceColumnId: string) => void;
}) {
  const isDropTarget = dropTargetId === column.id && draggingId !== null;

  return (
    <div
      className={cn(
        "flex w-[280px] shrink-0 flex-col rounded-xl border bg-muted/20 transition-all duration-200",
        isDropTarget
          ? "border-gold ring-2 ring-gold/30 bg-gold-muted/10"
          : "border-border/60"
      )}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragEnter();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("text/plain");
        const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
        if (cardId && sourceColumnId) onDrop(cardId, sourceColumnId);
      }}
    >
      <div
        className="flex items-center gap-2 border-b border-border/60 px-4 py-3"
        style={{ borderTopColor: column.color, borderTopWidth: 3 }}
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="text-sm font-semibold leading-tight">{column.name}</h3>
        <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {column.cards.length}
        </span>
      </div>

      <div className="flex min-h-[420px] flex-col gap-2.5 p-3">
        {column.cards.length === 0 ? (
          <div
            className={cn(
              "flex flex-1 items-center justify-center rounded-lg border-2 border-dashed p-4 text-center text-xs text-muted-foreground",
              isDropTarget ? "border-gold/50 bg-gold-muted/20" : "border-border/40"
            )}
          >
            {canWrite ? "Arraste um card aqui" : "Vazio"}
          </div>
        ) : (
          column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={column.id}
              isDragging={draggingId === card.id}
              canWrite={canWrite}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  card,
  columnId,
  isDragging,
  canWrite,
  onDragStart,
  onDragEnd,
}: {
  card: KanbanCardData;
  columnId: string;
  isDragging: boolean;
  canWrite: boolean;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <Card
      variant="default"
      draggable={canWrite}
      className={cn(
        "transition-all duration-150",
        canWrite && "cursor-grab active:cursor-grabbing hover:shadow-md",
        isDragging && "scale-[0.98] opacity-40"
      )}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", card.id);
        e.dataTransfer.setData("sourceColumnId", columnId);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(card.id);
      }}
      onDragEnd={onDragEnd}
    >
      <CardContent className="flex gap-2 p-3">
        {canWrite && (
          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{card.title}</p>
          {card.caseNumber && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {card.caseNumber}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{card.clientName}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge
              variant={CASE_PRIORITY_VARIANT[card.priority]}
              className="text-2xs"
            >
              {CASE_PRIORITY_LABELS[card.priority]}
            </Badge>
            <Badge variant="outline" className="text-2xs">
              {card.caseType}
            </Badge>
          </div>
          <p className="mt-1.5 text-2xs text-muted-foreground">
            {card.lawyerName}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
