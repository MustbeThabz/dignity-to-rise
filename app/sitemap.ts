import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dignitytorise.co.za";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/volunteer", "/partner", "/mentor", "/fund", "/changemakers"];

  return routes.map((route) => ({
    url: new URL(route || "/", siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
