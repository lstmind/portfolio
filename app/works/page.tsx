import type { Metadata } from "next";
import { Crumbs, PageCta, PageFooter, PageHeader } from "@/components/PageChrome";
import { CASE_PAGES } from "@/lib/cases";
import { SITE, WORKS, WORKS_INDEX, PROJECTS_TOTAL, plural } from "@/lib/content";

/**
 * Витрина работ: разборы проектов плюс полный список живых сайтов.
 * На главной список работ спрятан за кнопкой «показать ещё» и в html
 * попадает не целиком — эта страница отдаёт роботу и человеку всё сразу.
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
  const cases = CASE_PAGES.map((c) => ({ c, w: WORKS.find((x) => x.href === c.href) })).filter(
    (x) => x.w
  ) as { c: (typeof CASE_PAGES)[number]; w: (typeof WORKS)[number] }[];

  const rest = WORKS_INDEX.filter((w) => w.href.startsWith("http"));
  const cats = [...new Set(rest.map((w) => w.cat))];

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
      <PageHeader />

      <main className="doc" id="main">
        <div className="doc-wrap">
          <Crumbs items={[{ name: "Главная", href: "/" }, { name: "Работы" }]} />

          <h1>Работы</h1>
          <p className="doc-answer">
            {PROJECTS_TOTAL} {plural(PROJECTS_TOTAL, ["проект", "проекта", "проектов"])} в проде:
            магазины, корпоративные сайты, каталоги, лендинги и свои демо. Каждую ссылку можно
            открыть и потыкать руками — это не картинки в рамке, а работающие сайты.
          </p>

          <h2 className="doc-h2-first">Разборы проектов</h2>
          <div className="doc-cases">
            {cases.map(({ c, w }) => (
              <a className="doc-case doc-case--shot" href={`/works/${c.slug}`} key={c.slug}>
                <span className="doc-case-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/img/prev/${c.slug}.webp`}
                    srcSet={`/img/prev/${c.slug}-400.webp 400w, /img/prev/${c.slug}.webp 760w`}
                    sizes="(max-width: 920px) 100vw, 340px"
                    alt={`${w.title} — первый экран сайта`}
                    width={760}
                    height={471}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="mono">{w.tag}</span>
                <b>{w.title}</b>
                <span className="doc-case-txt">{w.kind}</span>
                <span className="doc-case-go mono">Разбор проекта ↗</span>
              </a>
            ))}
          </div>

          <h2>Остальные проекты</h2>
          <p className="doc-lead">
            Здесь без разборов — просто ссылки на живые сайты и то, что на них сделано. Открываются
            в новой вкладке.
          </p>

          {cats.map((cat) => (
            <div key={cat}>
              <h3>{cat}</h3>
              <ul className="doc-list doc-list--plain">
                {rest
                  .filter((w) => w.cat === cat)
                  .map((w) => (
                    <li key={w.href}>
                      <a href={w.href} target="_blank" rel="noopener noreferrer">
                        {w.title} ↗
                      </a>{" "}
                      <span className="mono">{w.engine}</span> — {w.note}
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          <p className="doc-note">
            Что и за сколько делаю — <a href="/uslugi">в услугах</a>, по нишам —{" "}
            <a href="/dlya">в разделе ниш</a>.
          </p>
        </div>
      </main>

      <PageCta
        title="Хочу такой же"
        text="Скажите, какой из проектов ближе к вашей задаче — прикину смету и срок по аналогии. Отвечаю в течение часа."
      />
      <PageFooter />
    </>
  );
}
