import EngagementForm from "../engagement-form";

export default function PartnerPage() {
  return <main className="engagement-page"><a className="back-home" href="/">Back to main website</a><section className="engagement-hero"><p className="eyebrow">Partner with Dignity to Rise</p><h1>Build practical opportunities that last.</h1><p>Bring your resources, expertise or people into a collaboration that creates lasting opportunity across the Overstrand.</p></section><section className="engagement-grid"><div><h2>Ways to partner</h2><div className="idea-list"><p><b>Fund a project</b>Help an opportunity move from idea to action.</p><p><b>Share skills or services</b>Offer professional expertise, equipment, venues or pro bono support.</p><p><b>Mobilise your team</b>Create a meaningful employee volunteering day.</p></div></div><div className="form-card"><h2>Start a conversation</h2><EngagementForm kind="partner" /></div></section></main>;
}
