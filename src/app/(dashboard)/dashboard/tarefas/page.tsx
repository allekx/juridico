import type { Metadata } from "next";
import { withPermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { getCrmTeamMembers } from "@/lib/crm/queries";
import { getAgendaClients, getAgendaCases } from "@/lib/agenda/queries";
import { getTasks, getTaskStats } from "@/lib/tasks/queries";
import { parseTaskFilters } from "@/lib/tasks/filters";
import { TaskBoard } from "@/components/modules/tasks/task-board";

export const metadata: Metadata = {
  title: "Tarefas",
};

export default async function TarefasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await withPermission("tarefas:read");
  const canWrite = hasPermission(user.role, "tarefas:write");
  const params = await searchParams;
  const filters = parseTaskFilters(params);

  const [tasks, stats, teamMembers, clients, cases] = await Promise.all([
    getTasks(user.officeId, filters),
    getTaskStats(user.officeId, filters),
    getCrmTeamMembers(user.officeId),
    getAgendaClients(user.officeId),
    getAgendaCases(user.officeId),
  ]);

  return (
    <TaskBoard
      tasks={tasks}
      stats={stats}
      filters={filters}
      teamMembers={teamMembers}
      clients={clients}
      cases={cases}
      canWrite={canWrite}
      currentUserId={user.id}
    />
  );
}
