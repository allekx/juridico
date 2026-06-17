"use client";
import { EMPTY_VALUE } from "@/constants/copy";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskFilters } from "@/components/modules/tasks/task-filters";
import { TaskFormDialog } from "@/components/modules/tasks/task-form-dialog";
import { TaskStatusSelect } from "@/components/modules/tasks/task-status-select";
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_VARIANT,
  TASK_STATUS_OPTIONS,
} from "@/constants/tasks";
import type { TaskRow, TaskStats, TaskListFilters } from "@/types/tasks";
import type { CrmTeamMember } from "@/types/crm";
import type { AgendaSelectOption } from "@/lib/agenda/queries";

interface TaskBoardProps {
  tasks: TaskRow[];
  stats: TaskStats;
  filters: TaskListFilters;
  teamMembers: CrmTeamMember[];
  clients: AgendaSelectOption[];
  cases: AgendaSelectOption[];
  canWrite: boolean;
  currentUserId: string;
}

function formatDate(iso: string | null) {
  if (!iso) return EMPTY_VALUE;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function TaskBoard({
  tasks,
  stats,
  filters,
  teamMembers,
  clients,
  cases,
  canWrite,
  currentUserId,
}: TaskBoardProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRow | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(task: TaskRow) {
    setEditing(task);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Tarefas</h2>
          <p className="text-sm text-muted-foreground">
            Gestão interna vinculada a clientes, processos e advogados
          </p>
        </div>
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova tarefa
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {TASK_STATUS_OPTIONS.map((s) => {
          const count =
            s.value === "PENDING"
              ? stats.pending
              : s.value === "IN_PROGRESS"
                ? stats.inProgress
                : stats.completed;

          return (
            <div
              key={s.value}
              className="rounded-lg border border-border/60 bg-card p-4"
            >
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-display text-2xl font-semibold">{count}</p>
            </div>
          );
        })}
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <p className="text-sm text-muted-foreground">Total filtrado</p>
          <p className="font-display text-2xl font-semibold">{stats.total}</p>
        </div>
      </div>

      <TaskFilters
        filters={filters}
        teamMembers={teamMembers}
        clients={clients}
        cases={cases}
      />

      <div className="ds-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarefa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Processo</TableHead>
              <TableHead>Prazo</TableHead>
              {canWrite && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canWrite ? 8 : 7}
                  className="py-12 text-center text-muted-foreground"
                >
                  Nenhuma tarefa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="max-w-[220px]">
                    <p className="font-medium line-clamp-2">{task.title}</p>
                    {task.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <TaskStatusSelect
                      taskId={task.id}
                      currentStatus={task.status}
                      canWrite={canWrite}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={TASK_PRIORITY_VARIANT[task.priority]}>
                      {TASK_PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{task.assignedToName}</TableCell>
                  <TableCell className="text-sm">
                    {task.clientId ? (
                      <Link
                        href={`/dashboard/documentos/${task.clientId}`}
                        className="text-primary hover:underline"
                      >
                        {task.clientName}
                      </Link>
                    ) : (
                      EMPTY_VALUE
                    )}
                  </TableCell>
                  <TableCell className="max-w-[160px] text-sm">
                    {task.caseTitle ? (
                      <span className="line-clamp-2">{task.caseTitle}</span>
                    ) : (
                      EMPTY_VALUE
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(task.dueDate)}
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        teamMembers={teamMembers}
        clients={clients}
        cases={cases}
        defaultAssigneeId={currentUserId}
      />
    </div>
  );
}
