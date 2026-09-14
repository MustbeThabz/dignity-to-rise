import { NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
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
  try {
    const collection = await volunteersCollection();
    const bucket = new GridFSBucket(collection.db, { bucketName: "media_files" });
    const upload = bucket.openUploadStream(file.name, { contentType: file.type, metadata: { kind: "image" } });
    const bytes = Buffer.from(await file.arrayBuffer());
    await new Promise<void>((resolve, reject) => {
      upload.once("error", reject);
      upload.once("finish", () => resolve());
      upload.end(bytes);
    });
    const url = `/api/media/${upload.id.toString()}`;
    const createdAt = new Date();
    const result = await collection.db.collection("media").insertOne({ kind: "image", name: file.name, url, size: file.size, contentType: file.type, storageId: upload.id, createdAt });
    return NextResponse.json({ id: result.insertedId.toString(), name: file.name, url, size: file.size, createdAt });
  } catch (error) {
    console.error("Could not persist uploaded image", error);
    return NextResponse.json({ error: "The image could not be saved. Please try again." }, { status: 503 });
  }
}
