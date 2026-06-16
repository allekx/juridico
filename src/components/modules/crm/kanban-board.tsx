"use client";

import Link from "next/link";
import { useTransition } from "react";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { updateLeadStatusAction } from "@/actions/crm/leads";
import { updateCaseStatusAction } from "@/actions/crm/cases";
import {
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  CASE_PRIORITY_LABELS,
  CASE_PRIORITY_VARIANT,
} from "@/constants/crm";
import type {
  CrmKanbanCaseCard,
  CrmKanbanLeadCard,
  CrmCaseStatusOption,
} from "@/types/crm";
import type { LeadStatus } from "@prisma/client";

interface LeadsKanbanProps {
  columns: Record<LeadStatus, CrmKanbanLeadCard[]>;
  canWrite?: boolean;
}

export function LeadsKanban({ columns, canWrite = true }: LeadsKanbanProps) {
  const [isPending, startTransition] = useTransition();

  function handleDrop(status: LeadStatus, leadId: string) {
    if (!canWrite) return;
    startTransition(async () => {
      await updateLeadStatusAction(leadId, status);
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {(Object.keys(columns) as LeadStatus[]).map((status) => {
        const cards = columns[status];
        return (
          <KanbanColumn
            key={status}
            title={LEAD_STATUS_LABELS[status]}
            count={cards.length}
            onDrop={(id) => handleDrop(status, id)}
            disabled={isPending || !canWrite}
          >
            {cards.map((card) => (
              <KanbanCard
                key={card.id}
                id={card.id}
                href={`/dashboard/crm/leads/${card.id}`}
                draggable={canWrite}
                disabled={isPending}
              >
                <p className="font-medium leading-snug">{card.name}</p>
                {card.interestArea && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.interestArea}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="muted" className="text-2xs">
                    {LEAD_SOURCE_LABELS[card.source]}
                  </Badge>
                  {card.assignedToName && (
                    <Badge variant="outline" className="text-2xs">
                      {card.assignedToName}
                    </Badge>
                  )}
                </div>
              </KanbanCard>
            ))}
          </KanbanColumn>
        );
      })}
    </div>
  );
}

interface CasesKanbanProps {
  statuses: CrmCaseStatusOption[];
  cards: CrmKanbanCaseCard[];
  canWrite?: boolean;
}

export function CasesKanban({
  statuses,
  cards,
  canWrite = true,
}: CasesKanbanProps) {
  const [isPending, startTransition] = useTransition();

  function handleDrop(statusId: string, caseId: string) {
    if (!canWrite) return;
    startTransition(async () => {
      await updateCaseStatusAction(caseId, statusId);
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const columnCards = cards.filter((c) => c.statusId === status.id);
        return (
          <KanbanColumn
            key={status.id}
            title={status.name}
            count={columnCards.length}
            color={status.color}
            onDrop={(id) => handleDrop(status.id, id)}
            disabled={isPending || !canWrite}
          >
            {columnCards.map((card) => (
              <KanbanCard
                key={card.id}
                id={card.id}
                draggable={canWrite}
                disabled={isPending}
              >
                <p className="font-medium leading-snug">{card.title}</p>
                {card.caseNumber && (
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {card.caseNumber}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.clientName}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge
                    variant={CASE_PRIORITY_VARIANT[card.priority]}
                    className="text-2xs"
                  >
                    {CASE_PRIORITY_LABELS[card.priority]}
                  </Badge>
                  <Badge variant="outline" className="text-2xs">
                    {card.lawyerName}
                  </Badge>
                </div>
              </KanbanCard>
            ))}
          </KanbanColumn>
        );
      })}
    </div>
  );
}

function KanbanColumn({
  title,
  count,
  color,
  children,
  onDrop,
  disabled,
}: {
  title: string;
  count: number;
  color?: string;
  children: React.ReactNode;
  onDrop: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex w-72 shrink-0 flex-col rounded-lg border border-border/60 bg-muted/20"
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add("ring-2", "ring-gold/30");
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove("ring-2", "ring-gold/30");
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("ring-2", "ring-gold/30");
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDrop(id);
      }}
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        {color && (
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      </div>
      <div
        className={`flex flex-1 flex-col gap-2 p-3 min-h-[200px] ${disabled ? "opacity-60" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

function KanbanCard({
  id,
  href,
  children,
  draggable,
  disabled,
}: {
  id: string;
  href?: string;
  children: React.ReactNode;
  draggable?: boolean;
  disabled?: boolean;
}) {
  return (
    <Card
      variant="default"
      className={`cursor-grab active:cursor-grabbing ${disabled ? "pointer-events-none" : ""}`}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <CardContent className="flex gap-2 p-3">
        {draggable && (
          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
        )}
        <div className="min-w-0 flex-1">
          {href ? (
            <Link href={href} className="block hover:text-primary">
              {children}
            </Link>
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  );
}
