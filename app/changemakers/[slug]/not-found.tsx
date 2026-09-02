import Link from "next/link";

export default function ChangemakerStoryNotFound() {
  return (
    <main className="changemakers-page">
      <div className="changemakers-shell">
        <nav className="changemaker-navigation" aria-label="Changemaker navigation">
          <Link href="/">Back to homepage</Link>
          <Link href="/changemakers">All changemakers</Link>
        </nav>
        <section className="changemaker-empty-state">
          <p className="eyebrow">Story not found</p>
          <h1>That changemaker story is not available.</h1>
          <p>Please return to the Changemakers archive to see the stories currently published.</p>
        </section>
      </div>
    </main>
  );
}
