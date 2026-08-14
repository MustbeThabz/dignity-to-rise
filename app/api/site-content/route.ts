import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "../../lib/admin-auth";
import { getSiteContent, saveSiteContent } from "../../lib/site-content";

export const dynamic = "force-dynamic";

const contentSchema = z.object({
  heroImage: z.string().trim().min(1).max(1000),
  heroKicker: z.string().trim().min(1).max(120), heroTitle: z.string().trim().min(1).max(180), heroIntro: z.string().trim().min(1).max(300), heroButtonText: z.string().trim().min(1).max(60),
  visionTitle: z.string().trim().min(1).max(180), visionCopy: z.string().trim().min(1).max(600), ctaTitle: z.string().trim().min(1).max(180), ctaCopy: z.string().trim().min(1).max(300),
  contactHeading: z.string().trim().min(1).max(160), contactCopy: z.string().trim().min(1).max(400),
  impactHeading: z.string().trim().min(1).max(100), impactStats: z.array(z.object({ label: z.string().trim().min(1).max(50), value: z.string().trim().min(1).max(30) })).min(1).max(6)
});

export async function GET() {
  return NextResponse.json(await getSiteContent());
}

export async function PUT(request: Request) {
  if (!isAdmin(request.headers.get("cookie"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = contentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please complete each content field." }, { status: 400 });
  try {
    await saveSiteContent(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not save site content", error);
    return NextResponse.json({ error: "Could not save content. Check the database settings." }, { status: 500 });
  }
}
