import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/admin-auth";
import { getSiteContent, type SectorCard, type SectorProject } from "../../../lib/site-content";

export const dynamic = "force-dynamic";

const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const legacyProjects = (sector: SectorCard): SectorProject[] => [
  ...sector.liveProjects.map((name) => ({ name, status: "Live" as const })),
  ...sector.doneProjects.map((name) => ({ name, status: "Complete" as const })),
  ...sector.futureProjects.map((name) => ({ name, status: "Future" as const }))
];

export async function GET(request: Request) {
  if (!isAdmin(request.headers.get("cookie"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const content = await getSiteContent();
  const rows = [
    ["Sector", "Project", "Reference", "Status", "Outcome of Tranche 1", "Outcome of Future Tranche", "Which Tranche will project go live?", "Notes", "Image"],
    ...content.sectors.flatMap((sector) => (sector.projects?.length ? sector.projects : legacyProjects(sector)).map((project) => [
      sector.title,
      project.name,
      project.reference ?? "",
      project.status,
      project.trancheOneOutcome ?? "",
      project.futureTrancheOutcome ?? "",
      project.goLiveTranche ?? "",
      project.notes ?? "",
      sector.image
    ]))
  ];
  const csv = rows.map((row) => row.map(escape).join(";")).join("\r\n");
  return new NextResponse(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=dignity-to-rise-sectors.csv" } });
}
