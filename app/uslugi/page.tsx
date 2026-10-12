import type { Metadata } from "next";
import { Crumbs, PageCta, PageFooter, PageHeader } from "@/components/PageChrome";
import { SERVICE_PAGES } from "@/lib/services";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { SITE, NOT_DOING, priceNumber } from "@/lib/content";

/**
 * Витрина всех услуг. До неё раздел был плоским: страницы услуг висели
 * ссылками с главной, а /uslugi отдавал 404 — крошкам было некуда вести,
 * а вес с главной размазывался на шестнадцать адресов сразу.
 */
export const metadata: Metadata = {
  title: "Услуги веб-разработчика: цены и сроки | lstmind",
  description:
    "Что делаю и сколько это стоит: сайты под ключ от 15 000 ₽, магазины, корпоративные сайты, боты, админки, починка и ускорение чужих сайтов. Цена и срок по каждой услуге, Москва и вся Россия.",
  alternates: { canonical: "/uslugi" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE.ogName,
    url: `${SITE.url}/uslugi`,
    title: "Услуги веб-разработчика: цены и сроки | lstmind",
    description: "Сайты под ключ, магазины, боты, админки, починка и ускорение чужих сайтов. Цена и срок по каждой услуге.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Услуги веб-разработчика: цены и сроки | lstmind",
    description: "Сайты под ключ, магазины, боты, админки, починка и ускорение чужих сайтов.",
  },
};

export default function ServicesIndex() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE.url}/uslugi#page`,
        name: "Услуги веб-разработчика",
        description: "Полный список услуг с ценами и сроками",
        url: `${SITE.url}/uslugi`,
        inLanguage: "ru",
        isPartOf: { "@id": `${SITE.url}#website` },
        about: { "@id": `${SITE.url}#person` },
      },
      {
        "@type": "ItemList",
        name: "Услуги",
        numberOfItems: SERVICE_PAGES.length,
        itemListElement: SERVICE_PAGES.map((s, n) => ({
          "@type": "ListItem",
          position: n + 1,
          name: s.h1,
          url: `${SITE.url}/uslugi/${s.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Услуги", item: `${SITE.url}/uslugi` },
        ],
      },
    ],
  };

  // дешёвые впереди: человек с бюджетом «посмотреть» не должен упереться в 40 000 ₽ первой строкой
  const sorted = [...SERVICE_PAGES].sort(
    (a, b) => (priceNumber(a.price.value) ?? 1e9) - (priceNumber(b.price.value) ?? 1e9)
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHeader />

      <main className="doc" id="main">
        <div className="doc-wrap">
          <Crumbs items={[{ name: "Главная", href: "/" }, { name: "Услуги" }]} />

          <h1>Услуги</h1>
          <p className="doc-answer">
            {SERVICE_PAGES.length} направлений: от сайта под ключ за 15 000 ₽ до админки с CRM.
            У каждой страницы своя цена, свой срок и примеры работ. Если задача на стыке, напишите:
            разберём и скажу, с чего начинать.
          </p>

          <h2 className="doc-h2-first">Все услуги</h2>
          <div className="doc-others">
            {sorted.map((s) => (
              <a href={`/uslugi/${s.slug}`} key={s.slug}>
                <b>{s.h1}</b>
                <span>{s.short}</span>
                <i className="mono">
                  {s.price.value} · {s.term.value}
                </i>
              </a>
            ))}
          </div>

          <h2>Под вашу нишу</h2>
          <p className="doc-lead">
            В некоторых нишах сайт устроен иначе: там свои обязательные блоки и свой путь до заявки.
            Вот те, с которыми работал плотнее всего.
          </p>
          <div className="doc-others">
            {INDUSTRY_PAGES.map((i) => (
              <a href={`/dlya/${i.slug}`} key={i.slug}>
                <b>{i.h1}</b>
                <span>{i.short}</span>
                <i className="mono">{i.price.value}</i>
              </a>
            ))}
          </div>

          <h2>Чего я не делаю</h2>
          <p className="doc-lead">
            Честный список: если задача из него, я подскажу, к кому идти, но браться не буду.
            Так быстрее для обеих сторон.
          </p>
          <ul className="doc-list doc-list--plain">
            {NOT_DOING.map((n) => (
              <li key={n.what}>
                <b>{n.what}</b> — {n.why}
              </li>
            ))}
          </ul>

          <p className="doc-note">
            Готовые проекты — <a href="/works">в разделе работ</a>. Прикинуть цену самому можно{" "}
            <a href="/#calc">в калькуляторе</a>.
          </p>
        </div>
      </main>

      <PageCta
        title="Не нашли свою задачу?"
        text="Напишите в двух словах, что нужно. Отвечу в течение часа и скажу честно: берусь, сколько это стоит и сколько займёт."
      />
      <PageFooter />
    </>
  );
}
