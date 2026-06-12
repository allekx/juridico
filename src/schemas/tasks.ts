import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2, "Título obrigatório").max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assignedToId: z.string().uuid("Responsável obrigatório"),
  clientId: z.string().uuid().optional().or(z.literal("")),
  caseId: z.string().uuid().optional().or(z.literal("")),
  dueDate: z.string().optional(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});

export type TaskInput = z.infer<typeof taskSchema>;
