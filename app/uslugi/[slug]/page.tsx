import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Crumbs, PageCta, PageFooter, PageHeader } from "@/components/PageChrome";
import { SERVICE_PAGES, serviceBySlug, type ServicePage } from "@/lib/services";
import { CASE_PAGES } from "@/lib/cases";
import { SITE, WORKS, PROCESS, REVIEWS } from "@/lib/content";

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) return {};
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: `/uslugi/${s.slug}` },
    openGraph: {
      type: "article",
      locale: "ru_RU",
      url: `${SITE.url}/uslugi/${s.slug}`,
      title: s.metaTitle,
      description: s.metaDescription,
    },
  };
}

export default async function ServicePageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) notFound();

  const cases = s.cases
    .map((cs) => {
      const c = CASE_PAGES.find((x) => x.slug === cs);
      const w = c && WORKS.find((x) => x.href === c.href);
      return c && w ? { c, w } : null;
    })
    .filter(Boolean) as { c: (typeof CASE_PAGES)[number]; w: (typeof WORKS)[number] }[];

  const others = SERVICE_PAGES.filter((x) => x.slug !== s.slug);
  // страница-хаб разводит общий запрос по типам сайтов, чтобы они не конкурировали друг с другом
  const hub = (s.hub ?? [])
    .map((x) => SERVICE_PAGES.find((y) => y.slug === x))
    .filter(Boolean) as ServicePage[];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: s.h1,
        description: s.answer,
        url: `${SITE.url}/uslugi/${s.slug}`,
        serviceType: s.h1,
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
          description: `${s.price.value} · ${s.price.note}`,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: s.faq.map((f) => ({
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
          { "@type": "ListItem", position: 3, name: s.h1, item: `${SITE.url}/uslugi/${s.slug}` },
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
              { name: s.h1 },
            ]}
          />

          <h1>{s.h1}</h1>
          <p className="doc-answer">{s.answer}</p>

          <figure className="doc-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/img/svc/${s.slug}.webp`}
              srcSet={`/img/svc/${s.slug}-720.webp 720w, /img/svc/${s.slug}.webp 1440w`}
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
          {s.lead.map((p) => (
            <p className="doc-lead" key={p}>
              {p}
            </p>
          ))}

          {hub.length > 0 && (
            <>
              <h2>Какой сайт нужен</h2>
              <p className="doc-lead">
                «Под ключ» — это про то, что всё делаю я. А вот что именно делать, зависит от задачи:
                каждому типу нужна своя структура, свой срок и своя цена.
              </p>
              <div className="doc-others">
                {hub.map((x) => (
                  <a href={`/uslugi/${x.slug}`} key={x.slug}>
                    <b>{x.h1}</b>
                    <span>{x.short}</span>
                    <i className="mono">{x.price.value}</i>
                  </a>
                ))}
              </div>
            </>
          )}

          <h2>Что входит в работу</h2>
          <ul className="doc-list">
            {s.includes.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>

          <h2>Когда это нужно</h2>
          <ul className="doc-list doc-list--plain">
            {s.fit.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>

          <h2>Как идёт работа</h2>
          <ol className="doc-steps doc-steps--short">
            {PROCESS.map((p) => (
              <li key={p.n}>
                <span className="mono">{p.n}</span>
                <b>{p.title}</b>
              </li>
            ))}
          </ol>
          <p className="doc-note">
            Подробно про каждый шаг —{" "}
            <a href="/#process">в разделе «Как я работаю»</a> на главной.
          </p>
            </div>

            <aside className="doc-side">
              <div>
                <span className="mono">{s.price.label}</span>
                <b>{s.price.value}</b>
                <i>{s.price.note}</i>
              </div>
              <div>
                <span className="mono">{s.term.label}</span>
                <b>{s.term.value}</b>
                <i>{s.term.note}</i>
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
              {REVIEWS[s.review] && (
                <div className="doc-side-rev">
                  <blockquote>«{REVIEWS[s.review].text}»</blockquote>
                  <cite className="mono">
                    {REVIEWS[s.review].name} · {REVIEWS[s.review].src}
                  </cite>
                </div>
              )}
            </aside>
          </div>

          {cases.length > 0 && (
            <>
              <h2>Примеры работ</h2>
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

          <h2>Вопросы по услуге</h2>
          <div className="doc-faq">
            {s.faq.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

          <h2>Другие услуги</h2>
          <div className="doc-others">
            {others.map((o) => (
              <a href={`/uslugi/${o.slug}`} key={o.slug}>
                <b>{o.h1}</b>
                <span>{o.short}</span>
                <i className="mono">{o.price.value}</i>
              </a>
            ))}
          </div>
        </div>
      </main>

      <PageCta
        title="Расскажи задачу"
        text="Отвечу в течение часа и скажу честно: берусь, сколько это стоит и сколько займёт. Если задачу лучше решить иначе — так и скажу."
      />
      <PageFooter />
    </>
  );
}
