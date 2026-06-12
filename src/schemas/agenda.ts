import { z } from "zod";

const agendaTypes = ["HEARING", "MEETING", "DEADLINE", "RETURN"] as const;

export const agendaEventSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().min(2, "Título obrigatório").max(255),
    description: z.string().max(2000).optional(),
    type: z.enum(agendaTypes),
    location: z.string().max(500).optional(),
    date: z.string().min(1, "Data obrigatória"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
    lawyerId: z.string().uuid("Advogado obrigatório"),
    clientId: z.string().uuid().optional().or(z.literal("")),
    caseId: z.string().uuid().optional().or(z.literal("")),
    notifyEnabled: z.coerce.boolean().optional(),
    notifyMinutesBefore: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      const [sh, sm] = data.startTime.split(":").map(Number);
      const [eh, em] = data.endTime.split(":").map(Number);
      return eh * 60 + em > sh * 60 + sm;
    },
    { message: "Horário de término deve ser após o início", path: ["endTime"] }
  )
  .refine(
    (data) => !data.notifyEnabled || (data.notifyMinutesBefore ?? 0) > 0,
    {
      message: "Selecione quando deseja ser notificado",
      path: ["notifyMinutesBefore"],
    }
  );

export type AgendaEventInput = z.infer<typeof agendaEventSchema>;
