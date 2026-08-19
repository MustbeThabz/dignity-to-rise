import { NextResponse } from "next/server";
import { z } from "zod";
import { volunteersCollection } from "../../lib/mongodb";
import { sendAcknowledgement } from "../../lib/email";

const schema = z.object({ email: z.string().trim().email().max(254) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  try {
    const collection = await volunteersCollection();
    await collection.db.collection("newsletter_subscribers").updateOne(
      { email: parsed.data.email.toLowerCase() },
      { $setOnInsert: { email: parsed.data.email.toLowerCase(), subscribedAt: new Date() } },
      { upsert: true }
    );
    await sendAcknowledgement({ email: parsed.data.email, formName: "mailing list registration" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return NextResponse.json({ error: "We could not save your email right now. Please try again." }, { status: 500 });
  }
}
