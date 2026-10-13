import type { Metadata } from "next";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { SITE, plural } from "@/lib/content";
import { Figure } from "@/components/v4/Figure";
import { Crumbs, FinalCta, Go, Sign, TgButton, Word } from "@/components/v4/dlya/parts";
import { HUB_FALLBACK, leadSite, serviceSite, serviceWord, sitesOf, wordOf } from "@/components/v4/dlya/data";
import { HubPoseIsland, SignsIsland, WordsIsland } from "@/components/v4/dlya/islands";

const NB = " ";

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

/** поза "приглашает": ладонь вправо, на вывеску; холст 476x984 (public/img/v4/ill/hubs-cases.json) */
const HP_SET = [
  [560, 271],
  [780, 377],
  [984, 476],
  [1400, 677],
]
  .map(([h, w]) => `/img/v4/ill/h-priglashaet-${h}.webp ${w}w`)
  .join(", ");

const HUB_MSG = `Здравствуйте! Пишу со страницы "Сайты по нишам" на lstmind.ru.`;

export default function IndustriesIndex() {
  const n = INDUSTRY_PAGES.length;
  const nSites = new Set(INDUSTRY_PAGES.flatMap((i) => sitesOf(i).map((s) => s.host))).size;

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
        numberOfItems: n,
        itemListElement: INDUSTRY_PAGES.map((i, k) => ({
          "@type": "ListItem",
          position: k + 1,
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

      {/* ── первый экран: "сайты для", ответ, персонаж показывает вниз, на список ── */}
      <section className="dl-hero dl-hero--hub" id="dl-hero" aria-labelledby="dl-h1">
        <div className="dl-hero-txt">
          <Crumbs items={[{ name: "Главная", href: "/" }]} />
          <h1 className="dl-kicker" id="dl-h1">
            Сайты по нишам
          </h1>
          <div className="dl-title" aria-hidden="true">
            <Word text="Сайты для" />
          </div>
          <p className="dl-answer">
            Сайт кафе, салона и завода устроены по-разному: разный путь до заявки, разные обязательные блоки, разная цена
            ошибки. Вот {n}
            {NB}
            {plural(n, ["ниша", "ниши", "ниш"])}, в которых у меня уже есть готовые проекты, с ценами, сроками и примерами.
          </p>
          <ul className="dl-meta">
            <li>
              <b>{n}</b> {plural(n, ["ниша", "ниши", "ниш"])}
            </li>
            <li>
              <b>{nSites}</b> {plural(nSites, ["живой сайт", "живых сайта", "живых сайтов"])} в{NB}них
            </li>
            <li>Договор и{NB}чек</li>
          </ul>
          <div className="dl-hero-act">
            <TgButton text={HUB_MSG} className="dl-cta" />
            <a className="dl-hero-jump" href="#dl-niches">
              Смотреть ниши ↓
            </a>
          </div>
        </div>
        <figure className="dl-hero-fig">
          <Figure
            pose="j3"
            className="dl-hero-base"
            alt="Алексей показывает вниз, на список ниш"
            sizes="(max-width: 699px) 112px, min(30vh, 300px)"
            loading="eager"
            fetchPriority="high"
          />
        </figure>
        <HubPoseIsland />
      </section>

      {/* ── ниши вывеской: слово, цена, срок, у правого края живой сайт ниши ── */}
      <div className="dl-wide dl-wide--first">
        <Sign
          id="dl-niches"
          title="Ниши с готовыми проектами"
          side="Цена, срок и сайты на странице ниши"
          rows={INDUSTRY_PAGES.map((i) => {
            const s = leadSite(i);
            return {
              href: `/dlya/${i.slug}`,
              word: wordOf(i.slug),
              price: i.price.value,
              title: i.h1,
              term: `${i.term.label.toLowerCase()} ${i.term.value}`,
              note: i.short,
              img: s.img,
              cap: s.title,
              host: s.host,
              scene: i.slug,
            };
          })}
        />
      </div>

      {/* ── если ниши нет: общие типы сайтов; персонаж слева открытой ладонью показывает на вывеску ── */}
      <div className="dl-wide dl-any">
        <figure className="dl-any-fig" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            loading="lazy"
            decoding="async"
            width={476}
            height={984}
            src="/img/v4/ill/h-priglashaet-780.webp"
            srcSet={HP_SET}
            sizes="(max-width: 699px) 98px, 232px"
          />
        </figure>
        <Sign
          id="dl-any"
          size="s"
          title="Если вашей ниши тут нет"
          side="Сайт по типу, а не по отрасли"
          aside={
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" loading="lazy" decoding="async" width={476} height={984} src="/img/v4/ill/h-priglashaet-560.webp" srcSet={HP_SET} sizes="96px" />
          }
          intro="Это не значит, что я с ней не работал: на страницы вынесены только те, где набралось несколько проектов подряд. Всё остальное собирается по типу сайта, а не по отрасли."
          rows={HUB_FALLBACK.map((s) => {
            const site = serviceSite(s);
            return {
              href: `/uslugi/${s.slug}`,
              word: serviceWord(s.slug),
              price: s.price.value,
              title: s.h1,
              term: `${s.term.label.toLowerCase()} ${s.term.value}`,
              note: s.short,
              img: site.img,
              cap: site.title,
              host: site.host,
            };
          })}
        />
        <p className="dl-note">
          Полный список услуг{" "}
          <a href="/uslugi">
            в разделе услуг
            <Go />
          </a>
          , готовые проекты{" "}
          <a href="/works">
            в работах
            <Go />
          </a>
        </p>
        <SignsIsland />
      </div>

      <FinalCta
        word="Ваша ниша?"
        text="Напишу, какие блоки в ней обязательны, а что можно отложить на второй этап. Отвечаю в течение часа, первый разбор задачи бесплатный."
        msg={HUB_MSG}
      />
      <WordsIsland />
    </>
  );
}
