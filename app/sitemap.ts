import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/StructuredData";
import { lessons } from "@/content/lessons";
import { paths } from "@/content/paths";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/grow`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const pathRoutes: MetadataRoute.Sitemap = paths.map((p) => ({
    url: `${siteUrl}/paths/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const lessonRoutes: MetadataRoute.Sitemap = lessons.map((l) => ({
    url: `${siteUrl}/learn/${l.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...pathRoutes, ...lessonRoutes];
}
