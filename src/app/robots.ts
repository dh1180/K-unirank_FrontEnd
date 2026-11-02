import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { productionHost, SITE_ORIGIN } from "@/lib/site-policy.mjs";

// Development-only preview: DO NOT index until SEO/canonical migration is complete.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const production = productionHost(
    (await headers()).get("host"),
    process.env.SITE_MODE,
  );
  return production
    ? {
        rules: [
          {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/api/", "/health/", "/swagger-ui/", "/api-docs/"],
          },
        ],
        sitemap: `${SITE_ORIGIN}/sitemap.xml`,
      }
    : { rules: [{ userAgent: "*", disallow: "/" }] };
}
