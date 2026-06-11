import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date("2026-06-11"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
