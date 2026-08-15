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
    if (!document || document.getElementById("d2r-hero-polish")) return;
    const style = document.createElement("style");
    style.id = "d2r-hero-polish";
    style.textContent = `
      #top { height: 100svh !important; min-height: 700px !important; }
      #hero-bg { transform: scale(1.08); transform-origin: center; filter: saturate(1.04) contrast(1.03); }
      #d2r-hero-brand { position:absolute; z-index:6; right:clamp(22px,3vw,56px); bottom:clamp(74px,10vh,116px); width:clamp(138px,12vw,210px); pointer-events:none; opacity:.48; }
      #d2r-hero-brand img { display:block; width:100%; height:auto; filter:brightness(0) invert(1) drop-shadow(0 3px 14px rgba(0,0,0,.42)); }
      @media (max-width: 700px) { #top { min-height: 650px !important; } #hero-bg { transform:scale(1.12); } #d2r-hero-brand { width:118px; right:16px; bottom:80px; opacity:.42; } }
    `;
    document.head.appendChild(style);
    const hero = document.getElementById("top");
    if (!hero) return;
    const brand = document.createElement("div");
    brand.id = "d2r-hero-brand";
    brand.setAttribute("aria-label", "The Dignity to Rise Movement");
    brand.innerHTML = '<img src="/brand/dignity-to-rise-logo.png" alt="The Dignity to Rise Movement">';
    hero.appendChild(brand);
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
      ["team-ellie", "team-sybil"].forEach((id) => {
        const photo = document.getElementById(id);
        if (photo) photo.style.display = "none";
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
    } catch (error) { console.error("Could not apply managed site content", error); }
  }

  useEffect(() => {
    const attachHomepageEnhancements = () => { connectParticipationLinks(); compactFooter(); polishHero(); applyManagedContent(); };
    attachHomepageEnhancements();
    const timer = window.setInterval(attachHomepageEnhancements, 250);
    return () => window.clearInterval(timer);
  }, []);

  return <main className="bundled-homepage" style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}>
    <iframe ref={frameRef} onLoad={() => { connectParticipationLinks(); polishHero(); applyManagedContent(); }} title="Dignity to Rise Overstrand" src="/dignity-to-rise-homepage.html" className="bundled-homepage-frame" style={{ display: "block", width: "100vw", height: "100vh", border: 0 }} />
  </main>;
}
