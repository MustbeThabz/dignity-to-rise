"use client";

import { useEffect, useRef } from "react";

const destinations: Record<string, string> = {
  "PARTNER WITH US": "/partner",
  "SUPPORT PROJECTS": "/fund",
  "BECOME A MENTOR": "/mentor"
};

export default function HomepageFrame() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  function connectParticipationLinks() {
    const document = frameRef.current?.contentDocument;
    if (!document || document.documentElement.dataset.participationLinksConnected) return;
    document.documentElement.dataset.participationLinksConnected = "true";
    document.addEventListener("click", (event) => {
      const target = event.target as Element | null;
      const link = target?.closest("a");
      const label = link?.textContent?.trim().replace(/\s+/g, " ").toUpperCase() ?? "";
      const destination = Object.entries(destinations).find(([text]) => label.startsWith(text))?.[1];
      if (!destination) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      window.location.assign(destination);
    }, true);
  }

  function connectNewsletterSignup() {
    const document = frameRef.current?.contentDocument;
    if (!document || document.documentElement.dataset.newsletterConnected) return;
    const emailInput = document.querySelector<HTMLInputElement>(".d2r-news-input");
    const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.trim() === "Subscribe");
    if (!emailInput || !button) return;
    document.documentElement.dataset.newsletterConnected = "true";
    const message = document.createElement("p");
    message.setAttribute("role", "status");
    message.style.cssText = "width:100%;margin:4px 0 0;color:#fff;font:13px/1.4 Barlow,sans-serif;";
    button.parentElement?.after(message);
    button.addEventListener("click", async () => {
      const email = emailInput.value.trim();
      button.disabled = true;
      message.textContent = "Saving your email...";
      try {
        const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        emailInput.value = "";
        message.textContent = "Thank you. You are on the mailing list.";
      } catch (error) {
        message.textContent = error instanceof Error ? error.message : "We could not save your email. Please try again.";
      } finally {
        button.disabled = false;
      }
    });
  }

  function compactFooter() {
    const document = frameRef.current?.contentDocument;
    if (!document || document.getElementById("d2r-compact-footer-v3")) return;
    const style = document.createElement("style");
    style.id = "d2r-compact-footer-v3";
    style.textContent = `
      #d2r-page footer > div { padding-top: 16px !important; }
      #d2r-page footer > div > div:first-child { grid-template-columns: minmax(260px, 1.55fr) minmax(150px, .75fr) minmax(150px, .75fr) !important; align-items: start !important; gap: 18px 38px !important; padding-bottom: 14px !important; }
      #d2r-page footer > div > div:first-child > div:first-child { grid-column: auto !important; max-width: 330px !important; }
      #d2r-page footer > div > div:first-child > div:first-child > div { margin-bottom: 10px !important; }
      #d2r-page footer > div > div:first-child > div:first-child p { font-size: 15px !important; line-height: 1.25 !important; }
      #d2r-page footer > div > div:first-child > div:not(:first-child) { font-size: 11px !important; }
      #d2r-page footer > div > div:first-child > div:not(:first-child) > div:first-child { margin-bottom: 8px !important; }
      #d2r-page footer > div > div:first-child > div:not(:first-child) > div:last-child { gap: 6px !important; }
      #d2r-page footer > div > div:first-child a { font-size: 12px !important; line-height: 1.1 !important; }
      #d2r-page footer > div > div:last-child { gap: 4px 2px !important; padding: 8px 0 !important; }
      #d2r-page footer > div > div:last-child span { font-size: 7px !important; letter-spacing: .11em !important; padding-inline: 6px !important; white-space: nowrap !important; }
      #d2r-page footer > div > div:last-child + div { padding-bottom: 9px !important; font-size: 9px !important; }
      @media (max-width: 700px) {
        #d2r-page footer > div { padding-top: 22px !important; }
        #d2r-page footer > div > div:first-child { grid-template-columns: 1fr !important; gap: 18px !important; padding-bottom: 20px !important; }
        #d2r-page footer > div > div:first-child > div:first-child { grid-column: auto !important; }
        #d2r-page footer > div > div:last-child { justify-content: flex-start !important; }
        #d2r-page footer > div > div:last-child span { font-size: 7px !important; letter-spacing: .09em !important; padding-inline: 5px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function polishHero() {
    const document = frameRef.current?.contentDocument;
    if (!document) return;
    const hero = document.getElementById("top");
    hero?.querySelectorAll("image-slot:not(#hero-bg)").forEach((element) => { (element as HTMLElement).style.display = "none"; });
    // Remove the optional hero watermark from any earlier render as well.
    // This keeps the hero clear across refreshes and hot reloads.
    document.getElementById("d2r-hero-brand")?.remove();
    const removeLowerHeroLogos = () => {
      if (!hero) return;
      hero.querySelectorAll("img").forEach((image) => {
        if (image.closest("#d2r-nav")) return;
        const bounds = image.getBoundingClientRect();
        const isBottomRightMark = bounds.left > window.innerWidth * 0.7 && bounds.top > window.innerHeight * 0.55;
        if (isBottomRightMark) image.remove();
      });
    };
    removeLowerHeroLogos();
    const observer = new MutationObserver(removeLowerHeroLogos);
    observer.observe(hero ?? document.body, { childList: true, subtree: true });
    if (document.getElementById("d2r-hero-polish")) return;
    const style = document.createElement("style");
    style.id = "d2r-hero-polish";
    style.textContent = `
      #top { height: 100svh !important; min-height: 700px !important; }
      #hero-bg { transform: scale(1.08); transform-origin: center; filter: saturate(1.04) contrast(1.03); }
      /* The hero contains only its landscape and the navigation logo. */
      #top > :not(#hero-bg):not(#d2r-nav) img { display:none !important; }
      #top > :not(#hero-bg):not(#d2r-nav) image-slot { display:none !important; }
      #d2r-sector-projects { position:fixed; inset:0; z-index:100; display:none; align-items:center; justify-content:center; padding:22px; background:rgba(0,35,26,.72); }
      #d2r-sector-projects.is-open { display:flex; }
      .d2r-sector-dialog { position:relative; width:min(760px,100%); max-height:min(82vh,760px); overflow:auto; padding:clamp(28px,5vw,52px); background:#F8F5EF; color:#1A1A1A; box-shadow:0 28px 90px rgba(0,0,0,.38); }
      .d2r-sector-dialog > button { position:absolute; top:16px; right:16px; border:1px solid #006A4E; background:transparent; color:#006A4E; padding:9px 12px; font:600 11px Barlow,sans-serif; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
      .d2r-sector-dialog > p { margin:0 0 8px; color:#B89454; font:600 11px Barlow,sans-serif; letter-spacing:.18em; text-transform:uppercase; }
      .d2r-sector-dialog > h2 { margin:0 0 26px; color:#006A4E; font:600 clamp(34px,5vw,52px)/1 Cormorant Garamond,serif; }
      .d2r-sector-dialog > div { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
      .d2r-sector-dialog section { padding:18px; border:1px solid #E0D8C9; background:#fff; }
      .d2r-sector-dialog h3 { margin:0 0 12px; color:#006A4E; font:600 13px Barlow,sans-serif; letter-spacing:.09em; text-transform:uppercase; }
      .d2r-sector-dialog ul { margin:0; padding:0; list-style:none; }
      .d2r-sector-dialog li { padding:9px 0; border-top:1px solid #EEE8DD; color:#514E48; font:14px/1.35 Barlow,sans-serif; }
      .d2r-sector-dialog li:first-child { border-top:0; }
      .d2r-changemakers-roster { position:relative; margin:32px auto 0; max-width:1240px; padding:0 54px; }
      .d2r-changemakers-track { display:flex; gap:clamp(22px,4vw,58px); overflow-x:auto; scroll-snap-type:x mandatory; scroll-behavior:smooth; scrollbar-width:none; padding:4px 0 12px; }
      .d2r-changemakers-track::-webkit-scrollbar { display:none; }
      .d2r-changemakers-roster button { flex:0 0 156px; scroll-snap-align:start; overflow:visible; border:0; background:transparent; color:#006A4E; padding:0; font:600 20px/1.1 Cormorant Garamond,serif; cursor:pointer; text-align:center; }
      .d2r-changemakers-roster button img { display:block; width:150px; height:150px; margin:0 auto 15px; border-radius:50%; object-fit:cover; object-position:center; filter:sepia(.28) saturate(.7) brightness(1.08); transition:filter .25s ease, transform .25s ease; }
      .d2r-changemakers-roster button:hover img, .d2r-changemakers-roster button:focus-visible img { filter:sepia(.12) saturate(.88); transform:scale(1.035); }
      .d2r-changemakers-roster button small { display:block; margin-top:6px; color:#9A715C; font:500 11px/1.25 Barlow,sans-serif; letter-spacing:.02em; }
      .d2r-changemaker-arrow { position:absolute; top:50px; z-index:1; width:42px; height:42px; border:1px solid #D8C7AC; border-radius:50%; background:#fff; color:#006A4E; font:28px/1 Barlow,sans-serif; cursor:pointer; }
      .d2r-changemaker-arrow.prev { left:0; }.d2r-changemaker-arrow.next { right:0; }
      .d2r-changemaker-dialog { position:fixed; inset:0; z-index:1000; display:none; align-items:center; justify-content:center; padding:22px; background:rgba(0,42,31,.68); }
      .d2r-changemaker-dialog.is-open { display:flex; }
      .d2r-changemaker-dialog > div { position:relative; width:min(710px,100%); max-height:82vh; overflow:auto; padding:clamp(28px,5vw,52px); background:#F8F5EF; box-shadow:0 28px 90px rgba(0,0,0,.38); }
      .d2r-changemaker-dialog button { position:absolute; top:15px; right:15px; border:1px solid #006A4E; background:transparent; color:#006A4E; padding:8px 11px; font:600 11px Barlow,sans-serif; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
      .d2r-changemaker-dialog h2 { margin:0 42px 6px 0; color:#006A4E; font:600 clamp(34px,5vw,48px)/1 Cormorant Garamond,serif; }
      .d2r-changemaker-dialog h2 + p { margin:0 0 26px; color:#9A715C; font:600 12px Barlow,sans-serif; letter-spacing:.08em; text-transform:uppercase; }
      .d2r-changemaker-dialog .bio-copy { color:#45413B; font:15px/1.7 Barlow,sans-serif; white-space:pre-line; }
      #changemakers .d2r-cmcard { display:none !important; }
      @media(max-width:700px) { .d2r-sector-dialog > div { grid-template-columns:1fr; } }
      @media(max-width:700px) { .d2r-changemakers-roster { padding:0 40px; } .d2r-changemakers-roster button { flex-basis:138px; } .d2r-changemakers-roster button img { width:132px; height:132px; } .d2r-changemaker-arrow { width:34px; height:34px; top:44px; } }
      @media (max-width: 700px) { #top { min-height: 650px !important; } #hero-bg { transform:scale(1.12); } }
    `;
    document.head.appendChild(style);
  }

  async function applyManagedContent() {
    const document = frameRef.current?.contentDocument;
    if (!document || document.documentElement.dataset.managedContentConnected) return;
    document.documentElement.dataset.managedContentConnected = "true";
    try {
      const content = await fetch("/api/site-content", { cache: "no-store" }).then((response) => response.json());
      const setText = (selector: string, value: string) => { const element = document.querySelector(selector); if (element && value) element.textContent = value; };
      const background = document.getElementById("hero-bg");
      if (background && content.heroImage) background.setAttribute("src", content.heroImage);
      const teamPhotos = [
        { id: "team-ellie", src: "/team/ellie.jpeg", alt: "Ellie" },
        { id: "team-sybil", src: "/team/sybil.jpg", alt: "Sybil" }
      ];
      teamPhotos.forEach(({ id, src, alt }) => {
        const photo = document.getElementById(id);
        if (photo) {
          photo.style.display = "block";
          photo.setAttribute("src", src);
          photo.setAttribute("alt", alt);
        }
      });
      ["/social/community-market.jpg", "/social/digital-hub.jpg", "/social/hermanus-landscape.jpg"].forEach((source, index) => {
        const reel = document.getElementById(`social-${index + 1}`);
        if (reel) reel.setAttribute("src", source);
      });
      const transparencyHeading = Array.from(document.querySelectorAll("h2")).find((heading) =>
        heading.textContent?.trim() === "Transparency Builds Trust"
      );
      const transparencyImage = transparencyHeading?.closest("section")?.querySelector("image-slot");
      if (transparencyImage) {
        transparencyImage.setAttribute("src", "/sectors/community.jpg");
        transparencyImage.setAttribute("alt", "Community members joining hands together");
      }
      const changemakersHeading = Array.from(document.querySelectorAll("h1, h2, h3")).find((heading) => heading.textContent?.toLowerCase().includes("changemaker"));
      const changemakersSection = changemakersHeading?.closest("section");
      if (changemakersSection && !changemakersSection.dataset.rosterAdded) {
        changemakersSection.dataset.rosterAdded = "true";
        changemakersSection.querySelectorAll(".d2r-cmcard").forEach((card) => { (card as HTMLElement).style.display = "none"; });
        Array.from(changemakersSection.children).filter((child) => !child.contains(changemakersHeading ?? null)).forEach((child) => { (child as HTMLElement).style.display = "none"; });
        const roster = document.createElement("div");
        roster.className = "d2r-changemakers-roster";
        const track = document.createElement("div");
        track.className = "d2r-changemakers-track";
        track.setAttribute("aria-label", "Changemakers");
        const changemakers = [
          { name: "Sybil Doms Pretorius", role: "Project Director", photo: "/team/sybil-doms-pretorius.jpg" },
          { name: "Elmarie Meyer", role: "Programme Director", photo: "/team/elmarie-meyer.png" },
          { name: "Noxolo Liwani", role: "Local Economic Development Officer", photo: "/team/noxolo-liwani.jpeg" },
          { name: "Xolile Joseph Kosi", role: "Economic Development Practitioner", photo: "/team/xolile-joseph-kosi.jpeg" },
          { name: "Heinrich Ungerer", role: "Founder & Director, Food Security Program", photo: "/team/heinrich-ungerer.png" }
        ];
        const biographies: Record<string, string> = {
          "Sybil Doms Pretorius": "Sybil Doms Pretorius is a South African entrepreneur, business leader and problem-solver whose career has crossed culinary, hospitality, events, technology, recruitment, business analytics and financial crime compliance. With more than 20 years of diverse experience, she has built her career around connecting people, ideas and opportunities and turning complexity into practical solutions. Today, as COO and co-founder of RAHN Consolidated, she works across technology, AI, process optimisation, specialist recruitment and financial crime solutions, with a particular passion for using business and technology to create meaningful change.\n\nBut Sybil’s drive extends beyond business. Dignity to Rise reflects her belief that sustainable change happens when people, businesses, communities and government are connected and given the opportunity to work together. Rather than simply giving, she wants to build systems, projects and partnerships that create opportunity, dignity, accountability and long-term independence. Her motivation is simple: to connect the right people and resources so that communities can build better futures for themselves.",
          "Noxolo Liwani": "Noxolo Liwani is the Local Economic Development Officer and EPWP Champion within the Socio-Economic Services section of Overstrand Municipality's Planning and Development Directorate. In this role, she drives local economic development, enterprise support and skills development initiatives across the Overstrand region, working closely with community entrepreneurs, cooperatives and small businesses to unlock sustainable economic opportunities.\n\nNoxolo manages key municipal partnerships with organisations such as ABSA, the Grootbos Foundation, TechWays Foundation and the Department of Economic Development and Tourism, coordinating enterprise-development workshops, employability programmes and stakeholder engagements throughout the region. She also oversees municipal EPWP reporting and recruitment processes, and has led operational projects including the Multi-Purpose Centre at Old Harbour, Hermanus, and the management of municipal trading-stall infrastructure.\n\nKnown for her hands-on, community-focused approach, Noxolo is committed to building strong public private partnerships that create real, measurable economic impact for residents across the Overstrand municipal area.",
          "Xolile Joseph Kosi": "Xolile Joseph Kosi is a strategic leader, economic development practitioner and community activist who is deeply passionate about unlocking human and economic potential. His professional journey has taken him across local government, business, civil society, education and community development, giving him a broad understanding of the forces that shape inclusive development. He has led initiatives supporting entrepreneurs, SMMEs, job creation, transformation and partnerships between public and private-sector stakeholders.\n\nAt the heart of Xolile’s work is a simple conviction: development happens when people are mobilised to act. He seeks to bring together activists and champions from government, business, civil society and communities to create an economy that is more inclusive, participatory and opportunity-driven. His international outlook is equally strong. He believes South Africa is not isolated from the world but an integral part of the global village, and that South Africans have a responsibility to participate, innovate and contribute to shaping a better global future.",
          "Heinrich Ungerer": "Heinrich Ungerer is the founder and director of the Food Security Program (FSP), where he has spent more than a decade developing practical, scalable food-production models that connect agriculture, enterprise and measurable impact. His work focuses on building productive systems that create long-term value improving access to nutritious food while creating jobs, skills, income opportunities and stronger local food economies. Heinrich is an entrepreneur at heart, with a passion for building practical solutions, bringing people and ideas together, and creating opportunities where good business and positive impact can grow side by side.",
          "Elmarie Meyer": "Elmarie Meyer | Programme Director, Dignity to Rise\n\nElmarie is a mum, experienced programme and business leader, and someone who believes strongly in action, not words.\n\nWith more than 20 years’ experience, she has built her career around bringing people together, solving complex problems and turning ambitious ideas into practical programmes. She has led major transformation programmes, supported start-ups and growing businesses, built teams and partnerships, and sponsored graduate and development programmes.\n\nIn her day-to-day professional role, Elmarie works in the rail sector, with a particular focus on supporting rail reform and the development of a more efficient and sustainable rail industry in South Africa.\n\nAt Dignity to Rise, she brings that same energy and experience to the community she calls home. Her focus is on turning good ideas into action — connecting businesses, government, community organisations and individuals to create opportunities that can make a real and lasting difference.\n\nShe is particularly passionate about young people and education, supporting the elderly, and making sure children are fed and have a fair opportunity to learn and succeed.\n\nFor Elmarie, this is already about action. She has appointed Dignity to Rise’s first intern, mentors business students through the Overstrand Learning Hub, and is supporting two aspiring Early Childhood Education teachers to complete their degrees.\n\nShe believes lasting change comes from giving people the opportunity and support to build their own futures — through education, skills, employment, entrepreneurship and stronger communities. This reflects Dignity to Rise’s approach of creating opportunities, preparing people and scaling what works.\n\nFor Elmarie, the goal is simple: bring people together, create opportunities and get things done."
        };
        const dialog = document.createElement("div");
        dialog.className = "d2r-changemaker-dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.innerHTML = '<div><button type="button" aria-label="Close biography">Close</button><h2></h2><p></p><div class="bio-copy"></div></div>';
        const closeDialog = () => dialog.classList.remove("is-open");
        dialog.querySelector("button")?.addEventListener("click", closeDialog);
        dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
        document.body.appendChild(dialog);
        changemakers.forEach(({ name, role, photo }) => {
          const button = document.createElement("button");
          button.type = "button";
          button.setAttribute("aria-label", `Read ${name}'s biography`);
          const image = document.createElement("img");
          image.src = photo;
          image.alt = name;
          const title = document.createElement("span");
          title.textContent = name;
          const label = document.createElement("small");
          label.textContent = role;
          button.append(image, title, label);
          button.addEventListener("click", () => {
            (dialog.querySelector("h2") as HTMLElement).textContent = name;
            (dialog.querySelector("h2 + p") as HTMLElement).textContent = role;
            (dialog.querySelector(".bio-copy") as HTMLElement).textContent = biographies[name] ?? "Biography coming soon.";
            dialog.classList.add("is-open");
          });
          track.appendChild(button);
        });
        const createArrow = (direction: "prev" | "next", label: string, symbol: string) => {
          const arrow = document.createElement("button");
          arrow.type = "button";
          arrow.className = `d2r-changemaker-arrow ${direction}`;
          arrow.setAttribute("aria-label", label);
          arrow.textContent = symbol;
          arrow.addEventListener("click", () => track.scrollBy({ left: direction === "next" ? 250 : -250, behavior: "smooth" }));
          return arrow;
        };
        roster.append(createArrow("prev", "Show previous changemakers", "‹"), track, createArrow("next", "Show next changemakers", "›"));
        changemakersSection.appendChild(roster);
      }
      setText("#hero h1", content.heroTitle);
      setText("#hero p", content.heroKicker);
      setText("#hero h1 + p", content.heroIntro);
      setText("#hero a[href='/volunteer']", content.heroButtonText);
      setText("#vision h2", content.visionTitle);
      setText("#vision h2 + p", content.visionCopy);
      setText("#cta h2", content.ctaTitle);
      setText("#cta h2 + p", content.ctaCopy);
      setText("#connect h2", content.contactHeading);
      setText("#connect h2 + p", content.contactCopy);
      setText("#impact > p", content.impactHeading);
      const impactItems = Array.from(document.querySelectorAll("#impact > div > div"));
      content.impactStats?.forEach((stat: { value: string; label: string }, index: number) => {
        const item = impactItems[index];
        if (!item) return;
        const elements = item.querySelectorAll("div");
        if (elements[0]) elements[0].textContent = stat.value;
        if (elements[1]) elements[1].textContent = stat.label;
      });
      const sectorTiles = Array.from(document.querySelectorAll("#sectors .d2r-sectors-grid > a"));
      content.sectors?.forEach((sector: { title: string; live: string; done: string; future: string; image: string; liveProjects: string[]; doneProjects: string[]; futureProjects: string[] }, index: number) => {
        const tile = sectorTiles[index] as HTMLAnchorElement | undefined;
        if (!tile) return;
        const image = tile.querySelector("image-slot");
        if (image) image.setAttribute("src", sector.image);
        const title = tile.querySelector("h3");
        if (title) title.textContent = sector.title;
        const stats = title?.nextElementSibling;
        const values = [String(sector.liveProjects?.length ?? sector.live), String(sector.doneProjects?.length ?? sector.done), String(sector.futureProjects?.length ?? sector.future)];
        stats?.querySelectorAll("span").forEach((stat, statIndex) => {
          const labels = ["Live", "Done", "Future"];
          stat.innerHTML = `<strong style="color:#fff;font-weight:600;">${values[statIndex] ?? "0"}</strong> ${labels[statIndex] ?? ""}`;
        });
        tile.setAttribute("href", "#sector-projects");
        tile.onclick = (event) => {
          event.preventDefault();
          let modal = document.getElementById("d2r-sector-projects");
          if (!modal) {
            modal = document.createElement("div");
            modal.id = "d2r-sector-projects";
            modal.innerHTML = '<div class="d2r-sector-dialog" role="dialog" aria-modal="true"><button type="button" aria-label="Close project list">Close</button><p></p><h2></h2><div></div></div>';
            document.body.appendChild(modal);
            modal.addEventListener("click", (closeEvent) => { if (closeEvent.target === modal || (closeEvent.target as Element).closest("button")) modal?.classList.remove("is-open"); });
          }
          const dialog = modal.querySelector(".d2r-sector-dialog");
          const eyebrow = dialog?.querySelector("p");
          const heading = dialog?.querySelector("h2");
          const lists = dialog?.querySelector("div");
          if (eyebrow) eyebrow.textContent = "Sector projects";
          if (heading) heading.textContent = sector.title;
          if (lists) {
            lists.replaceChildren();
            const projectGroups: [string, string[]][] = [["Live", sector.liveProjects], ["Completed", sector.doneProjects], ["Future", sector.futureProjects]];
            projectGroups.forEach(([label, projects]) => {
              const group = document.createElement("section");
              const groupHeading = document.createElement("h3"); groupHeading.textContent = `${label} (${projects.length})`;
              const list = document.createElement("ul");
              projects.forEach((project) => { const item = document.createElement("li"); item.textContent = project; list.appendChild(item); });
              if (!projects.length) { const item = document.createElement("li"); item.textContent = "No projects listed yet."; list.appendChild(item); }
              group.append(groupHeading, list); lists.appendChild(group);
            });
          }
          modal.classList.add("is-open");
        };
      });
    } catch (error) { console.error("Could not apply managed site content", error); }
  }

  useEffect(() => {
    const attachHomepageEnhancements = () => { connectParticipationLinks(); connectNewsletterSignup(); compactFooter(); polishHero(); applyManagedContent(); };
    attachHomepageEnhancements();
    const timer = window.setInterval(attachHomepageEnhancements, 250);
    return () => window.clearInterval(timer);
  }, []);

  return <main className="bundled-homepage" style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}>
    <iframe ref={frameRef} onLoad={() => { connectParticipationLinks(); connectNewsletterSignup(); polishHero(); applyManagedContent(); }} title="Dignity to Rise Overstrand" src="/dignity-to-rise-homepage.html" className="bundled-homepage-frame" style={{ display: "block", width: "100vw", height: "100vh", border: 0 }} />
  </main>;
}
