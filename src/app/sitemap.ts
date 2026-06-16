import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/seo/sitemap-data";
import { getSiteUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  try {
    const entries = await getSitemapEntries();

    return entries.map((entry) => ({
      url: `${base}${entry.path}`,
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    }));
  } catch (error) {
    console.error("[sitemap] Falha ao gerar entradas:", error);

    return [
      {
        url: `${base}/`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }
}
