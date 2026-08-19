import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Crumbs, PageCta, PageFooter, PageHeader } from "@/components/PageChrome";
import { INDUSTRY_PAGES, industryBySlug, workByHref } from "@/lib/industries";
import { SERVICE_PAGES } from "@/lib/services";
import { CASE_PAGES } from "@/lib/cases";
import { SITE, WORKS, REVIEWS } from "@/lib/content";

export function generateStaticParams() {
  return INDUSTRY_PAGES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const i = industryBySlug(slug);
  if (!i) return {};
  return {
    title: i.metaTitle,
    description: i.metaDescription,
    alternates: { canonical: `/dlya/${i.slug}` },
    openGraph: {
      type: "article",
      locale: "ru_RU",
      url: `${SITE.url}/dlya/${i.slug}`,
      title: i.metaTitle,
      description: i.metaDescription,
    },
  };
}

export default async function IndustryPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ind = industryBySlug(slug);
  if (!ind) notFound();

  const types = ind.types
    .map((t) => SERVICE_PAGES.find((s) => s.slug === t))
    .filter(Boolean) as (typeof SERVICE_PAGES)[number][];

  const cases = ind.cases
    .map((cs) => {
      const c = CASE_PAGES.find((x) => x.slug === cs);
      const w = c && WORKS.find((x) => x.href === c.href);
      return c && w ? { c, w } : null;
    })
    .filter(Boolean) as { c: (typeof CASE_PAGES)[number]; w: (typeof WORKS)[number] }[];

  const others = INDUSTRY_PAGES.filter((x) => x.slug !== ind.slug);

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: ind.h1,
        description: ind.answer,
        url: `${SITE.url}/dlya/${ind.slug}`,
        serviceType: "Разработка сайтов",
        audience: { "@type": "BusinessAudience", name: ind.h1.replace("Сайт для ", "") },
        areaServed: [
          { "@type": "City", name: "Москва" },
          { "@type": "Country", name: "Россия" },
        ],
        provider: {
          "@type": "Person",
          name: SITE.person,
          alternateName: SITE.name,
          url: SITE.url,
          jobTitle: "Веб-разработчик",
          sameAs: [SITE.telegram, SITE.kwork, SITE.github],
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "RUB",
          description: `${ind.price.value} · ${ind.price.note}`,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: ind.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Услуги", item: `${SITE.url}/#services` },
          { "@type": "ListItem", position: 3, name: ind.h1, item: `${SITE.url}/dlya/${ind.slug}` },
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
          <Crumbs
            items={[
              { name: "Главная", href: "/" },
              { name: "Услуги", href: "/#services" },
              { name: ind.h1 },
            ]}
          />

          <h1>{ind.h1}</h1>
          <p className="doc-answer">{ind.answer}</p>

          <figure className="doc-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/img/dlya/${ind.slug}.webp`}
              srcSet={`/img/dlya/${ind.slug}-720.webp 720w, /img/dlya/${ind.slug}.webp 1440w`}
              sizes="(max-width: 920px) 100vw, 1128px"
              alt=""
              width={1440}
              height={960}
              loading="eager"
              decoding="async"
            />
          </figure>

          <div className="doc-grid">
            <div>
              {ind.lead.map((p) => (
                <p className="doc-lead" key={p}>
                  {p}
                </p>
              ))}

              <h2>Что важно именно здесь</h2>
              <div className="doc-spec">
                {ind.specifics.map((sp) => (
                  <div key={sp.title}>
                    <h3>{sp.title}</h3>
                    <p>{sp.text}</p>
                  </div>
                ))}
              </div>

              <h2>Что входит в работу</h2>
              <ul className="doc-list">
                {ind.includes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>

              <h2>Работы в этой нише</h2>
              <ul className="doc-refs">
                {ind.examples.map((ex) => {
                  const w = workByHref(ex.href);
                  const host = ex.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
                  return (
                    <li key={ex.href}>
                      <a href={ex.href} target="_blank" rel="noopener noreferrer">
                        <b>{w?.title ?? host}</b>
                        <span className="doc-refs-note">{ex.note}</span>
                        <span className="doc-refs-meta mono">
                          {w?.engine} · {host} ↗
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="doc-side">
              <div>
                <span className="mono">{ind.price.label}</span>
                <b>{ind.price.value}</b>
                <i>{ind.price.note}</i>
              </div>
              <div>
                <span className="mono">{ind.term.label}</span>
                <b>{ind.term.value}</b>
                <i>{ind.term.note}</i>
              </div>
              <div>
                <span className="mono">Где работаю</span>
                <b>Москва и вся Россия</b>
                <i>удалённо, договор и чек — самозанятый</i>
              </div>
              <div className="doc-side-cta">
                <a href={SITE.telegram} target="_blank" rel="noopener noreferrer">
                  Обсудить задачу →
                </a>
                <small className="mono">отвечаю в течение часа</small>
              </div>
              {REVIEWS[ind.review] && (
                <div className="doc-side-rev">
                  <blockquote>«{REVIEWS[ind.review].text}»</blockquote>
                  <cite className="mono">
                    {REVIEWS[ind.review].name} · {REVIEWS[ind.review].src}
                  </cite>
                </div>
              )}
            </aside>
          </div>

          {cases.length > 0 && (
            <>
              <h2>Разборы проектов</h2>
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
            </>
          )}

          <h2>Вопросы по нише</h2>
          <div className="doc-faq">
            {ind.faq.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

          <h2>Какой сайт обычно берут</h2>
          <div className="doc-others">
            {types.map((s) => (
              <a href={`/uslugi/${s.slug}`} key={s.slug}>
                <b>{s.h1}</b>
                <span>{s.short}</span>
                <i className="mono">{s.price.value}</i>
              </a>
            ))}
          </div>

          <h2>Другие ниши</h2>
          <div className="doc-others">
            {others.map((o) => (
              <a href={`/dlya/${o.slug}`} key={o.slug}>
                <b>{o.h1}</b>
                <span>{o.short}</span>
                <i className="mono">{o.price.value}</i>
              </a>
            ))}
          </div>
        </div>
      </main>

      <PageCta
        title="Расскажи про свой случай"
        text="Отвечу в течение часа: скажу, что в твоей нише реально нужно, что можно не делать, сколько это стоит и сколько займёт."
      />
      <PageFooter />
    </>
  );
}
