import { siteContentCollection } from "./mongodb";

export const projectStatuses = ["Planning", "Live", "Complete", "Future"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const impactStatKeys = ["projects-started", "jobs-created", "people-upskilled", "ngos-contacted", "volunteers-registered", "projects-in-planning"] as const;
export type ImpactStatKey = (typeof impactStatKeys)[number];

export type ImpactStat = {
  key?: ImpactStatKey;
  label: string;
  value: string;
};

export type ChangemakerStory = {
  id: string;
  slug: string;
  name: string;
  role: string;
  organisation: string;
  publishedAt: string;
  image: string;
  imageAlt: string;
  quote: string;
  summary: string;
  body: string;
  projectLabel?: string;
  projectHref?: string;
};

export type SectorProject = {
  name: string;
  reference?: string;
  status: ProjectStatus;
  trancheOneOutcome?: string;
  futureTrancheOutcome?: string;
  goLiveTranche?: string;
  notes?: string;
};

export type SectorCard = {
  title: string;
  live: string;
  done: string;
  future: string;
  image: string;
  liveProjects: string[];
  doneProjects: string[];
  futureProjects: string[];
  projects: SectorProject[];
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
  impactStats: ImpactStat[];
  sectors: SectorCard[];
  changemakers: ChangemakerStory[];
  featuredChangemakerId: string;
};

function createSector(title: string, image: string, projects: SectorProject[]): SectorCard {
  const liveProjects = projects.filter((project) => project.status === "Live").map((project) => project.name);
  const doneProjects = projects.filter((project) => project.status === "Complete").map((project) => project.name);
  const futureProjects = projects.filter((project) => project.status === "Planning" || project.status === "Future").map((project) => project.name);
  return {
    title,
    image,
    projects,
    live: String(liveProjects.length),
    done: String(doneProjects.length),
    future: String(futureProjects.length),
    liveProjects,
    doneProjects,
    futureProjects
  };
}

const baseImpactStats: SiteContent["impactStats"] = [
  { key: "projects-started", label: "Projects started", value: "6" },
  { key: "jobs-created", label: "Jobs created", value: "1" },
  { key: "people-upskilled", label: "People upskilled", value: "2" },
  { key: "ngos-contacted", label: "NGOs contacted", value: "-" },
  { label: "Volunteers registered", value: "—" },
  { key: "projects-in-planning", label: "Projects in planning", value: "8" }
];

const defaultImpactStats: SiteContent["impactStats"] = baseImpactStats.map((stat, index) => index === 4 ? { ...stat, key: "volunteers-registered", value: "21" } : stat);

const noxoloLiwaniStory: ChangemakerStory = {
  id: "noxolo-liwani-september-2026",
  slug: "noxolo-liwani",
  name: "Noxolo Liwani",
  role: "Local Economic Development Officer",
  organisation: "Overstrand Municipality",
  publishedAt: "2026-09-01",
  image: "/team/noxolo-liwani-feature.png",
  imageAlt: "Portrait of Noxolo Liwani, Local Economic Development Officer at Overstrand Municipality",
  quote: "My purpose is simple: to help drive out inequality, poverty and unemployment, one opportunity at a time.",
  summary: "She came to Hermanus for a weekend away and never left, opening doors for traders, growers, designers and school-leavers with real talent and nowhere to take it.",
  body: `## Thirteen years of building opportunity in the Overstrand

There are two Overstrands, and most visitors only ever meet one: the cliff path, whales in Walker Bay and the Hemel-en-Aarde wine farms. But behind that postcard view are informal traders, growers, young people looking for their first opportunity and local families building livelihoods with determination and skill.

That distance is where Dignity to Rise works. In the first Changemakers of the Overstrand conversation, Noxolo Liwani shares what has kept her working to close it: practical opportunities, reliable partnerships and a belief that people should be able to build a future where they live.

## Tell us about yourself. What inspired you to make a difference?

I am a young, vibrant woman who came to Hermanus for a weekend away and fell in love with it: a place where I found beauty and peace, and one that resonated with where I come from. More than anything, I saw real potential for growth and opportunity.

It was only later that I witnessed the stark divide between coastal wealth and township poverty: brilliant, talented local youth who lacked access to the very spaces where their lives could change for the better. I saw local women baking vetkoek, tending endless braai fires and selling second-hand clothes along the pavements, all trying to make ends meet. That gave me a different lens through which to see the Overstrand: a place of great beauty and potential, but with a deep societal and lifestyle gap.

I was inspired to step up when I realised that talent in the Overstrand is evenly distributed, but opportunity is not.

I have spent over thirteen years working in local economic development and community-facing roles at Overstrand Municipality, starting in an administrative support capacity and growing into a role that today spans SMME and enterprise support, informal economy management, investment facilitation, sector development across tourism, agriculture and fisheries, job creation through EPWP, and partnership brokering with organisations.

What has kept me in this space isn't the paperwork. It's the people behind it: the SMME owners trying to formalise a small business, the EPWP participants looking for a foothold into steady work, and the community members who simply want to be heard by their municipality. That's what pulled me toward this work, and what keeps me showing up for it every day.

## What project are you most proud of, and why?

The opening of the Multi-Purpose Centre at the New Harbour.

We didn't just hand out aid. We created a space where local youth could build their own future, where vendors and crafters were given dignity and a proper place to trade, and where free WiFi and computers gave people access to opportunities they otherwise couldn't reach, whether that meant applying to a tertiary institution, registering a business or applying for funding.

Beyond that, I've had the privilege of walking alongside many emerging entrepreneurs and watching them grow: sourcing industrial machines for fashion designers, cooking equipment for caterers, training and skills development for traders, start-up equipment and training for emerging plant growers, and funding and Asset Assist applications for trading stallholders. One outcome I'm especially proud of is a mushroom grower who, through collaboration and partnership, built a genuinely successful enterprise.

I've also helped establish a unit supporting local artists, musicians and crafters, creating cultural events that give young people a real path to pursue their goals in the arts and culture space. And I supervise a unit supporting emerging farmers, where I used EPWP grant funding to place a qualified graduate on the ground to give farmers direct, accredited technical advice and support.

That work was recognised when I was awarded by the province as the top achiever for exceeding set job-creation targets. But the number that matters most to me is the people behind it and how many of them are still building on what they started.

## If you could make one big change in the Overstrand, what would it be?

I'd want to see informal economic activity, small-scale agriculture, informal trade and emerging enterprises operating outside formal zoning or business structures, properly bridged into the formal economy, rather than left in a grey area where it is neither supported nor regulated.

Right now, many people doing this kind of work carry real economic value for their households and communities. But without a pathway to formalise, they can't access funding, they can't be protected by proper land-use planning, and the municipality can't plan around them either.

I'd want to see a coordinated approach: LED, Town Planning, Environmental, Property Management, Infrastructure, private partnerships and ward-level structures working together to identify these activities, understand what people actually need, and build a real path toward formalisation or, where appropriate, alternative livelihood support.

## What would you say to someone who wants to help but isn't sure how?

Start local and start small.

You don't need a title or a big platform. Most of the change I've seen happen in this space starts with someone showing up to a ward committee meeting, volunteering time with an existing community organisation, or simply listening to what people in their own area actually need before deciding what to offer.

Municipalities and NGOs are almost always looking for people willing to help with practical, unglamorous things: documentation, mentoring, translation, access to spaces, and bridging the gap between the CBDs and local communities. That's often where the real impact starts.

The main thing is not to wait until you feel fully qualified. Get involved where you are, and the direction usually becomes clearer once you're in it.`
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
  contactCopy: "Reach out to us directly, we would love to hear from you.",
  impactHeading: "The movement in numbers",
  impactStats: defaultImpactStats,
  changemakers: [noxoloLiwaniStory],
  featuredChangemakerId: noxoloLiwaniStory.id,
  sectors: [
    createSector("Agriculture & Food", "/sectors/agriculture-food-tile.jpg", [
      { name: "Central Growzone", reference: "1.1", status: "Live", trancheOneOutcome: "Funding and site by mid-September; confirm the ground-breaking date.", futureTrancheOutcome: "Central Growzone up and running.", notes: "A site on private land has been identified; land and funding applications have been submitted." },
      { name: "Community Growzone", reference: "1.2", status: "Planning", trancheOneOutcome: "Identify one ECD site as a pilot.", futureTrancheOutcome: "Seedling nursery and two community growzones up and running.", notes: "Municipal sites are being investigated, and community organisations have been contacted about possible sites." },
      { name: "Household Food Waste Collection", reference: "1.10", status: "Planning", trancheOneOutcome: "Secure a composting site away from baboons and appoint the right person.", notes: "A bakkie is available; a driver, bins and composting knowledge are still needed. Start with restaurants, then households. Sybil will send details to Alex." }
    ]),
    createSector("Construction", "/sectors/construction-tile.jpg", [
      { name: "Community Business Hubs", reference: "1.3", status: "Planning", trancheOneOutcome: "Submit a proposal for three Small Business Hubs to the municipality.", futureTrancheOutcome: "Establish the first Small Business Hub.", notes: "Proposal needed by the end of August." }
    ]),
    createSector("Community", "/sectors/community-tile.jpg", [
      { name: "Feeding Co-ordination", reference: "4.14", status: "Planning", trancheOneOutcome: "Understand current provision and the shortfall.", futureTrancheOutcome: "Food needs sustainably and fully met, 365 days a year." },
      { name: "Film-Maker Workshop (6 months)", reference: "6.17", status: "Live", trancheOneOutcome: "Two individuals are part way through media training." },
      { name: "Substance Abuse Programme", reference: "4.9", status: "Planning", trancheOneOutcome: "Outline agreed with the municipality." }
    ]),
    createSector("Digital & Remote", "/sectors/digital-remote-tile.jpg", [
      { name: "Dignity to Rise Hub", reference: "3.1", status: "Live", trancheOneOutcome: "Create an online hub to co-ordinate projects, volunteers and funding.", notes: "The webpage is up and running and will be completed in Tranche 1." },
      { name: "Little Black Book, Community Organisations", reference: "4.1, 5.2 & 7.3", status: "Live", trancheOneOutcome: "NGO needs captured and visible.", futureTrancheOutcome: "Dedicated digital Black Book created.", notes: "All known NGOs contacted." },
      { name: "Project Register & KPIs", reference: "3.13 & 3.14", status: "Live", trancheOneOutcome: "Project list and KPIs live on the hub.", notes: "Project list shared with the community." }
    ]),
    createSector("Local Services", "/sectors/local-services-tile.jpg", [
      { name: "Internship & Workplace Exposure Programme", reference: "5.3", status: "Planning", trancheOneOutcome: "First intern recruited.", futureTrancheOutcome: "Wider scheme developed and implemented." }
    ]),
    createSector("Tourism", "/sectors/tourism-tile.jpg", [
      { name: "Hermanus Passport", reference: "6.1", status: "Live", trancheOneOutcome: "Permission for physical sites given by the municipality.", futureTrancheOutcome: "Physical and digital passport available." },
      { name: "Overberg Fashion Academy & Fashion Week", reference: "6.9 & 6.10", status: "Planning" },
      { name: "Winter Tourism Strategy", reference: "6.13", status: "Planning" },
      { name: "Food Truck Idea, Up the Vibe", status: "Future", trancheOneOutcome: "Identify a site, starting with the Friday market behind the school." },
      { name: "Dutchies Park Community Trust", status: "Future", trancheOneOutcome: "Develop the Community Trust concept for security, maintenance, a food kiosk and a service provider.", notes: "Next step: prepare a more complete proposal." }
    ])
  ]
};

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const collection = await siteContentCollection();
    const stored = await collection.findOne({ key: "homepage" });
    const storedContent = (stored?.content ?? {}) as Partial<SiteContent>;
    const storedImpactStats = Array.isArray(storedContent.impactStats) ? storedContent.impactStats as Partial<ImpactStat>[] : [];
    const storedImpactStatsByKey = new Map(storedImpactStats
      .filter((stat) => typeof stat?.key === "string" && impactStatKeys.includes(stat.key as ImpactStatKey))
      .map((stat) => [stat.key as ImpactStatKey, stat]));
    const hasAllZeroPlaceholderStats = storedImpactStats.length === defaultImpactStats.length
      && storedImpactStats.every((stat) => String(stat?.value ?? "").trim() === "0");
    const impactStats: SiteContent["impactStats"] = defaultImpactStats.map((stat, index) => {
      const keyedStat = stat.key ? storedImpactStatsByKey.get(stat.key) : undefined;
      // The former Admin saved a six-zero placeholder set. It is not a valid
      // public update, even where a deployment has since added stat keys.
      const storedStat = hasAllZeroPlaceholderStats ? undefined : keyedStat;
      const hasLegacyVolunteerLabel = stat.key === "volunteers-registered" && keyedStat?.label?.trim().toLowerCase() === "people upskilled";
      return {
        ...stat,
        label: !hasLegacyVolunteerLabel && typeof keyedStat?.label === "string" ? keyedStat.label : stat.label,
        value: typeof storedStat?.value === "string" ? storedStat.value : stat.value
      };
    });
    if (hasAllZeroPlaceholderStats && stored?._id) {
      // Persist the correction once, but only while the exact stale array is
      // still present so a concurrent Admin update can never be overwritten.
      await collection.updateOne(
        { _id: stored._id, "content.impactStats": storedContent.impactStats },
        { $set: { "content.impactStats": impactStats, updatedAt: new Date() } }
      );
    }
    const changemakers = Array.isArray(storedContent.changemakers) && storedContent.changemakers.length
      ? storedContent.changemakers as ChangemakerStory[]
      : defaultSiteContent.changemakers;
    const featuredChangemakerId = typeof storedContent.featuredChangemakerId === "string" && changemakers.some((story) => story.id === storedContent.featuredChangemakerId)
      ? storedContent.featuredChangemakerId
      : changemakers[0]?.id ?? defaultSiteContent.featuredChangemakerId;
    return {
      ...defaultSiteContent,
      ...storedContent,
      impactStats,
      changemakers,
      featuredChangemakerId,
      sectors: defaultSiteContent.sectors.map((sector, index) => {
        const storedSector = storedContent.sectors?.[index];
        if (Array.isArray(storedSector?.projects)) return { ...sector, ...storedSector };
        return {
          ...sector,
          title: typeof storedSector?.title === "string" ? storedSector.title : sector.title,
          image: typeof storedSector?.image === "string" ? storedSector.image : sector.image
        };
      })
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
