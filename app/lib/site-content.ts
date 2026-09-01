import { siteContentCollection } from "./mongodb";

export type SectorCard = {
  title: string;
  live: string;
  done: string;
  future: string;
  image: string;
  liveProjects: string[];
  doneProjects: string[];
  futureProjects: string[];
};

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
  sectors: SectorCard[];
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
  impactStats: [{ label: "Projects completed", value: "0" }, { label: "Jobs created", value: "0" }, { label: "People impacted", value: "0" }, { label: "Meals provided", value: "0" }, { label: "People upskilled", value: "0" }, { label: "Businesses supported", value: "0" }],
  sectors: [
    { title: "Agriculture & Food", live: "1", done: "0", future: "1", image: "/sectors/agriculture-food-tile.jpg", liveProjects: ["Central Growzone"], doneProjects: [], futureProjects: ["Community Growzone"] },
    { title: "Construction", live: "0", done: "0", future: "1", image: "/sectors/construction-tile.jpg", liveProjects: [], doneProjects: [], futureProjects: ["Community Business Hubs"] },
    { title: "Community", live: "1", done: "0", future: "0", image: "/sectors/community-tile.jpg", liveProjects: ["Feeding Co-ordination"], doneProjects: [], futureProjects: [] },
    { title: "Digital & Remote", live: "3", done: "0", future: "0", image: "/sectors/digital-remote-tile.jpg", liveProjects: ["Dignity to Rise Hub", "Little Black Book - Community Organisations", "Project Register & KPIs"], doneProjects: [], futureProjects: [] },
    { title: "Local Services", live: "0", done: "0", future: "0", image: "/sectors/local-services-tile.jpg", liveProjects: [], doneProjects: [], futureProjects: [] },
    { title: "Tourism", live: "1", done: "0", future: "0", image: "/sectors/tourism-tile.jpg", liveProjects: ["Hermanus Passport"], doneProjects: [], futureProjects: [] }
  ]
};

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const collection = await siteContentCollection();
    const stored = await collection.findOne({ key: "homepage" });
    const storedContent = stored?.content ?? {};
    return {
      ...defaultSiteContent,
      ...storedContent,
      sectors: defaultSiteContent.sectors.map((sector, index) => ({ ...sector, ...(storedContent.sectors?.[index] ?? {}) }))
    };
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
