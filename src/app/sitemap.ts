import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/seo/sitemap-data";
import { getSiteUrl } from "@/lib/seo/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries = await getSitemapEntries();

  return entries.map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
