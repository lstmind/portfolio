import type { Metadata } from "next";
import { CASE_PAGES } from "@/lib/cases";
import { SITE, WORKS, PROJECTS_TOTAL, TITLE_TAIL, hostOf } from "@/lib/content";
import { liveSitesWord } from "@/lib/home";
import { Hub } from "@/components/v4/works/Hub";
import { SITES } from "@/components/v4/works/data";

/**
 * Витрина работ: все живые сайты карточками с фильтром и разборы проектов.
 * На главной показаны шесть сайтов и строка адресов, эта страница отдаёт роботу и человеку всё сразу.
 */
const N_CASES = SITES.filter((s) => s.caseSlug).length;
const OG_TITLE = `${PROJECTS_TOTAL} ${liveSitesWord()}, каждый открывается`;
const OG_TEXT = `Магазины, сайты компаний, каталоги и свои демо. Каждый можно открыть и потыкать руками, у ${N_CASES} есть разбор: задача, стек и что сделано.`;

export const metadata: Metadata = {
  title: `Портфолио веб-разработчика: ${PROJECTS_TOTAL} ${liveSitesWord()} и разборы${TITLE_TAIL}`,
  description:
    `Портфолио веб-разработчика: ${PROJECTS_TOTAL} ${liveSitesWord()} можно открыть по ссылке. Магазины на WooCommerce, корпоративные сайты, каталоги, боты. Разборы кейсов со стеком.`,
  alternates: { canonical: "/works" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE.ogName,
    url: `${SITE.url}/works`,
    title: OG_TITLE,
    description: OG_TEXT,
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_TEXT,
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
        description: `${PROJECTS_TOTAL} ${liveSitesWord()} и разборы кейсов`,
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
