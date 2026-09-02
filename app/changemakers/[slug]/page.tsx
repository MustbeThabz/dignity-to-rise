import Link from "next/link";
import { notFound } from "next/navigation";

import { getSiteContent } from "../../lib/site-content";

export const dynamic = "force-dynamic";

type ChangemakerStoryPageProps = {
  params: { slug: string };
};

function formatPublishedAt(publishedAt: string) {
  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) return publishedAt;

  return new Intl.DateTimeFormat("en-ZA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export default async function ChangemakerStoryPage({ params }: ChangemakerStoryPageProps) {
  const { changemakers, featuredChangemakerId } = await getSiteContent();
  const story = changemakers.find((candidate) => candidate.slug === params.slug);

  if (!story) notFound();

  const bodyBlocks = story.body
    .split(/\r?\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
  const isFeatured = story.id === featuredChangemakerId;

  return (
    <main className="changemakers-page changemaker-detail-page">
      <div className="changemakers-shell">
        <nav className="changemaker-navigation" aria-label="Changemaker navigation">
          <Link href="/">Back to homepage</Link>
          <Link href="/changemakers">All changemakers</Link>
        </nav>

        <article className="changemaker-story">
          <header className="changemaker-story-header">
            <div>
              <p className="eyebrow">Changemaker in focus</p>
              <div className="changemaker-story-meta">
                <span>{formatPublishedAt(story.publishedAt)}</span>
                {isFeatured ? <span className="changemaker-featured-label">Main story</span> : null}
              </div>
              <h1>{story.name}</h1>
              <p className="changemaker-story-role">{[story.role, story.organisation].filter(Boolean).join(" | ")}</p>
              {story.quote ? <blockquote>{story.quote}</blockquote> : null}
              <p className="changemaker-story-summary">{story.summary}</p>
            </div>
            <figure className="changemaker-story-portrait">
              <img src={story.image} alt={story.imageAlt} />
            </figure>
          </header>

          <div className="changemaker-story-body">
            {bodyBlocks.map((block, index) => block.startsWith("## ")
              ? <h2 key={`${story.slug}-${index}`}>{block.slice(3)}</h2>
              : <p key={`${story.slug}-${index}`}>{block}</p>)}
          </div>

          {story.projectLabel && story.projectHref ? (
            <aside className="changemaker-project-link">
              <p className="eyebrow">Related project</p>
              <a href={story.projectHref}>{story.projectLabel}</a>
            </aside>
          ) : null}
        </article>
      </div>
    </main>
  );
}
