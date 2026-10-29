import type { MetadataRoute } from "next";
import { SITE_ORIGIN, sitemapDate } from "@/lib/site-policy.mjs";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.API_INTERNAL_URL;
  if (!base) throw new Error("Sitemap API is not configured");
  const response = await fetch(new URL("/api/v1/seo/urls", base), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Sitemap API unavailable");
  const urls: Array<{
    path: string;
    lastModified: string | null;
    changeFrequency: "daily" | "weekly";
    priority: number;
  }> = await response.json();
  return urls.map((item) => ({
    url: SITE_ORIGIN + item.path,
    lastModified: item.lastModified ? sitemapDate(item.lastModified) : undefined,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
