"use client";

import { useEffect, useRef } from "react";
import type { ProjectStatus, SectorCard, SectorProject, SiteContent } from "./lib/site-content";

const destinations: Record<string, string> = {
  "PARTNER WITH US": "/partner",
  "SUPPORT PROJECTS": "/fund",
  "BECOME A MENTOR": "/mentor"
};

const facebookUrl = "https://www.facebook.com/thedignitytorisemovement";
const instagramUrl = "https://www.instagram.com/dignitytorise/";

// The bundled homepage has legacy impact labels. Apply the current card order
// immediately; the volunteer value is then replaced by the live database count.
const homepageImpactFallback: SiteContent["impactStats"] = [
  { key: "projects-started", label: "Projects started", value: "6" },
  { key: "jobs-created", label: "Jobs created", value: "1" },
  { key: "people-upskilled", label: "People upskilled", value: "2" },
  { key: "ngos-contacted", label: "NGOs contacted", value: "-" },
  { key: "volunteers-registered", label: "Volunteers registered", value: "21" },
  { key: "projects-in-planning", label: "Projects in planning", value: "8" }
];

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
      .d2r-sector-dialog { position:relative; width:min(940px,100%); max-height:min(82vh,760px); overflow:auto; padding:clamp(28px,5vw,52px); background:#F8F5EF; color:#1A1A1A; box-shadow:0 28px 90px rgba(0,0,0,.38); }
      .d2r-sector-dialog > button { position:absolute; top:16px; right:16px; border:1px solid #006A4E; background:transparent; color:#006A4E; padding:9px 12px; font:600 11px Barlow,sans-serif; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
      .d2r-sector-dialog > p { margin:0 0 8px; color:#B89454; font:600 11px Barlow,sans-serif; letter-spacing:.18em; text-transform:uppercase; }
      .d2r-sector-dialog > h2 { margin:0 74px 28px 0; color:#006A4E; font:600 clamp(34px,5vw,52px)/1 Cormorant Garamond,serif; }
      .d2r-sector-project-content { display:grid; gap:26px; }
      .d2r-project-group { padding:0; border:0; background:transparent; }
      .d2r-project-group > h3 { margin:0 0 12px; color:#006A4E; font:600 13px Barlow,sans-serif; letter-spacing:.09em; text-transform:uppercase; }
      .d2r-project-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
      .d2r-project-card { display:flex; flex-direction:column; gap:16px; min-width:0; padding:18px; border:1px solid #E0D8C9; background:#fff; }
      .d2r-project-header { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; }
      .d2r-project-header h4 { margin:0; color:#006A4E; font:600 25px/1.05 Cormorant Garamond,serif; }
      .d2r-project-meta { display:flex; flex:0 0 auto; flex-wrap:wrap; justify-content:flex-end; gap:6px; }
      .d2r-project-meta span { display:inline-flex; align-items:center; min-height:24px; padding:4px 7px; border:1px solid #D8C7AC; color:#62594D; font:600 10px/1 Barlow,sans-serif; letter-spacing:.07em; text-transform:uppercase; }
      .d2r-project-meta .d2r-project-status--live { border-color:#006A4E; background:#EAF4EF; color:#006A4E; }
      .d2r-project-meta .d2r-project-status--planning { border-color:#B89454; background:#FBF3E4; color:#805B21; }
      .d2r-project-meta .d2r-project-status--complete { border-color:#527B6B; background:#EAF0ED; color:#285B49; }
      .d2r-project-meta .d2r-project-status--future { border-color:#8CAFC0; background:#EDF5F8; color:#3D7086; }
      .d2r-project-details { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px 20px; margin:0; }
      .d2r-project-details > div { min-width:0; }
      .d2r-project-details > div.is-notes { grid-column:1 / -1; }
      .d2r-project-details dt { margin:0 0 5px; color:#9A715C; font:600 10px/1.2 Barlow,sans-serif; letter-spacing:.1em; text-transform:uppercase; }
       .d2r-project-details dd { margin:0; color:#514E48; font:14px/1.5 Barlow,sans-serif; overflow-wrap:anywhere; white-space:pre-wrap; }
       .d2r-changemaker-feature { display:grid; grid-template-columns:minmax(280px,.94fr) minmax(0,1.06fr); gap:clamp(30px,5vw,76px); width:min(100% - 40px,1180px); margin:0 auto; padding:clamp(26px,4vw,48px); background:#fff; box-shadow:0 18px 48px rgba(0,51,37,.08); }
       .d2r-changemaker-feature-portrait { min-height:420px; margin:0; overflow:hidden; background:#E9E4DA; }
       .d2r-changemaker-feature-portrait img { display:block; width:100%; height:100%; min-height:420px; object-fit:cover; object-position:center; filter:contrast(1.1) saturate(1.06); }
       .d2r-changemaker-feature-copy { display:flex; flex-direction:column; align-items:flex-start; justify-content:center; padding:clamp(4px,2vw,18px) 0; }
       .d2r-changemaker-feature-copy > p:first-child { margin:0 0 22px; color:#B89454; font:600 11px/1 Barlow,sans-serif; letter-spacing:.22em; text-transform:uppercase; }
       .d2r-changemaker-feature-copy h2 { margin:0; color:#006A4E; font:500 clamp(42px,5vw,68px)/.98 Cormorant Garamond,serif; }
       .d2r-changemaker-feature-role { margin:12px 0 0; color:#897C70; font:500 14px/1.45 Barlow,sans-serif; letter-spacing:.03em; }
       .d2r-changemaker-feature-quote { margin:34px 0 0; color:#007457; font:italic clamp(28px,3vw,42px)/1.25 Cormorant Garamond,serif; }
       .d2r-changemaker-feature-summary { max-width:560px; margin:28px 0 0; color:#5A5752; font:16px/1.72 Barlow,sans-serif; }
       .d2r-changemaker-feature-actions { display:flex; flex-wrap:wrap; gap:14px 26px; margin-top:33px; }
       .d2r-changemaker-feature-actions a { display:inline-flex; align-items:center; gap:10px; color:#006A4E; font:600 11px/1 Barlow,sans-serif; letter-spacing:.13em; text-decoration:none; text-transform:uppercase; }
       .d2r-changemaker-feature-actions a:first-child { color:#B07F37; }
       .d2r-changemaker-feature-actions a::after { content:"→"; font-size:17px; line-height:1; }
       .d2r-changemaker-feature-actions a:hover,.d2r-changemaker-feature-actions a:focus-visible { color:#805B21; outline:none; }
       .d2r-changemakers-roster { position:relative; margin:32px auto 0; max-width:1240px; padding:0 54px; }
      .d2r-changemakers-track { display:flex; gap:clamp(22px,4vw,58px); overflow-x:auto; scroll-snap-type:x mandatory; scroll-behavior:smooth; scrollbar-width:none; padding:4px 0 12px; }
      .d2r-changemakers-track::-webkit-scrollbar { display:none; }
      .d2r-sectors-grid { gap:0 !important; background:transparent !important; }
      #sectors .d2r-sectors-grid > a > image-slot, #sectors .d2r-sectors-grid > a > image-slot img { display:block !important; width:100% !important; height:100% !important; object-fit:cover !important; }
      .d2r-changemakers-roster button { flex:0 0 156px; scroll-snap-align:start; overflow:visible; border:0; background:transparent; color:#006A4E; padding:0; font:600 20px/1.1 Cormorant Garamond,serif; cursor:pointer; text-align:center; }
       .d2r-changemakers-roster button img { display:block; width:150px; height:150px; margin:0 auto 15px; border-radius:50%; object-fit:cover; object-position:center; filter:contrast(1.07) saturate(1.04); transition:filter .25s ease, transform .25s ease; }
       .d2r-changemakers-roster button:hover img, .d2r-changemakers-roster button:focus-visible img { filter:contrast(1.1) saturate(1.07); transform:scale(1.035); }
      .d2r-changemakers-roster button small { display:block; margin-top:6px; color:#9A715C; font:500 11px/1.25 Barlow,sans-serif; letter-spacing:.02em; }
      .d2r-changemakers-roster button small.company { margin-top:2px; color:#006A4E; font-weight:600; }
      .d2r-changemaker-arrow { position:absolute; top:50px; z-index:1; width:42px; height:42px; border:1px solid #D8C7AC; border-radius:50%; background:#fff; color:#006A4E; font:28px/1 Barlow,sans-serif; cursor:pointer; }
      .d2r-changemaker-arrow.prev { left:0; }.d2r-changemaker-arrow.next { right:0; }
      .d2r-changemaker-dialog { position:fixed; inset:0; z-index:1000; display:none; align-items:center; justify-content:center; padding:22px; background:rgba(0,42,31,.68); }
      .d2r-changemaker-dialog.is-open { display:flex; }
      .d2r-changemaker-dialog > div { position:relative; width:min(710px,100%); max-height:82vh; overflow:auto; padding:clamp(28px,5vw,52px); background:#F8F5EF; box-shadow:0 28px 90px rgba(0,0,0,.38); }
      .d2r-changemaker-dialog button { position:absolute; top:15px; right:15px; border:1px solid #006A4E; background:transparent; color:#006A4E; padding:8px 11px; font:600 11px Barlow,sans-serif; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
       .d2r-changemaker-dialog h2 { margin:0 42px 6px 0; color:#006A4E; font:600 clamp(34px,5vw,48px)/1 Cormorant Garamond,serif; }
       .d2r-changemaker-dialog h2 + p { margin:0 0 26px; color:#9A715C; font:600 12px Barlow,sans-serif; letter-spacing:.08em; text-transform:uppercase; }
       .d2r-changemaker-dialog .bio-copy { color:#45413B; font:15px/1.7 Barlow,sans-serif; white-space:pre-line; }
       .d2r-reel image-slot { filter:saturate(1.06) contrast(1.08) !important; }
       #changemakers .d2r-cmcard { display:none !important; }
       @media(max-width:820px) { .d2r-changemaker-feature { grid-template-columns:1fr; gap:28px; width:min(100% - 32px,620px); } .d2r-changemaker-feature-portrait,.d2r-changemaker-feature-portrait img { min-height:360px; } }
       @media(max-width:700px) { .d2r-project-list { grid-template-columns:1fr; } .d2r-project-header { flex-direction:column; } .d2r-project-meta { justify-content:flex-start; } .d2r-project-details { grid-template-columns:1fr; } .d2r-project-details > div.is-notes { grid-column:auto; } }
      @media(max-width:700px) { .d2r-changemakers-roster { padding:0 40px; } .d2r-changemakers-roster button { flex-basis:138px; } .d2r-changemakers-roster button img { width:132px; height:132px; } .d2r-changemaker-arrow { width:34px; height:34px; top:44px; } }
      @media (max-width: 700px) { #top { min-height: 650px !important; } #hero-bg { transform:scale(1.12); } }
    `;
    document.head.appendChild(style);
  }

  function makeHomepageMobileFriendly() {
    const document = frameRef.current?.contentDocument;
    if (!document) return;

    if (!document.getElementById("d2r-mobile-layout")) {
      const style = document.createElement("style");
      style.id = "d2r-mobile-layout";
      style.textContent = `
        html { scroll-behavior:smooth; }
        img, svg { max-width:100%; }
        .d2r-mobile-menu-button { display:none; align-items:center; justify-content:center; min-width:44px; min-height:44px; border:1px solid currentColor; background:transparent; color:inherit; font:600 10px/1 Barlow,Arial,sans-serif; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
        @media (max-width: 760px) {
          #top { height:auto !important; min-height:680px !important; }
          #d2r-nav { padding:14px 20px !important; }
          #d2r-nav .d2r-mobile-menu-button { display:inline-flex; }
          #d2r-nav .d2r-navlinks { position:absolute; top:100%; left:0; right:0; display:none !important; flex-direction:column; align-items:stretch; gap:0 !important; padding:8px 20px 18px; background:#F8F5EF; color:#1A1A1A; box-shadow:0 14px 28px rgba(0,45,33,.2); }
          #d2r-nav.menu-open .d2r-navlinks { display:flex !important; }
          #d2r-nav .d2r-navlinks a { display:block; padding:14px 0; border-bottom:1px solid #E0D8C9; font-size:13px !important; }
          #d2r-nav .d2r-navlinks a:last-child { margin-top:9px; border:0; background:#B89454; color:#fff; padding:14px 16px; text-align:center; }
          #top > div:not(#d2r-nav) { padding-left:20px !important; padding-right:20px !important; }
          #top h1 { font-size:clamp(42px,12vw,60px) !important; line-height:1.02 !important; }
          #top h1 + p, #top .hero-intro { margin-top:24px !important; font-size:18px !important; line-height:1.45 !important; }
          #top a { max-width:100%; }
          .d2r-changemaker-dialog, #d2r-sector-projects { padding:12px !important; }
          .d2r-changemaker-dialog > div, .d2r-sector-dialog { max-height:calc(100dvh - 24px) !important; padding:48px 22px 24px !important; }
          .d2r-changemaker-feature { width:calc(100% - 24px) !important; padding:20px !important; }
          .d2r-changemaker-feature-portrait, .d2r-changemaker-feature-portrait img { min-height:280px !important; }
          .d2r-changemaker-feature h2 { font-size:42px !important; }
          .d2r-changemaker-feature-quote { margin-top:22px !important; font-size:27px !important; }
          .d2r-changemaker-feature-summary { margin-top:20px !important; font-size:15px !important; }
          .d2r-changemakers-roster { padding:0 32px !important; }
          .d2r-changemakers-roster button { flex-basis:116px !important; font-size:17px !important; }
          .d2r-changemakers-roster button img { width:108px !important; height:108px !important; }
          .d2r-changemaker-arrow { top:35px !important; width:30px !important; height:30px !important; }
          #sectors .d2r-sectors-grid { grid-template-columns:1fr !important; }
          #sectors .d2r-sectors-grid > a { min-height:230px !important; }
          #impact > div { grid-template-columns:repeat(2,minmax(0,1fr)) !important; gap:20px 12px !important; }
          #connect [style*="grid-template-columns"] { gap:44px !important; }
        }
        @media (max-width: 390px) {
          #top h1 { font-size:40px !important; }
          #impact > div { grid-template-columns:1fr !important; }
          #connect a[aria-label^="Follow"] { padding:10px 12px !important; }
        }
      `;
      document.head.appendChild(style);
    }

    const nav = document.getElementById("d2r-nav");
    const navLinks = nav?.querySelector(".d2r-navlinks");
    if (!nav || !navLinks || nav.querySelector(".d2r-mobile-menu-button")) return;

    const menu = document.createElement("button");
    menu.type = "button";
    menu.className = "d2r-mobile-menu-button";
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-controls", "d2r-mobile-navigation");
    menu.textContent = "Menu";
    navLinks.id = "d2r-mobile-navigation";
    menu.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("menu-open");
      menu.setAttribute("aria-expanded", String(isOpen));
      menu.textContent = isOpen ? "Close" : "Menu";
    });
    navLinks.addEventListener("click", () => {
      nav.classList.remove("menu-open");
      menu.setAttribute("aria-expanded", "false");
      menu.textContent = "Menu";
    });
    nav.appendChild(menu);
  }

  function replaceDashPunctuation() {
    const document = frameRef.current?.contentDocument;
    if (!document?.body) return;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE"].includes(parent.tagName)) continue;
      nodes.push(node as Text);
    }
    nodes.forEach((text) => {
      text.nodeValue = text.nodeValue?.replace(/\s[—–-]\s/g, ", ") ?? null;
    });
  }

  function removeLegacyChangemakerPlaceholder() {
    const document = frameRef.current?.contentDocument;
    if (!document) return;

    // The bundled source includes a Brenda Smith demo card. It must disappear
    // before managed content is fetched, so visitors never see the placeholder.
    const legacyFeature = document.getElementById("cm-portrait")?.parentElement;
    if (legacyFeature?.textContent?.includes("Brenda Smith")) legacyFeature.remove();
  }

  function renderImpactStats(document: Document, stats: SiteContent["impactStats"]) {
    const impactItems = Array.from(document.querySelectorAll<HTMLElement>("#impact > div > div"));
    stats.forEach((stat, index) => {
      const item = impactItems[index];
      if (!item) return;
      const [value, label] = Array.from(item.querySelectorAll<HTMLElement>(":scope > div"));
      if (value) value.textContent = stat.value;
      if (label) label.textContent = stat.label;
    });
  }

  function connectSocialMedia() {
    const document = frameRef.current?.contentDocument;
    if (!document) return;

    const updateLink = (selector: string, href: string, label: string) => {
      const link = document.querySelector<HTMLAnchorElement>(selector);
      if (!link) return;
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", label);
    };

    updateLink('a[aria-label="Follow on Facebook"]', facebookUrl, "Follow Dignity to Rise on Facebook");
    updateLink('a[aria-label="Follow on Instagram"]', instagramUrl, "Follow Dignity to Rise on Instagram");

    const socialTiles = [
      {
        href: "https://www.facebook.com/thedignitytorisemovement/posts/pfbid02kpPCgqPgvoGwPbyJsy2VDSVDb7tLTEUahrie8p5hg8957H7Pn826hwZ3KPGaF9btl",
        image: "/social/facebook-volunteer-drive.jpg",
        alt: "Dignity to Rise volunteer campaign from Facebook",
        label: "View the Dignity to Rise volunteer campaign on Facebook"
      },
      {
        href: "https://www.facebook.com/photo/?fbid=1721973719365588&set=a.614635080099463",
        image: "/social/facebook-filmmaking-workshop.jpg",
        alt: "Dignity to Rise filmmaking workshop post from Facebook",
        label: "View the Dignity to Rise filmmaking workshop post on Facebook"
      },
      {
        href: "https://www.facebook.com/photo/?fbid=1721973699365590&set=a.614635080099463",
        image: "/social/facebook-community-team.jpg",
        alt: "Dignity to Rise community team photo from Facebook",
        label: "View the Dignity to Rise community team photo on Facebook"
      }
    ];

    Array.from(document.querySelectorAll<HTMLAnchorElement>(".d2r-reel")).forEach((tile, index) => {
      const details = socialTiles[index];
      if (!details) return;
      tile.href = details.href;
      tile.target = "_blank";
      tile.rel = "noopener noreferrer";
      tile.setAttribute("aria-label", details.label);
      const image = tile.querySelector("image-slot");
      if (image) {
        image.setAttribute("src", details.image);
        image.setAttribute("alt", details.alt);
      }
    });
  }

  async function applyManagedContent() {
    const document = frameRef.current?.contentDocument;
    if (!document || document.documentElement.dataset.managedContentConnected || document.documentElement.dataset.managedContentLoading) return;
    document.documentElement.dataset.managedContentLoading = "true";
    const impactHeading = document.querySelector<HTMLElement>("#impact > p");
    if (impactHeading) impactHeading.textContent = "The movement in numbers";
    renderImpactStats(document, homepageImpactFallback);
    // The sector cards use “Live”; use the same status language on the opportunity cards.
    document.querySelectorAll("#d2r-opp-carousel .d2r-card").forEach((card) => {
      const activeStatus = Array.from(card.querySelectorAll("div")).find((element) => element.textContent?.trim() === "Active");
      activeStatus?.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = "Live";
      });
    });
    const opportunityCarousel = document.getElementById("d2r-opp-carousel");
    if (opportunityCarousel && !opportunityCarousel.dataset.contentUpdated) {
      opportunityCarousel.dataset.contentUpdated = "true";
      const cards = Array.from(opportunityCarousel.querySelectorAll(":scope > .d2r-card")) as HTMLElement[];
      const updateCard = (card: HTMLElement | undefined, details: { category: string; title: string; status: string; statusColor: string; image: string; imageDescription: string }) => {
        if (!card) return;
        const image = card.querySelector("image-slot");
        if (image) {
          image.setAttribute("src", details.image);
          image.setAttribute("placeholder", details.imageDescription);
        }
        const content = card.querySelector(":scope > div");
        const [category, title, status] = Array.from(content?.children ?? []) as HTMLElement[];
        if (category) category.textContent = details.category;
        if (title) title.textContent = details.title;
        if (status) {
          const dot = (status.querySelector("span") as HTMLElement | null) ?? document.createElement("span");
          dot.style.cssText = `width:7px;height:7px;border-radius:50%;background:${details.statusColor};`;
          status.replaceChildren(dot, document.createTextNode(details.status));
        }
      };

      updateCard(cards[0], {
        category: "Construction",
        title: "Community Business Hubs",
        status: "Planning",
        statusColor: "#AFCEDB",
        image: "/sectors/construction.jpg",
        imageDescription: "Construction workers planning a community business hub"
      });
      updateCard(cards[3], {
        category: "Digital & Remote Work",
        title: "Little Black Book, Community Organisations",
        status: "Live",
        statusColor: "#006A4E",
        image: "/sectors/digital-remote.jpg",
        imageDescription: "A person working remotely on a community organisations directory"
      });

      [cards[0], cards[3], cards[1], cards[2], cards[4]].filter((card): card is HTMLElement => Boolean(card)).forEach((card) => opportunityCarousel.append(card));
    }
    try {
      const content = await fetch("/api/site-content", { cache: "no-store" }).then((response) => response.json()) as SiteContent;
      const setText = (selector: string, value: string) => { const element = document.querySelector(selector); if (element && value) element.textContent = value; };
      const background = document.getElementById("hero-bg");
      if (background && content.heroImage) background.setAttribute("src", content.heroImage);
      const teamPhotos = [
        { id: "team-ellie", src: "/team/elmarie-meyer.png", alt: "Elmarie Meyer" },
        { id: "team-sybil", src: "/team/sybil-doms-pretorius.jpg", alt: "Sybil Doms Pretorius" }
      ];
      teamPhotos.forEach(({ id, src, alt }) => {
        const photo = document.getElementById(id);
        if (photo) {
          photo.style.display = "block";
          photo.setAttribute("src", src);
          photo.setAttribute("alt", alt);
        }
      });
      const elmarieName = document.getElementById("team-ellie")?.closest("a")?.querySelector(":scope > div > div");
      if (elmarieName) elmarieName.textContent = "Elmarie Meyer";
      const transparencyHeading = Array.from(document.querySelectorAll("h2")).find((heading) =>
        heading.textContent?.trim() === "Transparency Builds Trust"
      );
      const transparencyImage = transparencyHeading?.closest("section")?.querySelector("image-slot");
      if (transparencyImage) {
        transparencyImage.setAttribute("src", "/sectors/community.jpg");
        transparencyImage.setAttribute("alt", "Community members joining hands together");
      }
      const changemakersHeading = Array.from(document.querySelectorAll("h1, h2, h3")).find((heading) => heading.textContent?.toLowerCase().includes("changemaker"));
      const changemakersSection = document.getElementById("changemakers") ?? changemakersHeading?.closest("section");
      const changemakerStories = Array.isArray(content.changemakers) ? content.changemakers : [];
      const featuredChangemaker = changemakerStories.find((story) => story.id === content.featuredChangemakerId) ?? changemakerStories[0];
      if (changemakersSection && featuredChangemaker && !changemakersSection.dataset.featuredStoryAdded) {
        changemakersSection.dataset.featuredStoryAdded = "true";
        // The source heading and carousel shell remain beneath the managed feature.
        const feature = document.createElement("article");
        feature.className = "d2r-changemaker-feature";

        const portrait = document.createElement("figure");
        portrait.className = "d2r-changemaker-feature-portrait";
        const portraitImage = document.createElement("img");
        portraitImage.src = featuredChangemaker.image;
        portraitImage.alt = featuredChangemaker.imageAlt;
        portraitImage.loading = "eager";
        portrait.appendChild(portraitImage);

        const copy = document.createElement("div");
        copy.className = "d2r-changemaker-feature-copy";
        const kicker = document.createElement("p");
        kicker.textContent = "Changemaker in focus";
        const name = document.createElement("h2");
        name.textContent = featuredChangemaker.name;
        const role = document.createElement("p");
        role.className = "d2r-changemaker-feature-role";
        role.textContent = [featuredChangemaker.role, featuredChangemaker.organisation].filter(Boolean).join(" · ");
        const quote = document.createElement("p");
        quote.className = "d2r-changemaker-feature-quote";
        quote.textContent = `“${featuredChangemaker.quote}”`;
        const summary = document.createElement("p");
        summary.className = "d2r-changemaker-feature-summary";
        summary.textContent = featuredChangemaker.summary;
        const actions = document.createElement("div");
        actions.className = "d2r-changemaker-feature-actions";
        const readStory = document.createElement("a");
        readStory.href = `/changemakers/${encodeURIComponent(featuredChangemaker.slug)}`;
        readStory.target = "_top";
        readStory.textContent = "Read the story";
        const allStories = document.createElement("a");
        allStories.href = "/changemakers";
        allStories.target = "_top";
        allStories.textContent = "All Changemakers";
        actions.append(readStory, allStories);
        copy.append(kicker, name, role, quote, summary, actions);
        feature.append(portrait, copy);
        changemakersSection.prepend(feature);
      }
      if (changemakersSection && !changemakersSection.dataset.rosterAdded) {
        changemakersSection.dataset.rosterAdded = "true";
        changemakersSection.querySelectorAll(".d2r-cmcard").forEach((card) => { (card as HTMLElement).style.display = "none"; });
        Array.from(changemakersSection.children)
          .filter((child) => !child.contains(changemakersHeading ?? null) && !(child as HTMLElement).classList.contains("d2r-changemaker-feature"))
          .forEach((child) => { (child as HTMLElement).style.display = "none"; });
        const roster = document.createElement("div");
        roster.className = "d2r-changemakers-roster";
        const track = document.createElement("div");
        track.className = "d2r-changemakers-track";
        track.setAttribute("aria-label", "Changemakers");
        const changemakers = [
          { name: "Sybil Doms Pretorius", role: "Project Director", company: "Dignity to Rise", photo: "/team/sybil-doms-pretorius.jpg" },
          { name: "Elmarie Meyer", role: "Programme Director", company: "Dignity to Rise", photo: "/team/elmarie-meyer.png" },
          { name: "Noxolo Liwani", role: "Local Economic Development Officer", company: "Overstrand Municipality", photo: "/team/noxolo-liwani-feature.png" },
          { name: "Xolile Joseph Kosi", role: "Economic Development Practitioner", company: "Overstrand Municipality", photo: "/team/xolile-joseph-kosi.jpeg" },
          { name: "Heinrich Ungerer", role: "Founder & Director", company: "Food Security Program", photo: "/team/heinrich-ungerer.png" }
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
        changemakers.forEach(({ name, role, company, photo }) => {
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
          const companyLabel = document.createElement("small");
          companyLabel.className = "company";
          companyLabel.textContent = company;
          button.append(image, title, label, companyLabel);
          button.addEventListener("click", () => {
            (dialog.querySelector("h2") as HTMLElement).textContent = name;
            (dialog.querySelector("h2 + p") as HTMLElement).textContent = `${role} · ${company}`;
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
      // Keep the value saved in Admin as a reliable public fallback. When the
      // registration database is available, the live count below replaces it.
      const impactStats = content.impactStats.map((stat) => ({ ...stat }));
      renderImpactStats(document, impactStats);
      void fetch("/api/impact-stats", { cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error("Volunteer registrations are unavailable.");
          return response.json() as Promise<{ volunteers?: unknown }>;
        })
        .then((body) => {
          const count = body.volunteers;
          if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) return;
          const volunteerStat = impactStats.find((stat) => stat.key === "volunteers-registered");
          if (!volunteerStat) return;
          volunteerStat.value = String(count);
          renderImpactStats(document, impactStats);
        })
        .catch(() => undefined);
      const sectorTiles = Array.from(document.querySelectorAll("#sectors .d2r-sectors-grid > a"));
      const sectorImageOverrides = [
        { source: "/sectors/agriculture-food-tile.jpg", position: "center" },
        { source: "/sectors/construction-tile.jpg", position: "center" },
        { source: "/sectors/community-tile.jpg", position: "center" },
        { source: "/sectors/digital-remote-tile.jpg", position: "68% center" },
        { source: "/sectors/local-services-tile.jpg", position: "40% center" },
        { source: "/sectors/tourism-tile.jpg", position: "center" }
      ];
      const projectStatusOrder: ProjectStatus[] = ["Live", "Planning", "Complete", "Future"];
      const legacyProjects = (sector: SectorCard): SectorProject[] => [
        ...(sector.liveProjects ?? []).map((name) => ({ name, status: "Live" as const })),
        ...(sector.doneProjects ?? []).map((name) => ({ name, status: "Complete" as const })),
        ...(sector.futureProjects ?? []).map((name) => ({ name, status: "Future" as const }))
      ];
      let sectorModalLauncher: HTMLAnchorElement | null = null;
      content.sectors?.forEach((sector, index) => {
        const tile = sectorTiles[index] as HTMLAnchorElement | undefined;
        if (!tile) return;
        const sectorProjects = sector.projects?.length ? sector.projects : legacyProjects(sector);
        const image = tile.querySelector("image-slot");
        const imageOverride = sectorImageOverrides[index];
        if (image) {
          image.setAttribute("src", imageOverride?.source ?? sector.image);
          image.setAttribute("fit", "cover");
          const imageElement = image as HTMLElement;
          imageElement.style.objectFit = "cover";
          imageElement.style.objectPosition = imageOverride?.position ?? "center";
          imageElement.style.filter = "saturate(1.08) contrast(1.08)";
        }
        const title = tile.querySelector("h3");
        if (title) title.textContent = sector.title;
        const stats = title?.nextElementSibling;
        const values = [
          String(sectorProjects.filter((project) => project.status === "Live").length),
          String(sectorProjects.filter((project) => project.status === "Complete").length),
          String(sectorProjects.filter((project) => project.status === "Planning" || project.status === "Future").length)
        ];
        stats?.querySelectorAll("span").forEach((stat, statIndex) => {
          const labels = ["Live", "Complete", "Future"];
          const value = document.createElement("strong");
          value.style.cssText = "color:#fff;font-weight:600;";
          value.textContent = values[statIndex] ?? "0";
          stat.replaceChildren(value, document.createTextNode(` ${labels[statIndex] ?? ""}`));
        });
        tile.setAttribute("href", "#sector-projects");
        tile.onclick = (event) => {
          event.preventDefault();
          sectorModalLauncher = tile;
          let modal = document.getElementById("d2r-sector-projects") as HTMLDivElement | null;
          if (!modal) {
            const createdModal = document.createElement("div");
            createdModal.id = "d2r-sector-projects";
            createdModal.innerHTML = '<div class="d2r-sector-dialog" role="dialog" aria-modal="true" aria-labelledby="d2r-sector-heading"><button class="d2r-sector-close" type="button" aria-label="Close project details">Close</button><p></p><h2 id="d2r-sector-heading"></h2><div class="d2r-sector-project-content"></div></div>';
            const closeModal = () => {
              createdModal.classList.remove("is-open");
              sectorModalLauncher?.focus();
            };
            createdModal.addEventListener("click", (closeEvent) => {
              const target = closeEvent.target as Element | null;
              if (closeEvent.target === createdModal || target?.closest(".d2r-sector-close")) closeModal();
            });
            document.addEventListener("keydown", (keyEvent) => {
              if (keyEvent.key === "Escape" && createdModal.classList.contains("is-open")) closeModal();
            });
            document.body.appendChild(createdModal);
            modal = createdModal;
          }
          if (!modal) return;
          const dialog = modal.querySelector(".d2r-sector-dialog");
          const eyebrow = dialog?.querySelector<HTMLParagraphElement>(":scope > p");
          const heading = dialog?.querySelector<HTMLHeadingElement>(":scope > h2");
          const lists = dialog?.querySelector<HTMLDivElement>(":scope > .d2r-sector-project-content");
          if (eyebrow) eyebrow.textContent = "Sector projects";
          if (heading) heading.textContent = sector.title;
          if (lists) {
            lists.replaceChildren();
            let renderedGroups = 0;
            projectStatusOrder.forEach((status) => {
              const projects = sectorProjects.filter((project) => project.status === status);
              if (!projects.length) return;
              const group = document.createElement("section");
              group.className = "d2r-project-group";
              const groupHeading = document.createElement("h3"); groupHeading.textContent = `${status} (${projects.length})`;
              const list = document.createElement("div");
              list.className = "d2r-project-list";
              projects.forEach((project) => {
                const card = document.createElement("article");
                card.className = "d2r-project-card";
                const header = document.createElement("div");
                header.className = "d2r-project-header";
                const name = document.createElement("h4");
                name.textContent = project.name;
                const meta = document.createElement("div");
                meta.className = "d2r-project-meta";
                const statusBadge = document.createElement("span");
                statusBadge.className = `d2r-project-status d2r-project-status--${project.status.toLowerCase()}`;
                statusBadge.textContent = project.status;
                meta.appendChild(statusBadge);
                if (project.reference) {
                  const reference = document.createElement("span");
                  reference.textContent = `Ref. ${project.reference}`;
                  meta.appendChild(reference);
                }
                header.append(name, meta);
                const details = document.createElement("dl");
                details.className = "d2r-project-details";
                const addDetail = (label: string, detail: string | undefined) => {
                  const value = detail?.trim();
                  if (!value) return;
                  const item = document.createElement("div");
                  if (label === "Notes") item.className = "is-notes";
                  const term = document.createElement("dt");
                  term.textContent = label;
                  const description = document.createElement("dd");
                  description.textContent = value;
                  item.append(term, description);
                  details.appendChild(item);
                };
                addDetail("Tranche 1 outcome", project.trancheOneOutcome);
                addDetail("Future tranche", project.futureTrancheOutcome);
                addDetail("Goes live in", project.goLiveTranche);
                addDetail("Notes", project.notes);
                card.appendChild(header);
                if (details.children.length) card.appendChild(details);
                list.appendChild(card);
              });
              group.append(groupHeading, list); lists.appendChild(group);
              renderedGroups += 1;
            });
            if (!renderedGroups) {
              const empty = document.createElement("p");
              empty.textContent = "No projects are listed for this sector yet.";
              lists.appendChild(empty);
            }
          }
          modal.classList.add("is-open");
          modal.querySelector<HTMLButtonElement>(".d2r-sector-close")?.focus();
        };
      });
      delete document.documentElement.dataset.managedContentLoading;
      document.documentElement.dataset.managedContentConnected = "true";
    } catch (error) {
      delete document.documentElement.dataset.managedContentLoading;
      console.error("Could not apply managed site content", error);
    }
  }

  useEffect(() => {
    const attachHomepageEnhancements = () => { connectParticipationLinks(); connectNewsletterSignup(); connectSocialMedia(); compactFooter(); makeHomepageMobileFriendly(); polishHero(); removeLegacyChangemakerPlaceholder(); applyManagedContent(); replaceDashPunctuation(); };
    attachHomepageEnhancements();
    const timer = window.setInterval(attachHomepageEnhancements, 250);
    return () => window.clearInterval(timer);
  }, []);

  return <main className="bundled-homepage" style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}>
    <iframe ref={frameRef} onLoad={() => { connectParticipationLinks(); connectNewsletterSignup(); connectSocialMedia(); compactFooter(); makeHomepageMobileFriendly(); polishHero(); removeLegacyChangemakerPlaceholder(); applyManagedContent(); replaceDashPunctuation(); }} title="Dignity to Rise Overstrand" src="/dignity-to-rise-homepage.html" className="bundled-homepage-frame" style={{ display: "block", width: "100vw", height: "100vh", border: 0 }} />
  </main>;
}
