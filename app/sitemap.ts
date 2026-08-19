import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/services";
import { CASE_PAGES } from "@/lib/cases";

/** дата берётся из сборки: каждый деплой обновляет lastmod, руками править нечего */
const BUILT_AT = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, lastModified: BUILT_AT, changeFrequency: "weekly", priority: 1 },
    ...SERVICE_PAGES.map((s) => ({
      url: `${SITE.url}/uslugi/${s.slug}`,
      lastModified: BUILT_AT,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...CASE_PAGES.map((c) => ({
      url: `${SITE.url}/works/${c.slug}`,
      lastModified: BUILT_AT,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
