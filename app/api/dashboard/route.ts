import { NextResponse } from "next/server";
import { isAdmin } from "../../lib/admin-auth";
import { volunteersCollection } from "../../lib/mongodb";

export const dynamic = "force-dynamic";

type Submission = { id: string; name: string; email: string; type: string; submittedAt: string; availability?: string };

export async function GET(request: Request) {
  if (!isAdmin(request.headers.get("cookie"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const volunteers = await volunteersCollection();
    const enquiries = volunteers.db.collection("enquiries");
    const [volunteerCount, enquiryCounts, recentVolunteers, recentEnquiries, availability] = await Promise.all([
      volunteers.countDocuments(),
      enquiries.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$kind", count: { $sum: 1 } } }]).toArray(),
      volunteers.find({}, { projection: { firstName: 1, surname: 1, email: 1, submittedAt: 1, availability: 1 } }).sort({ submittedAt: -1 }).limit(8).toArray(),
      enquiries.find({}, { projection: { name: 1, email: 1, kind: 1, submittedAt: 1 } }).sort({ submittedAt: -1 }).limit(8).toArray(),
      volunteers.aggregate<{ _id: string; count: number }>([
        { $project: { slots: { $reduce: { input: { $objectToArray: "$availability" }, initialValue: [], in: { $concatArrays: ["$$value", "$this.v"] } } } } },
        { $unwind: "$slots" }, { $group: { _id: "$slots", count: { $sum: 1 } } }, { $sort: { count: -1 } }
      ]).toArray()
    ]);
    const counts = Object.fromEntries(enquiryCounts.map((item) => [item._id, item.count]));
    const records: Submission[] = [
      ...recentVolunteers.map((item) => ({ id: item._id.toString(), name: `${item.firstName} ${item.surname}`, email: item.email, type: "Volunteer", submittedAt: item.submittedAt?.toISOString?.() ?? "", availability: Object.entries(item.availability ?? {}).filter(([, slots]) => Array.isArray(slots) && slots.length > 0).map(([day, slots]) => `${day}: ${(slots as string[]).join(", ")}`).join(" · ") })),
      ...recentEnquiries.map((item) => ({ id: item._id.toString(), name: item.name, email: item.email, type: item.kind === "contribution" ? "Funder" : item.kind[0].toUpperCase() + item.kind.slice(1), submittedAt: item.submittedAt?.toISOString?.() ?? "" }))
    ].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 10);
    return NextResponse.json({ connected: true, counts: { volunteers: volunteerCount, partners: counts.partner ?? 0, mentors: counts.mentor ?? 0, funders: counts.contribution ?? 0 }, availability: availability.map((item) => ({ slot: item._id, count: item.count })), records });
  } catch (error) {
    console.error("Could not load dashboard data", error);
    return NextResponse.json({ connected: false, counts: { volunteers: 0, partners: 0, mentors: 0, funders: 0 }, availability: [], records: [] });
  }
}
