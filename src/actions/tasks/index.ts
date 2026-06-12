"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { withPermission } from "@/lib/auth/guards";
import { logCreate, logDelete, logUpdate } from "@/lib/audit/service";
import { taskSchema, updateTaskStatusSchema } from "@/schemas/tasks";
import type { ActionResult } from "@/types/auth";

function revalidateTasks() {
  revalidatePath("/dashboard/tarefas");
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard");
}

export async function createTaskAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await withPermission("tarefas:write");

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "PENDING",
    priority: formData.get("priority") || "MEDIUM",
    assignedToId: formData.get("assignedToId"),
    clientId: formData.get("clientId") || "",
    caseId: formData.get("caseId") || "",
    dueDate: formData.get("dueDate") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;
  const dueDate = data.dueDate ? new Date(`${data.dueDate}T12:00:00`) : null;
  const isCompleted = data.status === "COMPLETED";

  try {
    const task = await prisma.task.create({
      data: {
        officeId: user.officeId,
        title: data.title,
        description: data.description?.trim() || null,
        status: data.status,
        priority: data.priority,
        assignedToId: data.assignedToId,
        createdById: user.id,
        clientId: data.clientId || null,
        caseId: data.caseId || null,
        dueDate,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    await logCreate(user, "task", task.id, `Tarefa criada: ${task.title}`);

    revalidateTasks();
    return { success: true, data: { id: task.id } };
  } catch {
    return { success: false, error: "Erro ao criar tarefa" };
  }
}

export async function updateTaskAction(
  taskId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await withPermission("tarefas:write");

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "PENDING",
    priority: formData.get("priority") || "MEDIUM",
    assignedToId: formData.get("assignedToId"),
    clientId: formData.get("clientId") || "",
    caseId: formData.get("caseId") || "",
    dueDate: formData.get("dueDate") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const existing = await prisma.task.findFirst({
    where: { id: taskId, officeId: user.officeId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Tarefa não encontrada" };
  }

  const data = parsed.data;
  const dueDate = data.dueDate ? new Date(`${data.dueDate}T12:00:00`) : null;
  const isCompleted = data.status === "COMPLETED";

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description?.trim() || null,
        status: data.status,
        priority: data.priority,
        assignedToId: data.assignedToId,
        clientId: data.clientId || null,
        caseId: data.caseId || null,
        dueDate,
        completedAt: isCompleted ? (existing.completedAt ?? new Date()) : null,
      },
    });

    await logUpdate(
      user,
      "task",
      taskId,
      `Tarefa alterada: ${data.title}`,
      { status: data.status, priority: data.priority }
    );

    revalidateTasks();
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar tarefa" };
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
): Promise<ActionResult> {
  const user = await withPermission("tarefas:write");

  const parsed = updateTaskStatusSchema.safeParse({ taskId, status });
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" };
  }

  const existing = await prisma.task.findFirst({
    where: { id: taskId, officeId: user.officeId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Tarefa não encontrada" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: parsed.data.status,
      completedAt:
        parsed.data.status === "COMPLETED"
          ? existing.completedAt ?? new Date()
          : null,
    },
  });

  await logUpdate(
    user,
    "task",
    taskId,
    `Status da tarefa alterado: ${existing.title}`,
    { from: existing.status, to: parsed.data.status }
  );

  revalidateTasks();
  return { success: true };
}

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  const user = await withPermission("tarefas:write");

  const existing = await prisma.task.findFirst({
    where: { id: taskId, officeId: user.officeId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Tarefa não encontrada" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date(), status: "CANCELLED" },
  });

  await logDelete(user, "task", taskId, `Tarefa excluída: ${existing.title}`);

  revalidateTasks();
  return { success: true };
}
