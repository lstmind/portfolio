import type { Metadata } from "next";
import { SERVICE_PAGES } from "@/lib/services";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { SITE, NOT_DOING } from "@/lib/content";
import { RATE } from "@/lib/home";
import { Figure } from "@/components/v4/Figure";
import { Crumbs, FinalCta, Go, TgButton, Word } from "@/components/v4/uslugi/bits";
import { Niches } from "@/components/v4/uslugi/Service";
import { Sign } from "@/components/v4/uslugi/Sign";
import { HUB_GROUPS } from "@/components/v4/uslugi/data";
import { NichesIsland, SignsIsland, StrikeIsland, WordsIsland } from "@/components/v4/uslugi/islands";

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

const NB = " ";

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="u-hero u-hero--hub" id="u-hero" aria-labelledby="u-h1">
        <div className="u-hero-txt">
          <Crumbs items={[{ name: "Главная", href: "/" }]} />
          <Word as="h1" text="Услуги" id="u-h1" />
          <p className="u-answer">
            {SERVICE_PAGES.length} направлений: от сайта под ключ за 15{NB}000{NB}₽ до админки с CRM. У каждой страницы своя
            цена, свой срок и примеры работ. Если задача на стыке, напишите: разберём и скажу, с чего начинать.
          </p>
          <ul className="u-meta">
            <li>
              час работы <b>{RATE}</b>
            </li>
            <li>
              по проекту <b>фикс-смета</b>
            </li>
            <li>
              самозанятый: <b>договор, акт и{NB}чек</b>
            </li>
          </ul>
          <div className="u-hero-act">
            <TgButton text="Здравствуйте! Пишу со страницы услуг на lstmind.ru." className="u-cta" />
            <a className="u-hero-jump" href="#u-new">
              Смотреть цены ↓
            </a>
          </div>
        </div>
        <figure className="u-hero-fig">
          <span className="u-fig-box">
            <Figure
              pose="j5"
              alt="Алексей пишет смету на листе"
              sizes="(max-width: 699px) 128px, min(30vh, 300px)"
              loading="eager"
              fetchPriority="high"
            />
          </span>
        </figure>
      </section>

      <div className="u-flow">
        {HUB_GROUPS.map((g, i) => (
          <div className="u-wide" key={g.title}>
            <Sign id={["u-new", "u-old", "u-code"][i]} title={g.title} side={g.side} services={g.services} />
          </div>
        ))}

        <Niches
          niches={INDUSTRY_PAGES}
          intro="В некоторых нишах сайт устроен иначе: там свои обязательные блоки и свой путь до заявки. Вот те, с которыми работал плотнее всего."
        />

        <section className="u-no" id="u-no" aria-labelledby="u-no-t">
          <div className="u-no-head">
            <Word as="h2" text="Не делаю" id="u-no-t" />
            <p className="u-intro">
              Честный список: если задача из него, я подскажу, к кому идти, но браться не буду. Так быстрее для обеих сторон.
            </p>
          </div>
          <ul className="u-no-list">
            {NOT_DOING.map((n) => (
              <li key={n.what}>
                <b>
                  <span className="u-no-x">{n.what}</span>
                </b>
                <span>{n.why}</span>
              </li>
            ))}
          </ul>
          <figure className="u-no-fig" aria-hidden="true">
            <Figure pose="j9" sizes="(max-width: 699px) 120px, 220px" />
          </figure>
        </section>

        <p className="u-note">
          Готовые проекты{" "}
          <a href="/works">
            в разделе работ <Go />
          </a>
          . Прикинуть цену самому можно{" "}
          <a href="/#final">
            в калькуляторе <Go />
          </a>
          .
        </p>
      </div>

      <FinalCta
        word="Не нашли?"
        text="Напишите в двух словах, что нужно. Отвечу в течение часа и скажу честно: берусь, сколько это стоит и сколько займёт."
        msg="Здравствуйте! Пишу со страницы услуг на lstmind.ru."
      />

      <SignsIsland />
      <NichesIsland />
      <StrikeIsland />
      <WordsIsland />
    </>
  );
}
