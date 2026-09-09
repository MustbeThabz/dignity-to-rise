import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { volunteersCollection } from "../../../../lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAdmin(request.headers.get("cookie"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Invalid record." }, { status: 400 });

  try {
    const volunteers = await volunteersCollection();
    const id = new ObjectId(params.id);
    // ObjectIds are unique across collections, so no client-supplied category
    // is needed. This also handles records created before the current labels.
    const [volunteerResult, enquiryResult] = await Promise.all([
      volunteers.deleteOne({ _id: id }),
      volunteers.db.collection("enquiries").deleteOne({ _id: id })
    ]);
    if (!volunteerResult.deletedCount && !enquiryResult.deletedCount) return NextResponse.json({ error: "This record was already removed or could not be found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete dashboard record", error);
    return NextResponse.json({ error: "Could not delete this record. Please try again." }, { status: 500 });
  }
}
