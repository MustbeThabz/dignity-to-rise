import { NextResponse } from "next/server";
import { volunteersCollection } from "../../lib/mongodb";

export const dynamic = "force-dynamic";

// The public site only needs the aggregate registration count; no volunteer data is exposed.
export async function GET() {
  try {
    const volunteers = await volunteersCollection();
    return NextResponse.json({ volunteers: await volunteers.countDocuments() });
  } catch (error) {
    console.error("Could not load public volunteer count", error);
    return NextResponse.json({ error: "Volunteer registrations are temporarily unavailable." }, { status: 503 });
  }
}
