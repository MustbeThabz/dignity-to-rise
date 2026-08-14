import EngagementForm from "../engagement-form";

const areas = ["Business & entrepreneurship", "Career direction & job readiness", "Digital skills & remote work", "Agriculture & food production", "Trades & local services", "Wellbeing & confidence"];

export default function MentorPage() {
  return <main className="engagement-page"><section className="engagement-hero"><p className="eyebrow">Mentor network</p><h1>A good conversation can change a direction.</h1><p>Tell us where you need support. We’ll match you with a mentor from our growing Overstrand network when the right fit is available.</p></section><section className="mentor-areas"><h2>Support available across</h2><div>{areas.map((area) => <article key={area}><span>Mentor area</span><h3>{area}</h3><p>Practical guidance, encouragement and next steps from people who understand the journey.</p></article>)}</div></section><section className="engagement-grid"><div><h2>Want to give back?</h2><p className="body-copy">We are always looking for experienced people who can offer a little time and a lot of perspective.</p><a className="text-action" href="mailto:ellie@dignitytorise.co.za?subject=Mentor%20application">Apply to become a mentor →</a></div><div className="form-card"><h2>Request a mentor</h2><EngagementForm kind="mentor" /></div></section></main>;
}
