import { Fragment } from "react";
import type { Metadata } from "next";
import { SERVICE_PAGES, serviceBySlug } from "@/lib/services";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { REPLY, SITE, NOT_DOING, TITLE_TAIL } from "@/lib/content";
import { RATE, SITE_FROM } from "@/lib/home";
import { tgText } from "@/lib/cta";
import { Shell } from "@/components/v4/Shell";
import { PriceFactors } from "@/components/v4/uslugi/Factors";
import { Figure } from "@/components/v4/Figure";
import { tie } from "@/components/v4/typo";
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
/** цена сайта под ключ из его страницы: "от 30 000 ₽" */
const FROM = serviceBySlug("sayt-pod-klyuch")!.price.value;
const OG_TITLE = "Что делаю и сколько это стоит";
const OG_TEXT = `Сайты ${SITE_FROM}, магазины, боты, админки, починка и ускорение чужих сайтов. У каждой услуги своя цена и срок, ставка ${RATE}, договор и чек.`;

export const metadata: Metadata = {
  title: `Услуги веб-разработчика: цены на создание сайтов и сроки${TITLE_TAIL}`,
  description: `Создание сайтов под ключ ${FROM}, магазины, боты, админки, доработка и ускорение чужих сайтов. Цена и срок по каждой услуге, Москва и вся Россия.`,
  alternates: { canonical: "/uslugi" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE.ogName,
    url: `${SITE.url}/uslugi`,
    title: OG_TITLE,
    description: OG_TEXT,
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_TEXT,
  },
};

const NB = " ";
/** первое сообщение в Telegram со страницы услуг: у шапки, язычка, подвала, первого экрана и финала одно */
const MSG = tgText({ kind: "page", name: "Услуги и цены" });

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
    <Shell current="/uslugi" main="u-page" tg={MSG} after=".u-hero .u-tg" until="#u-final-t">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="u-hero u-hero--hub" id="u-hero" aria-labelledby="u-h1">
        <div className="u-hero-txt">
          <Crumbs items={[{ name: "Главная", href: "/" }]} />
          <Word as="h1" text="Услуги" id="u-h1" />
          <p className="u-answer">
            Делаю сайты под ключ {FROM.replace(/ /g, NB)}, магазины и{NB}ботов, дорабатываю и{NB}ускоряю чужие сайты. У{NB}каждого
            из{NB}{SERVICE_PAGES.length} направлений своя цена, свой срок и примеры работ. Если задача на стыке, напишите: разберём и скажу, с чего начинать.
          </p>
          <ul className="u-meta">
            <li>
              Ставка <b>{RATE}</b>
            </li>
            <li>
              По проекту <b>фикс-смета</b>
            </li>
            <li>
              Самозанятый: <b>договор, акт и{NB}чек</b>
            </li>
          </ul>
          <div className="u-hero-act">
            <TgButton text={MSG} className="u-cta" />
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
          <Fragment key={g.title}>
            <div className="u-wide">
              <Sign id={["u-new", "u-old", "u-code"][i]} title={g.title} side={g.side} services={g.services} />
            </div>
            {/* из чего складывается цена: сразу под ценами новых сайтов, к ним он и относится */}
            {i === 0 && <PriceFactors />}
          </Fragment>
        ))}

        <Niches
          niches={INDUSTRY_PAGES}
          intro="В некоторых нишах сайт устроен иначе: там свои обязательные блоки и свой путь до заявки. Вот те, с которыми работал плотнее всего."
        />

        <section className="u-no" id="u-no" aria-labelledby="u-no-t">
          <div className="u-no-head">
            {/* tie склеивает "не моё," и "но помогу": на телефоне ровно две строки */}
            <Word as="h2" text={tie("Не моё, но помогу")} id="u-no-t" />
            <p className="u-intro">
              {tie("Сам этим не занимаюсь, но и не отправлю ни с чем: подключу коллегу, сделаем в паре или подскажу, к кому идти.")}
            </p>
          </div>
          <ul className="u-no-list">
            {NOT_DOING.map((n) => (
              <li key={n.what}>
                <b>
                  <span className="u-no-x">{n.what}</span>
                </b>
                <span>
                  {tie(n.why)}
                  {/* моя часть этой работы своей услугой: "сайт под рекламу подготовлю сам" */}
                  {n.more && (
                    <a className="u-no-more" href={n.more.href}>
                      {n.more.label}
                      <Go />
                    </a>
                  )}
                </span>
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
        text={`Напишите в двух словах, что нужно. Скажу честно: берусь или нет, сколько это стоит и сколько займёт. ${REPLY.line}`}
        msg={MSG}
      />

      <SignsIsland />
      <NichesIsland />
      <StrikeIsland />
      <WordsIsland />
    </Shell>
  );
}
