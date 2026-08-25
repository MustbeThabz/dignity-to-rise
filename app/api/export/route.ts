import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { isAdmin } from "../../lib/admin-auth";
import { volunteersCollection } from "../../lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const collections = ["volunteers", "partners", "mentors", "funders"] as const;
type Collection = (typeof collections)[number];
type ExportRow = Record<string, string>;
const labels: Record<Collection, string> = { volunteers: "Volunteers", partners: "Partners", mentors: "Mentors", funders: "Funders" };
const date = (value: unknown) => value instanceof Date ? value.toISOString().slice(0, 10) : "";
const availability = (value: unknown) => Object.entries((value && typeof value === "object" ? value : {}) as Record<string, unknown>).filter(([, slots]) => Array.isArray(slots) && slots.length).map(([day, slots]) => `${day}: ${(slots as string[]).join(" / ")}`).join("; ");

async function getRows(collection: Collection): Promise<ExportRow[]> {
  const volunteers = await volunteersCollection();
  if (collection === "volunteers") return (await volunteers.find().sort({ submittedAt: -1 }).toArray()).map((item) => ({ "First name": String(item.firstName ?? ""), Surname: String(item.surname ?? ""), Email: String(item.email ?? ""), "Cell number": String(item.cellNumber ?? ""), "Causes / interests": Array.isArray(item.causes) ? item.causes.join("; ") : "", Availability: availability(item.availability), "Submitted date": date(item.submittedAt) }));
  const kind = collection === "funders" ? "contribution" : collection.slice(0, -1);
  return (await volunteers.db.collection("enquiries").find({ kind }).sort({ submittedAt: -1 }).toArray()).map((item) => ({ Name: String(item.name ?? ""), Email: String(item.email ?? ""), Phone: String(item.phone ?? ""), Organisation: String(item.organisation ?? ""), "Interest / contribution": String(item.interest ?? item.contributionType ?? ""), Availability: String(item.availability ?? ""), "Submitted date": date(item.submittedAt) }));
}

async function excel(title: string, rows: ExportRow[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Dignity to Rise";
  const sheet = workbook.addWorksheet(title);
  const columns = Object.keys(rows[0] ?? (title === "Volunteers" ? { "First name": "", Surname: "", Email: "", "Cell number": "", "Causes / interests": "", Availability: "", "Submitted date": "" } : { Name: "", Email: "", Phone: "", Organisation: "", "Interest / contribution": "", Availability: "", "Submitted date": "" }));
  sheet.columns = columns.map((header) => ({ header, key: header, width: Math.min(Math.max(header.length + 4, 18), 42) }));
  rows.forEach((row) => sheet.addRow(row));
  const heading = sheet.getRow(1); heading.font = { bold: true, color: { argb: "FFFFFFFF" } }; heading.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF006A4E" } };
  sheet.views = [{ state: "frozen", ySplit: 1 }]; sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + columns.length)}1` }; sheet.eachRow((row) => row.alignment = { vertical: "top", wrapText: true });
  return workbook.xlsx.writeBuffer();
}

function pdf(title: string, rows: ExportRow[]) {
  return new Promise<Buffer>((resolve, reject) => {
    const document = new PDFDocument({ size: "A4", margin: 48, info: { Title: `Dignity to Rise - ${title}` } }); const chunks: Buffer[] = [];
    document.on("data", (chunk: Buffer) => chunks.push(chunk)); document.on("end", () => resolve(Buffer.concat(chunks))); document.on("error", reject);
    document.fillColor("#006A4E").fontSize(24).text(`Dignity to Rise - ${title}`); document.fillColor("#75695C").fontSize(10).text(`Exported ${new Date().toLocaleDateString("en-CA")} - ${rows.length} record${rows.length === 1 ? "" : "s"}`).moveDown();
    if (!rows.length) document.fillColor("#333333").fontSize(12).text("No submissions have been received yet.");
    rows.forEach((row, index) => { if (document.y > 650) document.addPage(); const name = row.Name || `${row["First name"] ?? ""} ${row.Surname ?? ""}`.trim() || "Submission"; document.fillColor("#006A4E").fontSize(14).text(`${index + 1}. ${name}`); Object.entries(row).filter(([key]) => !["Name", "First name", "Surname"].includes(key)).forEach(([key, value]) => document.fillColor("#75695C").fontSize(9).text(`${key}: `, { continued: true }).fillColor("#333333").text(value || "-")); document.moveDown(0.75).strokeColor("#D8C7AC").lineWidth(0.5).moveTo(48, document.y).lineTo(547, document.y).stroke().moveDown(0.75); });
    document.end();
  });
}

export async function GET(request: Request) {
  if (!isAdmin(request.headers.get("cookie"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url); const collection = searchParams.get("collection") as Collection | null; const format = searchParams.get("format");
  if (!collection || !collections.includes(collection)) return NextResponse.json({ error: "Choose a valid collection." }, { status: 400 });
  if (format !== "xlsx" && format !== "pdf") return NextResponse.json({ error: "Choose Excel or PDF format." }, { status: 400 });
  try { const title = labels[collection]; const rows = await getRows(collection); const filename = `dignity-to-rise-${collection}`; if (format === "xlsx") return new NextResponse(new Uint8Array(await excel(title, rows)), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename=${filename}.xlsx` } }); return new NextResponse(new Uint8Array(await pdf(title, rows)), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename=${filename}.pdf` } }); } catch { return NextResponse.json({ error: "Could not export data. Check the database connection." }, { status: 500 }); }
}
