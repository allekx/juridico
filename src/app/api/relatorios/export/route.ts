import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessReportType } from "@/lib/reports/permissions";
import { parseReportFilters } from "@/lib/reports/filters";
import { getReportRowsForExport } from "@/lib/reports/queries";
import { reportToCsv } from "@/lib/reports/csv";
import type { ReportType } from "@/types/reports";

const VALID_TYPES: ReportType[] = [
  "clientes",
  "casos",
  "advogados",
  "financeiro",
  "leads",
];

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ReportType | null;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 });
  }

  if (!canAccessReportType(user.role, type)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const filters = parseReportFilters(
    Object.fromEntries(searchParams.entries())
  );

  const rows = await getReportRowsForExport(type, user.officeId, filters);
  const csv = reportToCsv(type, rows);

  const date = new Date().toISOString().slice(0, 10);
  const slug = type.replace(/[^a-z]/g, "-");
  const filename = `relatorio-${slug}-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
