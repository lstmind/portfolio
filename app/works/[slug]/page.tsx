import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Crumbs, PageCta, PageFooter, PageHeader } from "@/components/PageChrome";
import { CASE_PAGES, caseBySlug } from "@/lib/cases";
import { SERVICE_PAGES } from "@/lib/services";
import { SITE, WORKS } from "@/lib/content";

export function generateStaticParams() {
  return CASE_PAGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = caseBySlug(slug);
  if (!c) return {};
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `/works/${c.slug}` },
    openGraph: {
      type: "article",
      locale: "ru_RU",
      url: `${SITE.url}/works/${c.slug}`,
      title: c.metaTitle,
      description: c.metaDescription,
    },
  };
}

export default async function CasePageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = caseBySlug(slug);
  if (!c) notFound();
  const w = WORKS.find((x) => x.href === c.href);
  if (!w) notFound();

  const services = c.services
    .map((s) => SERVICE_PAGES.find((x) => x.slug === s))
    .filter(Boolean) as (typeof SERVICE_PAGES)[number][];

  const next = CASE_PAGES.filter((x) => x.slug !== c.slug).slice(0, 3);
  const host = c.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: w.title,
        headline: c.metaTitle,
        description: c.answer,
        url: `${SITE.url}/works/${c.slug}`,
        image: `${SITE.url}${w.imgTall}`,
        inLanguage: "ru",
        about: w.kind,
        keywords: w.stack.join(", "),
        creator: {
          "@type": "Person",
          name: SITE.person,
          alternateName: SITE.name,
          url: SITE.url,
          jobTitle: "Веб-разработчик",
        },
        mainEntityOfPage: `${SITE.url}/works/${c.slug}`,
        sameAs: c.href,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Работы", item: `${SITE.url}/#works` },
          { "@type": "ListItem", position: 3, name: w.title, item: `${SITE.url}/works/${c.slug}` },
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
              { name: "Работы", href: "/#works" },
              { name: w.title },
            ]}
          />

          <span className="doc-tag mono">{w.tag}</span>
          <h1>{w.title}</h1>
          <p className="doc-answer">{c.answer}</p>

          <figure className="doc-shot">
            <picture>
              {/* webp вдвое легче jpg на таких длинных лентах — отдаём его всем, кто умеет */}
              <source
                type="image/webp"
                srcSet={`${w.imgTall.replace(/\.jpg$/, "")}-400.webp 400w, ${w.imgTall.replace(/\.jpg$/, "")}.webp ${w.imgTallW ?? 760}w`}
                sizes="(max-width: 920px) 100vw, 1128px"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={w.imgTall}
                alt={w.alt}
                width={w.imgTallW ?? 760}
                height={w.imgTallH}
                loading="eager"
                decoding="async"
              />
            </picture>
            <figcaption className="mono">Полная страница сайта {w.title}</figcaption>
          </figure>

          <div className="doc-grid">
            <div>
          <h2 className="doc-h2-first">Задача</h2>
          {c.task.map((t) => (
            <p className="doc-lead" key={t}>
              {t}
            </p>
          ))}

          <h2>Что сделано</h2>
          <ul className="doc-list">
            {c.done.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>

          {c.detail && (
            <>
              <h2>Детали</h2>
              {c.detail.map((d) => (
                <p className="doc-lead" key={d}>
                  {d}
                </p>
              ))}
            </>
          )}

          <p className="doc-live">
            <a href={c.href} target="_blank" rel="noopener noreferrer">
              Открыть {w.title} ↗
            </a>
          </p>
            </div>

            <aside className="doc-side">
              <div>
                <span className="mono">Тип проекта</span>
                <b>{w.kind}</b>
                <i>{w.stack.join(" · ")}</i>
              </div>
              <div>
                <span className="mono">Живой сайт</span>
                <b>
                  <a href={c.href} target="_blank" rel="noopener noreferrer">
                    {host} ↗
                  </a>
                </b>
                <i>открывается и работает прямо сейчас</i>
              </div>
              <div className="doc-side-cta">
                <a href={SITE.telegram} target="_blank" rel="noopener noreferrer">
                  Хочу такой же →
                </a>
                <small className="mono">отвечаю в течение часа</small>
              </div>
            </aside>
          </div>

          {services.length > 0 && (
            <>
              <h2>Услуги в этом проекте</h2>
              <div className="doc-others">
                {services.map((s) => (
                  <a href={`/uslugi/${s.slug}`} key={s.slug}>
                    <b>{s.h1}</b>
                    <span>{s.short}</span>
                    <i className="mono">{s.price.value}</i>
                  </a>
                ))}
              </div>
            </>
          )}

          <h2>Другие работы</h2>
          <div className="doc-cases">
            {next.map((n) => {
              const nw = WORKS.find((x) => x.href === n.href);
              return nw ? (
                <a className="doc-case doc-case--shot" href={`/works/${n.slug}`} key={n.slug}>
                  <span className="doc-case-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/img/prev/${n.slug}.webp`}
                      srcSet={`/img/prev/${n.slug}-400.webp 400w, /img/prev/${n.slug}.webp 760w`}
                      sizes="(max-width: 920px) 100vw, 340px"
                      alt={`${nw.title} — первый экран сайта`}
                      width={760}
                      height={471}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="mono">{nw.tag}</span>
                  <b>{nw.title}</b>
                  <span className="doc-case-txt">{nw.kind}</span>
                  <span className="doc-case-go mono">Разбор проекта ↗</span>
                </a>
              ) : null;
            })}
          </div>
        </div>
      </main>

      <PageCta
        title="Нужен такой же?"
        text="Расскажи задачу — отвечу в течение часа, назову срок и вилку цены. Если задачу лучше решить иначе, скажу об этом сразу."
      />
      <PageFooter />
    </>
  );
}
