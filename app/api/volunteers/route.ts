import { NextResponse } from "next/server";
import { z } from "zod";
import { volunteersCollection } from "../../lib/mongodb";
import { uploadVolunteerRecord } from "../../lib/google-drive";
import { sendAcknowledgement } from "../../lib/email";

const availability = z.record(z.string(), z.array(z.enum(["morning", "afternoon", "evening"])));
const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  surname: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  cellNumber: z.string().trim().min(7).max(30),
  suburb: z.string().trim().min(1).max(100),
  frequency: z.array(z.enum(["Once-off", "Occasionally (as needed)", "Monthly", "Weekly", "More than once a week"])).min(1),
  availability,
  causes: z.array(z.string().max(60)).min(1),
  otherSupport: z.string().trim().max(2000).optional().default(""),
  contactMethods: z.array(z.enum(["WhatsApp", "Email", "Phone Call", "SMS"])).min(1),
  consent: z.literal(true)
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });

    const record = { ...parsed.data, submittedAt: new Date() };
    const collection = await volunteersCollection();
    const result = await collection.insertOne(record);
    const sentToDrive = await uploadVolunteerRecord(`volunteer-${result.insertedId}.json`, { ...record, id: result.insertedId.toString() });
    await sendAcknowledgement({ email: record.email, name: record.firstName, formName: "volunteer registration" });

    return NextResponse.json({ ok: true, sentToDrive });
  } catch (error) {
    console.error("Volunteer submission failed", error);
    return NextResponse.json({ error: "We could not submit your form right now. Please try again." }, { status: 500 });
  }
}
