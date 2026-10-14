import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/services";
import { CASE_PAGES } from "@/lib/cases";
import { INDUSTRY_PAGES } from "@/lib/industries";

/**
 * lastmod не отдаём: дата сборки у всех страниц была бы ложной (каждый деплой "меняет" всё),
 * и поисковики перестают ей верить. Настоящих дат правки в данных нет.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "weekly", priority: 1 },
    // витрины разделов: с них расходится вес на частные страницы
    { url: `${SITE.url}/uslugi`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/works`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/dlya`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/obo-mne`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/politika`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/soglasie`, changeFrequency: "yearly", priority: 0.3 },
    ...SERVICE_PAGES.map((s) => ({
      url: `${SITE.url}/uslugi/${s.slug}`,
     
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...INDUSTRY_PAGES.map((i) => ({
      url: `${SITE.url}/dlya/${i.slug}`,
     
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...CASE_PAGES.map((c) => ({
      url: `${SITE.url}/works/${c.slug}`,
     
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
