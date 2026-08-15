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
  impactStats: [{ label: "Projects completed", value: "14" }, { label: "Jobs created", value: "76" }, { label: "People impacted", value: "8,950+" }, { label: "Meals provided", value: "127,000+" }, { label: "People upskilled", value: "1,240+" }, { label: "Businesses supported", value: "36" }],
  sectors: [
    { title: "Agriculture & Food", live: "4", done: "2", future: "2", image: "/sectors/agriculture-food.jpg", liveProjects: ["Community growing hub", "Food skills workshops", "Local produce market", "Food garden support"], doneProjects: ["Seedling distribution pilot", "Harvest skills day"], futureProjects: ["Food preservation programme", "School garden network"] },
    { title: "Construction", live: "3", done: "1", future: "2", image: "/sectors/construction.jpg", liveProjects: ["Work-readiness training", "Home repair referrals", "Local contractor network"], doneProjects: ["Safety skills workshop"], futureProjects: ["Apprenticeship pathway", "Community repair days"] },
    { title: "Community", live: "5", done: "3", future: "2", image: "/sectors/community.jpg", liveProjects: ["Volunteer matching", "Neighbourhood clean-up", "Community listening circles", "Support referrals", "Local events calendar"], doneProjects: ["Community needs survey", "Volunteer welcome day", "Resource mapping"], futureProjects: ["Community leadership circle", "Youth action network"] },
    { title: "Digital & Remote", live: "3", done: "1", future: "4", image: "/sectors/digital-remote.jpg", liveProjects: ["Digital access support", "Remote-work readiness", "Online skills referrals"], doneProjects: ["Digital basics workshop"], futureProjects: ["Shared work hub", "Device access programme", "Digital mentoring", "Remote job pathway"] },
    { title: "Local Services", live: "4", done: "2", future: "2", image: "/sectors/local-services.jpg", liveProjects: ["Buy-local directory", "Small business referrals", "Service provider network", "Local skills exchange"], doneProjects: ["Business listening sessions", "Community market pilot"], futureProjects: ["Local procurement campaign", "Micro-business clinic"] },
    { title: "Tourism", live: "2", done: "2", future: "3", image: "/sectors/tourism.jpg", liveProjects: ["Visitor welcome training", "Local guide referrals"], doneProjects: ["Tourism skills day", "Community route mapping"], futureProjects: ["Tourism mentorships", "Local experience directory", "Hospitality pathway"] }
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
