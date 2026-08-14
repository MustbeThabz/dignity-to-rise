import { NextResponse } from "next/server";
import { isAdmin } from "../../lib/admin-auth";
import { volunteersCollection } from "../../lib/mongodb";

export const dynamic = "force-dynamic";
const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const date = (value: unknown) => value instanceof Date ? value.toISOString().slice(0, 10) : "";
export async function GET(request: Request) {
  if (!isAdmin(request.headers.get("cookie"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const volunteers = await volunteersCollection(); const enquiries = volunteers.db.collection("enquiries"); const [v, e] = await Promise.all([volunteers.find().toArray(), enquiries.find().toArray()]); const header = ["Type", "Name", "Email", "Phone", "Organisation", "Interest / contribution", "Availability", "Submitted date"]; const rows = [...v.map((item) => ["Volunteer", `${item.firstName ?? ""} ${item.surname ?? ""}`.trim(), item.email, item.cellNumber, "", (item.causes ?? []).join("; "), Object.entries(item.availability ?? {}).filter(([, slots]) => Array.isArray(slots) && slots.length > 0).map(([day, slots]) => `${day}: ${(slots as string[]).join(" / ")}`).join("; "), date(item.submittedAt)]), ...e.map((item) => [item.kind === "contribution" ? "Funder" : item.kind, item.name, item.email, item.phone, item.organisation, item.interest || item.contributionType, item.availability, date(item.submittedAt)])]; const csv = [header, ...rows].map((row) => row.map(escape).join(";")).join("\r\n"); return new NextResponse(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=dignity-to-rise-submissions.csv" } }); } catch { return NextResponse.json({ error: "Could not export data. Check the database connection." }, { status: 500 }); }
}
