import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/admin-auth";
import { getSiteContent } from "../../../lib/site-content";

export const dynamic = "force-dynamic";

const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export async function GET(request: Request) {
  if (!isAdmin(request.headers.get("cookie"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const content = await getSiteContent();
  const rows = [
    ["Sector", "Status", "Project", "Image"],
    ...content.sectors.flatMap((sector) => [
      ...sector.liveProjects.map((project) => [sector.title, "Live", project, sector.image]),
      ...sector.doneProjects.map((project) => [sector.title, "Completed", project, sector.image]),
      ...sector.futureProjects.map((project) => [sector.title, "Future", project, sector.image])
    ])
  ];
  const csv = rows.map((row) => row.map(escape).join(";")).join("\r\n");
  return new NextResponse(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=dignity-to-rise-sectors.csv" } });
}
