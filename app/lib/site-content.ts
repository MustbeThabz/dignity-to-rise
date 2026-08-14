import { siteContentCollection } from "./mongodb";

export type SiteContent = {
  heroImage: string;
  heroKicker: string;
  heroTitle: string;
  heroIntro: string;
  heroButtonText: string;
  visionTitle: string;
  visionCopy: string;
  ctaTitle: string;
  ctaCopy: string;
  contactHeading: string;
  contactCopy: string;
  impactHeading: string;
  impactStats: { label: string; value: string }[];
};

export const defaultSiteContent: SiteContent = {
  heroImage: "/hero-overstrand-clean.png",
  heroKicker: "A community movement for the Overstrand",
  heroTitle: "A dignified life. A thriving Overstrand.",
  heroIntro: "Together, we turn local energy into shared opportunity.",
  heroButtonText: "Join the movement",
  visionTitle: "A place where everyone can rise.",
  visionCopy: "We bring people, skills and resources together to build an Overstrand where everyone can live, work, visit and belong with dignity.",
  ctaTitle: "The future of the Overstrand will not be built by one organisation.",
  ctaCopy: "It will be built by thousands of people, working together.",
  contactHeading: "People, not forms.",
  contactCopy: "Reach out to us directly — we would love to hear from you.",
  impactHeading: "The movement in numbers",
  impactStats: [{ label: "Projects completed", value: "14" }, { label: "Jobs created", value: "76" }, { label: "People impacted", value: "8,950+" }, { label: "Meals provided", value: "127,000+" }, { label: "People upskilled", value: "1,240+" }, { label: "Businesses supported", value: "36" }]
};

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const collection = await siteContentCollection();
    const stored = await collection.findOne({ key: "homepage" });
    return { ...defaultSiteContent, ...(stored?.content ?? {}) };
  } catch (error) {
    // The public website keeps working with its default copy until MongoDB is configured.
    console.error("Could not load site content", error);
    return defaultSiteContent;
  }
}

export async function saveSiteContent(content: SiteContent) {
  const collection = await siteContentCollection();
  await collection.updateOne(
    { key: "homepage" },
    { $set: { content, updatedAt: new Date() }, $setOnInsert: { key: "homepage" } },
    { upsert: true }
  );
}
