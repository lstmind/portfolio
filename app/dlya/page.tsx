import type { Metadata } from "next";
import { Crumbs, PageCta, PageFooter, PageHeader } from "@/components/PageChrome";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { SERVICE_PAGES } from "@/lib/services";
import { SITE } from "@/lib/content";

/**
 * Витрина ниш. Раньше на отраслевые страницы вела только строка внутри
 * страницы-хаба, и вторая ступень их крошек указывала в «Услуги» — то есть
 * раздела как такового не существовало.
 */
export const metadata: Metadata = {
  title: "Сайты по нишам: общепит, салоны, производство, магазины | lstmind",
  description:
    "Ниши, в которых уже работал: кафе и бары, салоны красоты, производство, окна, мебель, доставка еды, перевозки, магазины одежды, ремонт. У каждой свои обязательные блоки, цена и срок.",
  alternates: { canonical: "/dlya" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE.ogName,
    url: `${SITE.url}/dlya`,
    title: "Сайты по нишам | lstmind",
    description: "Кафе и бары, салоны красоты, производство, окна, мебель, доставка еды, перевозки, магазины.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Сайты по нишам | lstmind",
    description: "Кафе и бары, салоны красоты, производство, окна, мебель, доставка еды, перевозки, магазины.",
  },
};

export default function IndustriesIndex() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE.url}/dlya#page`,
        name: "Сайты по нишам",
        description: "Ниши, в которых уже есть готовые проекты",
        url: `${SITE.url}/dlya`,
        inLanguage: "ru",
        isPartOf: { "@id": `${SITE.url}#website` },
        about: { "@id": `${SITE.url}#person` },
      },
      {
        "@type": "ItemList",
        name: "Ниши",
        numberOfItems: INDUSTRY_PAGES.length,
        itemListElement: INDUSTRY_PAGES.map((i, n) => ({
          "@type": "ListItem",
          position: n + 1,
          name: i.h1,
          url: `${SITE.url}/dlya/${i.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Ниши", item: `${SITE.url}/dlya` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHeader />

      <main className="doc" id="main">
        <div className="doc-wrap">
          <Crumbs items={[{ name: "Главная", href: "/" }, { name: "Ниши" }]} />

          <h1>Сайты по нишам</h1>
          <p className="doc-answer">
            Сайт кафе, салона и завода устроены по-разному: разный путь до заявки, разные
            обязательные блоки, разная цена ошибки. Вот {INDUSTRY_PAGES.length} ниш, в которых у меня
            уже есть готовые проекты — с ценами, сроками и примерами.
          </p>

          <h2 className="doc-h2-first">Ниши с готовыми проектами</h2>
          <div className="doc-others">
            {INDUSTRY_PAGES.map((i) => (
              <a href={`/dlya/${i.slug}`} key={i.slug}>
                <b>{i.h1}</b>
                <span>{i.short}</span>
                <i className="mono">
                  {i.price.value} · {i.term.value}
                </i>
              </a>
            ))}
          </div>

          <h2>Если вашей ниши тут нет</h2>
          <p className="doc-lead">
            Это не значит, что я с ней не работал: на страницы вынесены только те, где набралось
            несколько проектов подряд. Всё остальное собирается по типу сайта, а не по отрасли.
          </p>
          <div className="doc-others">
            {SERVICE_PAGES.filter((s) => s.hub || ["sayt-vizitka", "lending", "internet-magazin"].includes(s.slug))
              .slice(0, 4)
              .map((s) => (
                <a href={`/uslugi/${s.slug}`} key={s.slug}>
                  <b>{s.h1}</b>
                  <span>{s.short}</span>
                  <i className="mono">{s.price.value}</i>
                </a>
              ))}
          </div>

          <p className="doc-note">
            Полный список услуг — <a href="/uslugi">в разделе услуг</a>, готовые проекты —{" "}
            <a href="/works">в работах</a>.
          </p>
        </div>
      </main>

      <PageCta
        title="Расскажите про свою нишу"
        text="Напишу, какие блоки в ней обязательны, а на чём можно сэкономить. Отвечаю в течение часа, разбор задачи бесплатный."
      />
      <PageFooter />
    </>
  );
}
