import { NextResponse } from "next/server";
import { z } from "zod";
import { volunteersCollection } from "../../lib/mongodb";
import { uploadVolunteerRecord } from "../../lib/google-drive";

const schema = z.object({
  kind: z.enum(["partner", "mentor", "contribution"]), name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254),
  organisation: z.string().trim().max(160).optional().default(""), interest: z.string().trim().max(120).optional().default(""), message: z.string().trim().max(2000).optional().default(""),
  contributionType: z.enum(["money", "time", "services", "goods", "sponsor"]).optional(), phone: z.string().trim().max(40).optional().default(""), contactMethod: z.string().trim().max(40).optional().default(""), description: z.string().trim().max(2000).optional().default(""), availability: z.string().trim().max(80).optional().default("")
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success || (parsed.data.kind !== "contribution" && (!parsed.data.interest || !parsed.data.message)) || (parsed.data.kind === "contribution" && (!parsed.data.contributionType || !parsed.data.phone || !parsed.data.contactMethod || !parsed.data.description || !parsed.data.availability))) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    const record = { ...parsed.data, submittedAt: new Date() };
    const collection = await volunteersCollection();
    const result = await collection.db.collection("enquiries").insertOne(record);
    await uploadVolunteerRecord(`${record.kind}-enquiry-${result.insertedId}.json`, { ...record, id: result.insertedId.toString() });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Enquiry submission failed", error);
    return NextResponse.json({ error: "We could not send your request right now. Please try again." }, { status: 500 });
  }
}
