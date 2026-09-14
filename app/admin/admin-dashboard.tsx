"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import type { ChangemakerStory, ProjectStatus, SiteContent } from "../lib/site-content";

type Data = {
  counts: { volunteers: number; partners: number; mentors: number; funders: number };
  availability: { slot: string; count: number }[];
  records: { id: string; name: string; email: string; type: string; submittedAt: string; availability?: string }[];
};
type Media = { id?: string; name: string; url: string; size: number };
type HomepageField = "heroImage" | "heroTitle" | "heroIntro" | "visionTitle" | "visionCopy" | "ctaTitle" | "ctaCopy";

const exportCollections = ["volunteers", "partners", "mentors", "funders"] as const;
const exportLabel: Record<(typeof exportCollections)[number], string> = { volunteers: "Volunteers", partners: "Partners", mentors: "Mentors", funders: "Funders" };
const fields: { key: HomepageField; label: string; long?: boolean }[] = [
  { key: "heroImage", label: "Hero image URL" }, { key: "heroTitle", label: "Hero headline", long: true }, { key: "heroIntro", label: "Hero introduction", long: true },
  { key: "visionTitle", label: "Vision heading", long: true }, { key: "visionCopy", label: "Vision text", long: true }, { key: "ctaTitle", label: "Call-to-action heading", long: true }, { key: "ctaCopy", label: "Call-to-action text", long: true }
];

function createChangemaker(): ChangemakerStory {
  const timestamp = Date.now();
  return {
    id: `changemaker-${timestamp}`,
    slug: `changemaker-${timestamp}`,
    name: "New Changemaker",
    role: "Role or contribution",
    organisation: "Organisation",
    publishedAt: new Date().toISOString().slice(0, 10),
    image: "/team/noxolo-liwani-feature.png",
    imageAlt: "Portrait of the Changemaker",
    quote: "Add a short quote that captures their work.",
    summary: "Add a short introduction for the feature card and archive.",
    body: "## Their story\n\nAdd the full story here. Use a blank line between paragraphs. Start a line with ## to create a section heading."
  };
}

export default function AdminDashboard() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingChangemakerId, setUploadingChangemakerId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  async function refresh() {
    const [dashboardResponse, mediaResponse] = await Promise.all([fetch("/api/dashboard"), fetch("/api/media")]);
    setData(await dashboardResponse.json());
    setMedia(await mediaResponse.json());
  }

  useEffect(() => {
    fetch("/api/site-content").then((response) => response.json()).then(setContent);
    void refresh();
  }, []);

  function update(key: HomepageField, value: string) {
    if (content) setContent({ ...content, [key]: value });
  }

  async function deleteRecord(record: Data["records"][number]) {
    if (!window.confirm(`Delete ${record.name}'s ${record.type.toLowerCase()} record? This cannot be undone.`)) return;
    setDeletingId(record.id);
    setStatus(`Deleting ${record.name}'s record...`);
    const response = await fetch(`/api/admin/records/${record.id}`, { method: "DELETE" });
    const body = await response.json().catch(() => ({}));
    setDeletingId(null);
    if (!response.ok) return setStatus(body.error ?? "Could not delete this record.");
    setStatus(`${record.name}'s record was deleted.`);
    await refresh();
  }

  function updateSector(index: number, key: "title" | "image", value: string) {
    if (!content) return;
    const sectors = [...content.sectors];
    sectors[index] = { ...sectors[index], [key]: value };
    setContent({ ...content, sectors });
  }

  function updateProjects(index: number, key: "liveProjects" | "doneProjects" | "futureProjects", value: string) {
    if (!content) return;
    const sectors = [...content.sectors];
    const sector = sectors[index];
    const names = value.split("\n").map((item) => item.trim()).filter(Boolean);
    const projectStatus: ProjectStatus = key === "liveProjects" ? "Live" : key === "doneProjects" ? "Complete" : "Future";
    const countKey = key === "liveProjects" ? "live" : key === "doneProjects" ? "done" : "future";
    const matchesList = (project: { status: ProjectStatus }) => key === "futureProjects" ? project.status === "Planning" || project.status === "Future" : project.status === projectStatus;
    const listedProjects = sector.projects.filter(matchesList);
    const existingByName = new Map(listedProjects.map((project) => [project.name, project]));
    const preserveRenamedDetails = names.length === listedProjects.length;
    const projects = [
      ...sector.projects.filter((project) => !matchesList(project)),
      ...names.map((name, projectIndex) => {
        const existing = existingByName.get(name) ?? (preserveRenamedDetails ? listedProjects[projectIndex] : undefined);
        return existing ? { ...existing, name } : { name, status: projectStatus };
      })
    ];
    sectors[index] = { ...sector, [key]: names, [countKey]: String(names.length), projects };
    setContent({ ...content, sectors });
  }

  function updateChangemaker<K extends keyof ChangemakerStory>(index: number, key: K, value: ChangemakerStory[K]) {
    if (!content) return;
    const changemakers = [...content.changemakers];
    changemakers[index] = { ...changemakers[index], [key]: value };
    setContent({ ...content, changemakers });
  }

  function addChangemaker() {
    if (!content) return;
    const story = createChangemaker();
    setContent({ ...content, changemakers: [...content.changemakers, story] });
    setStatus("New Changemaker added. Complete the fields, choose the homepage feature if needed, then save and publish.");
  }

  function removeChangemaker(index: number) {
    if (!content || content.changemakers.length === 1) {
      setStatus("Keep at least one Changemaker in the archive.");
      return;
    }
    const removed = content.changemakers[index];
    const changemakers = content.changemakers.filter((_, storyIndex) => storyIndex !== index);
    const featuredChangemakerId = content.featuredChangemakerId === removed.id ? changemakers[0].id : content.featuredChangemakerId;
    setContent({ ...content, changemakers, featuredChangemakerId });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!content) return;
    setStatus("Saving...");
    const response = await fetch("/api/site-content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
    const body = await response.json().catch(() => ({}));
    setStatus(response.ok ? "Published." : body.error ?? "Could not save content.");
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/media", { method: "POST", body: form });
    const uploaded = await response.json();
    setUploading(false);
    if (!response.ok) return setStatus(uploaded.error);
    setMedia((list) => [uploaded, ...list]);
    setStatus("Image uploaded. Copy its path into a hero or Changemaker image field, then save and publish.");
    event.target.value = "";
  }

  async function uploadChangemakerImage(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const story = content?.changemakers[index];
    if (!file || !story) return;

    setUploadingChangemakerId(story.id);
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await fetch("/api/media", { method: "POST", body: form });
      const uploaded = await response.json();
      if (!response.ok) {
        setStatus(uploaded.error ?? "Could not upload the portrait.");
        return;
      }
      updateChangemaker(index, "image", uploaded.url);
      setMedia((list) => [uploaded, ...list]);
      setStatus(`${file.name} is attached to ${story.name}. Click Save and publish when you are ready.`);
    } catch {
      setStatus("Could not upload the portrait. Please try again.");
    } finally {
      setUploadingChangemakerId(null);
      event.target.value = "";
    }
  }

  if (!content || !data) return <main className="admin-shell"><p>Loading dashboard...</p></main>;

  const cards = [["Volunteers", data.counts.volunteers], ["Partners", data.counts.partners], ["Mentors", data.counts.mentors], ["Funders", data.counts.funders]];
  const total = cards.reduce((sum, [, count]) => sum + (count as number), 0);
  const maxCount = Math.max(...cards.map(([, count]) => count as number), 1);
  const recentCount = data.records.filter((record) => record.submittedAt && Date.now() - new Date(record.submittedAt).getTime() <= 7 * 86400000).length;
  const goTo = (tab: string) => {
    setActiveTab(tab);
    document.getElementById(tab)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <main className="admin-shell admin-shell-layout">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/"><span>DIGNITY</span><b>TO RISE</b></a>
      <p>ADMIN PORTAL</p>
      {[["overview", "Overview"], ["people", "People & exports"], ["content", "Content editor"], ["changemakers", "Changemakers"], ["media", "Media library"]].map(([id, label]) => <button key={id} className={activeTab === id ? "active" : ""} onClick={() => goTo(id)}>{label}</button>)}
      <div><a href="/" target="_blank">View public website ↗</a><a href="/changemakers" target="_blank">View Changemakers ↗</a><a href="/api/export/sectors">Sectors CSV ↓</a></div>
    </aside>
    <div className="admin-workspace">
      <header id="overview"><div><p className="eyebrow">Dignity to Rise</p><h1>Operations dashboard</h1><p>Clear, up-to-date visibility of people joining the movement.</p></div><div className="admin-actions"><button onClick={refresh}>Refresh data</button></div></header>
      <section className="stats-grid">{cards.map(([label, count]) => <article key={label as string}><span>{label}</span><strong>{count as number}</strong><small>Submitted forms</small></article>)}</section>
      <section className="tracking-grid"><article className="tracking-card analytics-card"><p className="eyebrow">Participation analytics</p><h2>{total} people in the pipeline</h2><p className="empty-copy">{recentCount} new submission{recentCount === 1 ? "" : "s"} in the last 7 days.</p><div className="distribution">{cards.map(([label, count]) => <div key={label as string}><span>{label}</span><i><b style={{ width: `${((count as number) / maxCount) * 100}%` }} /></i><strong>{count as number}</strong></div>)}</div></article><article className="tracking-card"><div className="section-title"><div><p className="eyebrow">Volunteer planning</p><h2>Availability</h2></div></div>{data.availability.length ? <div className="availability-list">{data.availability.map((item) => <div key={item.slot}><span>{item.slot}</span><b>{item.count}</b></div>)}</div> : <p className="empty-copy">Availability appears after volunteers submit the form.</p>}</article></section>
      <section className="records-card" id="people"><div className="section-title"><div><p className="eyebrow">People tracker</p><h2>Recent activity & separate exports</h2></div><button className="refresh-button" onClick={refresh}>Refresh</button></div><div className="admin-actions" aria-label="Separate collection exports">{exportCollections.map((collection) => <div key={collection}><span>{exportLabel[collection]}</span><a href={`/api/export?collection=${collection}&format=xlsx`}>Excel</a><a href={`/api/export?collection=${collection}&format=pdf`}>PDF</a></div>)}</div>{data.records.length ? <div className="record-table">{data.records.map((record) => <article key={record.id}><div><b>{record.name}</b><span>{record.email}</span>{record.availability && <small>{record.availability}</small>}</div><div className="record-actions"><em>{record.type}</em><time>{record.submittedAt ? new Date(record.submittedAt).toLocaleDateString() : "New"}</time><button type="button" className="delete-record" onClick={() => void deleteRecord(record)} disabled={deletingId === record.id}>{deletingId === record.id ? "Deleting..." : "Delete"}</button></div></article>)}</div> : <p className="empty-copy">Submissions will appear here automatically.</p>}</section>
      <section className="tracking-card media-card" id="media"><p className="eyebrow">Image library</p><h2>Media</h2><label className="upload-control">{uploading ? "Uploading..." : "Import image"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} disabled={uploading} /></label><p className="empty-copy">JPG, PNG, or WebP - maximum 8 MB. Use a sharp, well-lit source image for a Changemaker feature.</p><div className="media-list">{media.map((image) => <button type="button" key={image.url} onClick={() => { update("heroImage", image.url); setStatus(`${image.name} selected as hero image. Click Save and publish.`); }}><img src={image.url} alt="" /><span>{image.name}</span><small>{Math.ceil(image.size / 1024)} KB</small></button>)}</div></section>
      <form className="content-form" id="content" onSubmit={save}>
        <div className="form-section-heading"><p className="eyebrow">Essential website editor</p><h2>Homepage content</h2><p>Only key visitor-facing content is editable here.</p></div>
        {fields.map(({ key, label, long }) => <label key={key}>{label}{long ? <textarea value={content[key]} onChange={(event) => update(key, event.target.value)} /> : <input value={content[key]} onChange={(event) => update(key, event.target.value)} />}</label>)}
        <div className="impact-editor"><p className="eyebrow">Movement in numbers</p><p className="impact-hint">Volunteer registrations use the submitted-volunteer database automatically. If it is temporarily unavailable, the value saved here is shown as the public fallback.</p><input aria-label="Impact section heading" value={content.impactHeading} onChange={(event) => setContent({ ...content, impactHeading: event.target.value })} />{content.impactStats.map((stat, index) => <div key={index}><input aria-label="Stat value" value={stat.value} onChange={(event) => { const impactStats = [...content.impactStats]; impactStats[index] = { ...stat, value: event.target.value }; setContent({ ...content, impactStats }); }} /><input aria-label="Stat label" value={stat.label} onChange={(event) => { const impactStats = [...content.impactStats]; impactStats[index] = { ...stat, label: event.target.value }; setContent({ ...content, impactStats }); }} /></div>)}</div>
        <div className="sector-editor"><div><p className="eyebrow">Live opportunities</p><h2>Six sectors</h2><p>Add one project per line. The live, completed, and future totals update automatically on the public cards, which visitors can open to view the projects.</p></div><div className="sector-editor-grid">{content.sectors.map((sector, index) => <article key={index}><label>Sector name<input value={sector.title} onChange={(event) => updateSector(index, "title", event.target.value)} /></label><label>Image path or URL<input value={sector.image} onChange={(event) => updateSector(index, "image", event.target.value)} /></label><div className="sector-counts"><span>{sector.liveProjects.length} live</span><span>{sector.doneProjects.length} done</span><span>{sector.futureProjects.length} future</span></div><label>Live projects<textarea value={sector.liveProjects.join("\n")} onChange={(event) => updateProjects(index, "liveProjects", event.target.value)} /></label><label>Completed projects<textarea value={sector.doneProjects.join("\n")} onChange={(event) => updateProjects(index, "doneProjects", event.target.value)} /></label><label>Future projects<textarea value={sector.futureProjects.join("\n")} onChange={(event) => updateProjects(index, "futureProjects", event.target.value)} /></label></article>)}</div></div>
        <section className="changemaker-editor" id="changemakers">
          <div className="form-section-heading"><p className="eyebrow">Monthly Changemakers series</p><h2>Stories & homepage feature</h2><p>Add each monthly story to the archive, then select the one that should appear as the main story on the homepage.</p><a href="/changemakers" target="_blank">View public archive ↗</a></div>
          <div className="changemaker-list">
            {content.changemakers.map((story, index) => <article className="changemaker-admin-card" key={story.id}>
              <div className="changemaker-admin-card-head"><div><p className="eyebrow">{story.publishedAt}</p><h3>{story.name}</h3></div><div><label className="featured-control"><input type="radio" name="featured-changemaker" checked={content.featuredChangemakerId === story.id} onChange={() => setContent({ ...content, featuredChangemakerId: story.id })} /> Main homepage story</label><button type="button" className="remove-story" onClick={() => removeChangemaker(index)}>Remove</button></div></div>
              <div className="changemaker-admin-grid">
                <label>Name<input value={story.name} onChange={(event) => updateChangemaker(index, "name", event.target.value)} /></label>
                <label>Role<input value={story.role} onChange={(event) => updateChangemaker(index, "role", event.target.value)} /></label>
                <label>Organisation<input value={story.organisation} onChange={(event) => updateChangemaker(index, "organisation", event.target.value)} /></label>
                <label>Published date<input type="date" value={story.publishedAt} onChange={(event) => updateChangemaker(index, "publishedAt", event.target.value)} /></label>
                <label>URL slug<input value={story.slug} onChange={(event) => updateChangemaker(index, "slug", event.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))} /></label>
                <div className="full-width changemaker-image-field">
                  <span>Portrait image</span>
                  <div className="changemaker-image-upload">
                    <img src={story.image} alt="Current Changemaker portrait" />
                    <div><label className="upload-control">{uploadingChangemakerId === story.id ? "Uploading portrait..." : "Upload portrait"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadChangemakerImage(index, event)} disabled={uploadingChangemakerId !== null} /></label><p>JPG, PNG, or WebP, up to 8 MB. The image is attached automatically.</p></div>
                  </div>
                </div>
                <label className="full-width">Image description<input value={story.imageAlt} onChange={(event) => updateChangemaker(index, "imageAlt", event.target.value)} /></label>
                <label className="full-width">Feature quote<textarea value={story.quote} onChange={(event) => updateChangemaker(index, "quote", event.target.value)} /></label>
                <label className="full-width">Short summary<textarea value={story.summary} onChange={(event) => updateChangemaker(index, "summary", event.target.value)} /></label>
                <label className="full-width">Full story<textarea value={story.body} onChange={(event) => updateChangemaker(index, "body", event.target.value)} /></label>
              </div>
            </article>)}
          </div>
          <button type="button" className="add-changemaker" onClick={addChangemaker}>Add a Changemaker story</button>
        </section>
        <div className="content-submit"><button>Save and publish</button><span>{status}</span></div>
      </form>
    </div>
  </main>;
}
