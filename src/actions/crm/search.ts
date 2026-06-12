"use server";

import { withPermission } from "@/lib/auth/guards";
import { globalCrmSearch } from "@/lib/crm/queries";
import { globalSearchSchema } from "@/schemas/crm";
import type { ActionResult } from "@/types/auth";
import type { CrmSearchResult } from "@/types/crm";

export async function globalSearchAction(
  query: string
): Promise<ActionResult<CrmSearchResult>> {
  const user = await withPermission("crm:read");
  const parsed = globalSearchSchema.safeParse({ q: query });
  if (!parsed.success) {
    return { success: true, data: { leads: [], clients: [], cases: [] } };
  }

  try {
    const data = await globalCrmSearch(user.officeId, parsed.data.q);
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro na busca" };
  }
}
