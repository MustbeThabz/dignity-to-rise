import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { isAdmin } from "../../lib/admin-auth";
import { volunteersCollection } from "../../lib/mongodb";

export const dynamic = "force-dynamic";
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET(request: Request) {
  if (!isAdmin(request.headers.get("cookie"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const collection = await volunteersCollection(); const images = await collection.db.collection("media").find({ kind: "image" }).sort({ createdAt: -1 }).toArray(); return NextResponse.json(images.map(({ _id, name, url, size, createdAt }) => ({ id: _id.toString(), name, url, size, createdAt }))); } catch { return NextResponse.json([]); }
}

export async function POST(request: Request) {
  if (!isAdmin(request.headers.get("cookie"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File) || !allowed.has(file.type) || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Upload a JPG, PNG, or WebP image under 8 MB." }, { status: 400 });
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-"); const filename = `${Date.now()}-${safeName}`; const url = `/uploads/${filename}`;
  await mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true }); await writeFile(path.join(process.cwd(), "public", "uploads", filename), Buffer.from(await file.arrayBuffer()));
  try { const collection = await volunteersCollection(); const result = await collection.db.collection("media").insertOne({ kind: "image", name: file.name, url, size: file.size, createdAt: new Date() }); return NextResponse.json({ id: result.insertedId.toString(), name: file.name, url, size: file.size, createdAt: new Date() }); } catch { return NextResponse.json({ name: file.name, url, size: file.size, createdAt: new Date() }); }
}
