import type { Metadata } from "next";
import { CASE_PAGES } from "@/lib/cases";
import { SITE, WORKS, PROJECTS_TOTAL, hostOf } from "@/lib/content";
import { Hub } from "@/components/v4/works/Hub";
import { SITES } from "@/components/v4/works/data";

/**
 * Витрина работ: все живые сайты карточками с фильтром и разборы проектов.
 * На главной показаны шесть сайтов и строка адресов, эта страница отдаёт роботу и человеку всё сразу.
 */
export const metadata: Metadata = {
  title: `Работы: ${PROJECTS_TOTAL} живых сайтов и разборы проектов | lstmind`,
  description:
    `Портфолио веб-разработчика: ${PROJECTS_TOTAL} проектов в проде — магазины на WooCommerce, корпоративные сайты, каталоги, боты и демо-проекты. Разборы кейсов с задачей, стеком и ссылкой на живой сайт.`,
  alternates: { canonical: "/works" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE.ogName,
    url: `${SITE.url}/works`,
    title: `Работы: ${PROJECTS_TOTAL} живых сайтов | lstmind`,
    description: "Магазины, корпоративные сайты, каталоги, боты и демо-проекты с разбором и ссылками.",
  },
  twitter: {
    card: "summary_large_image",
    title: `Работы: ${PROJECTS_TOTAL} живых сайтов | lstmind`,
    description: "Магазины, корпоративные сайты, каталоги, боты и демо-проекты с разбором и ссылками.",
  },
};

export default function WorksIndexPage() {
  const cases = CASE_PAGES.map((c) => ({ c, w: WORKS.find((x) => hostOf(x.href) === hostOf(c.href)) })).filter(
    (x) => x.w
  ) as { c: (typeof CASE_PAGES)[number]; w: (typeof WORKS)[number] }[];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE.url}/works#page`,
        name: "Работы",
        description: `${PROJECTS_TOTAL} живых проектов и разборы кейсов`,
        url: `${SITE.url}/works`,
        inLanguage: "ru",
        isPartOf: { "@id": `${SITE.url}#website` },
        about: { "@id": `${SITE.url}#person` },
      },
      {
        "@type": "ItemList",
        name: "Разборы проектов",
        numberOfItems: cases.length,
        itemListElement: cases.map(({ c, w }, n) => ({
          "@type": "ListItem",
          position: n + 1,
          name: w.title,
          url: `${SITE.url}/works/${c.slug}`,
        })),
      },
      {
        "@type": "ItemList",
        name: "Живые сайты",
        numberOfItems: SITES.length,
        itemListElement: SITES.map((s, n) => ({
          "@type": "ListItem",
          position: n + 1,
          name: s.title,
          url: s.href,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Работы", item: `${SITE.url}/works` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Hub />
    </>
  );
}
