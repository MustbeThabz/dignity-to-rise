import Link from "next/link";

import { getSiteContent } from "../lib/site-content";

export const dynamic = "force-dynamic";

function formatPublishedAt(publishedAt: string) {
  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) return publishedAt;

  return new Intl.DateTimeFormat("en-ZA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export default async function ChangemakersPage() {
  const { changemakers, featuredChangemakerId } = await getSiteContent();
  const stories = [...changemakers].sort(
    (first, second) => Date.parse(second.publishedAt) - Date.parse(first.publishedAt)
  );

  return (
    <main className="changemakers-page">
      <div className="changemakers-shell">
        <nav className="changemaker-navigation" aria-label="Changemaker navigation">
          <Link href="/">Back to homepage</Link>
        </nav>

        <header className="changemakers-hero">
          <p className="eyebrow">Changemakers of the Overstrand</p>
          <h1>Stories from the people creating change.</h1>
        </header>

        {stories.length > 0 ? (
          <section className="changemaker-story-grid" aria-label="Changemaker stories">
            {stories.map((story) => {
              const isFeatured = story.id === featuredChangemakerId;

              return (
                <article className="changemaker-story-card" key={story.id ?? story.slug}>
                  <Link className="changemaker-story-image" href={`/changemakers/${story.slug}`} aria-label={`Read ${story.name}'s story`}>
                    <img src={story.image} alt={story.imageAlt} />
                  </Link>
                  <div className="changemaker-story-card-copy">
                    <div className="changemaker-story-meta">
                      <span>{formatPublishedAt(story.publishedAt)}</span>
                      {isFeatured ? <span className="changemaker-featured-label">Main story</span> : null}
                    </div>
                    <h2><Link href={`/changemakers/${story.slug}`}>{story.name}</Link></h2>
                    <p className="changemaker-story-role">{[story.role, story.organisation].filter(Boolean).join(" | ")}</p>
                    <p>{story.summary}</p>
                    <Link className="changemaker-story-link" href={`/changemakers/${story.slug}`}>Read the story</Link>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="changemaker-empty-state" aria-live="polite">
            <p className="eyebrow">Coming soon</p>
            <h2>Changemaker stories will appear here.</h2>
          </section>
        )}
      </div>
    </main>
  );
}
