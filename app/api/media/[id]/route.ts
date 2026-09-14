import { GridFSBucket, ObjectId } from "mongodb";
import { volunteersCollection } from "../../../lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!ObjectId.isValid(params.id)) return new Response("Not found", { status: 404 });
  try {
    const collection = await volunteersCollection();
    const bucket = new GridFSBucket(collection.db, { bucketName: "media_files" });
    const file = await collection.db.collection("media_files.files").findOne({ _id: new ObjectId(params.id) });
    if (!file) return new Response("Not found", { status: 404 });
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      const download = bucket.openDownloadStream(file._id);
      download.on("data", (chunk: Buffer) => chunks.push(chunk));
      download.once("error", reject);
      download.once("end", () => resolve());
    });
    return new Response(Buffer.concat(chunks), {
      headers: {
        "Content-Type": file.contentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    console.error("Could not retrieve uploaded image", error);
    return new Response("Not found", { status: 404 });
  }
}
