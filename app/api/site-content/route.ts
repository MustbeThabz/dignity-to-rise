import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "../../lib/admin-auth";
import { getSiteContent, impactStatKeys, projectStatuses, saveSiteContent } from "../../lib/site-content";

export const dynamic = "force-dynamic";

const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  reference: z.string().trim().max(80).optional(),
  status: z.enum(projectStatuses),
  trancheOneOutcome: z.string().trim().max(800).optional(),
  futureTrancheOutcome: z.string().trim().max(800).optional(),
  goLiveTranche: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional()
});

const changemakerSchema = z.object({
  id: z.string().trim().min(1).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.").max(120),
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(160),
  organisation: z.string().trim().min(1).max(160),
  publishedAt: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid publication date."),
  image: z.string().trim().min(1).max(1000),
  imageAlt: z.string().trim().min(1).max(240),
  quote: z.string().trim().min(1).max(800),
  summary: z.string().trim().min(1).max(1200),
  body: z.string().trim().min(1).max(30000),
  projectLabel: z.string().trim().max(120).optional(),
  projectHref: z.string().trim().max(1000).optional()
});

const contentSchema = z.object({
  heroImage: z.string().trim().min(1).max(1000),
  heroKicker: z.string().trim().min(1).max(120), heroTitle: z.string().trim().min(1).max(180), heroIntro: z.string().trim().min(1).max(300), heroButtonText: z.string().trim().min(1).max(60),
  visionTitle: z.string().trim().min(1).max(180), visionCopy: z.string().trim().min(1).max(600), ctaTitle: z.string().trim().min(1).max(180), ctaCopy: z.string().trim().min(1).max(300),
  contactHeading: z.string().trim().min(1).max(160), contactCopy: z.string().trim().min(1).max(400),
  impactHeading: z.string().trim().min(1).max(100), impactStats: z.array(z.object({ key: z.enum(impactStatKeys).optional(), label: z.string().trim().min(1).max(50), value: z.string().trim().min(1).max(30) })).min(1).max(6),
  sectors: z.array(z.object({ title: z.string().trim().min(1).max(60), live: z.string().trim().min(1).max(20), done: z.string().trim().min(1).max(20), future: z.string().trim().min(1).max(20), image: z.string().trim().min(1).max(1000), liveProjects: z.array(z.string().trim().min(1).max(120)).max(30), doneProjects: z.array(z.string().trim().min(1).max(120)).max(30), futureProjects: z.array(z.string().trim().min(1).max(120)).max(30), projects: z.array(projectSchema).max(30).default([]) })).length(6),
  changemakers: z.array(changemakerSchema).min(1).max(60),
  featuredChangemakerId: z.string().trim().min(1).max(120)
}).superRefine((content, context) => {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  content.changemakers.forEach((story, index) => {
    if (ids.has(story.id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["changemakers", index, "id"], message: "Each Changemaker needs a unique ID." });
    if (slugs.has(story.slug)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["changemakers", index, "slug"], message: "Each Changemaker needs a unique URL slug." });
    ids.add(story.id);
    slugs.add(story.slug);
  });
  if (!ids.has(content.featuredChangemakerId)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["featuredChangemakerId"], message: "Choose a featured Changemaker for the homepage." });
  }
});

export async function GET() {
  return NextResponse.json(await getSiteContent());
}

export async function PUT(request: Request) {
  if (!isAdmin(request.headers.get("cookie"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = contentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please complete each content field." }, { status: 400 });
  try {
    await saveSiteContent(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not save site content", error);
    return NextResponse.json({ error: "Could not save content. Check the database settings." }, { status: 500 });
  }
}
