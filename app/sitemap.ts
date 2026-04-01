import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const locales = ["en", "de", "es", "fr", "it"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/photo-requirements",
    "/reviews",
    "/blog",
    "/terms",
    "/privacy",
    "/refund",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : 0.7,
      });
    }
  }

  // Documentation pages
  entries.push({
    url: `${baseUrl}/docs`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  });

  return entries;
}
