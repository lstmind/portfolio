import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INDUSTRY_PAGES, industryBySlug } from "@/lib/industries";
import { REPLY, SITE, REVIEWS, priceNumber, plural } from "@/lib/content";
import { KWORK_URL, PROFI_URL } from "@/lib/reviews";
import { Block, Crumbs, Faq, Fan, FinalCta, Go, Out, Sign, SiteCards, TgButton, Word } from "@/components/v4/dlya/parts";
import { casesOf, serviceSite, serviceWord, sitesOf, splitPrice, splitTerm, tgMsg, typesOf, wordOf } from "@/components/v4/dlya/data";
import { CardsIsland, DemoIsland, FanIsland, OthersIsland, SignsIsland, WordsIsland } from "@/components/v4/dlya/islands";
import { NicheDemo, demoSpec } from "@/components/v4/dlya/demo";
import { Scene, SceneCrop } from "@/components/v4/dlya/scene";
import { tie } from "@/components/v4/typo";
import { AUDIT_NICHE } from "@/lib/cta";
import { Shell } from "@/components/v4/Shell";
import { AuditLine } from "@/components/v4/cta/Strip";

const NB = " ";

// чужой slug сразу получает готовую 404, без рендера на запрос
export const dynamicParams = false;

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
  if (!i) notFound();
  return {
    title: i.metaTitle,
    description: i.metaDescription,
    alternates: { canonical: `/dlya/${i.slug}` },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: SITE.ogName,
      url: `${SITE.url}/dlya/${i.slug}`,
      title: i.metaTitle,
      description: i.metaDescription,
    },
    // без своего twitter-блока карточка наследует заголовок главной и врёт про страницу
    twitter: {
      card: "summary_large_image",
      title: i.metaTitle,
      description: i.metaDescription,
    },
  };
}

export default async function IndustryPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ind = industryBySlug(slug);
  if (!ind) notFound();

  const sites = sitesOf(ind);
  // разборы, на которые уже ведёт карточка сайта, второй раз списком не повторяем
  const cases = casesOf(ind).filter((c) => !sites.some((x) => x.caseSlug === c.slug));
  const types = typesOf(ind);
  const others = INDUSTRY_PAGES.filter((x) => x.slug !== ind.slug);
  const review = REVIEWS[ind.review];
  const reviewUrl = review?.src === "Профи" ? PROFI_URL : KWORK_URL;
  const p = splitPrice(ind.price.value);
  const t = splitTerm(ind.term.value);
  const demo = demoSpec(ind);
  // первое сообщение в Telegram: у шапки, язычка, подвала, первого экрана и финала одно
  const msg = tgMsg(ind.h1);
  const nSites = `${sites.length}${NB}${plural(sites.length, ["живой сайт", "живых сайта", "живых сайтов"])}`;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: ind.h1,
        description: ind.answer,
        url: `${SITE.url}/dlya/${ind.slug}`,
        serviceType: "Разработка сайтов",
        audience: { "@type": "BusinessAudience", name: ind.nav },
        areaServed: [
          { "@type": "City", name: "Москва" },
          { "@type": "Country", name: "Россия" },
        ],
        provider: { "@id": `${SITE.url}#person` },
        offers: {
          "@type": "Offer",
          priceCurrency: "RUB",
          // цена числом, иначе поисковик Offer не читает и в выдаче её не показывает
          ...(priceNumber(ind.price.value) !== null
            ? {
                price: priceNumber(ind.price.value),
                priceSpecification: {
                  "@type": "PriceSpecification",
                  priceCurrency: "RUB",
                  minPrice: priceNumber(ind.price.value),
                  valueAddedTaxIncluded: false,
                },
              }
            : {}),
          url: `${SITE.url}/dlya/${ind.slug}`,
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
          { "@type": "ListItem", position: 2, name: "Ниши", item: `${SITE.url}/dlya` },
          { "@type": "ListItem", position: 3, name: ind.h1, item: `${SITE.url}/dlya/${ind.slug}` },
        ],
      },
    ],
  };

  return (
    <Shell current="/dlya" main="dl-page" tg={msg} after=".dl-hero .dl-tg" until="#dl-final-t">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ── первый экран: "сайты для" и крупное слово ниши, цена и срок вывеской, ответ, кнопка; справа веер живых сайтов ниши ── */}
      <section className="dl-hero" id="dl-hero" aria-labelledby="dl-h1">
        <div className="dl-hero-txt">
          <Crumbs
            items={[
              { name: "Главная", href: "/" },
              { name: "Ниши", href: "/dlya" },
            ]}
          />
          <h1 className="dl-kicker" id="dl-h1">
            {ind.h1}
          </h1>
          <div className="dl-title" aria-hidden="true">
            <Word text="Сайты для" className="dl-pre" />
            <Word text={wordOf(ind.slug)} start={8} />
          </div>

          <dl className="dl-facts">
            <div className="dl-fact">
              <dt>{ind.price.label}</dt>
              <dd>
                <span className="dl-num">
                  {p.pre && <i>{p.pre}</i>}
                  <span>{p.value}</span>
                </span>
                <span className="dl-fnote">{tie(ind.price.note)}</span>
              </dd>
            </div>
            <div className="dl-fact">
              <dt>{ind.term.label}</dt>
              <dd>
                <span className="dl-num">
                  {t.pre && <i>{t.pre}</i>}
                  <span>{t.value}</span>
                </span>
                <span className="dl-fnote">{tie(ind.term.note)}</span>
              </dd>
            </div>
          </dl>

          <p className="dl-answer">{ind.answer}</p>
          <div className="dl-hero-act">
            <TgButton text={msg} className="dl-cta" />
            <span className="dl-hero-side">Москва и вся Россия, удалённо. Договор и{NB}чек</span>
          </div>
        </div>

        <div className="dl-hero-fan">
          <Fan sites={sites} label={`Сайты в нише: ${ind.nav}`} />
          <a className="dl-fan-more" href="#dl-works">
            {nSites} в{NB}нише
            <Go />
          </a>
        </div>
        <FanIsland />
      </section>
      {/* у кого сайт уже есть: бесплатный аудит одной строкой под первым экраном */}
      <AuditLine text={AUDIT_NICHE} place="niche-audit" />

      <div className="dl-flow">
        {/* ── как устроена ниша и что в ней важно: слева липнет мини-механика одного пункта ниши,
               на телефоне она встаёт полосой между текстом и пунктами ── */}
        <section className="dl-block dl-block--demo" id="dl-lead" aria-label="Как устроена ниша">
          <div className="dl-side">
            <p className="dl-label">Как устроена ниша</p>
            <div className="dl-demo">
              <NicheDemo ind={ind} />
            </div>
          </div>
          <div className="dl-body">
            <div className="dl-lead">
              {ind.lead.map((x) => (
                <p key={x}>{x}</p>
              ))}
            </div>
            <div className="dl-spec-w" id="dl-spec">
              <h2 className="dl-sub" id="dl-spec-t">
                Что важно именно здесь{" "}
                <span className="dl-sub-n" aria-hidden="true">
                  <Go />
                </span>
              </h2>
              <ol className="dl-spec">
                {ind.specifics.map((sp, k) => (
                  <li key={sp.title} className={k === demo.i ? "is-demo" : undefined}>
                    <h3>{sp.title}</h3>
                    <p>{sp.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <DemoIsland />
        </section>

        {/* ── живые сайты ниши карточками во всю ширину ── */}
        <section className={`dl-works${sites.length < 3 ? " dl-works--few" : ""}`} id="dl-works" aria-labelledby="dl-works-t">
          <header className="dl-head">
            <h2 id="dl-works-t">Работы в этой нише</h2>
            <p>{nSites}, каждый открывается</p>
          </header>
          <SiteCards sites={sites} />
          {cases.length > 0 && (
            <div className="dl-cases">
              <h3 className="dl-cases-t">{sites.some((x) => x.caseSlug) ? "Ещё разборы" : "Разборы проектов"}</h3>
              <ul>
                {cases.map((c) => (
                  <li key={c.slug}>
                    <a href={`/works/${c.slug}`}>
                      <b>{c.title}</b>
                      <span>{c.kind}</span>
                      <Go />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <CardsIsland />
        </section>

        {/* ── отзыв ── */}
        {review && (
          <Block id="dl-rev" label="Отзыв" heading={false}>
            <figure className="dl-rev">
              <blockquote>
                <p>{review.text}</p>
              </blockquote>
              <figcaption>
                <b>{review.name}</b>
                {review.job && <span>{review.job}</span>}
                <a href={reviewUrl} target="_blank" rel="noopener">
                  {review.src}
                  <Out />
                </a>
              </figcaption>
            </figure>
          </Block>
        )}

        {/* ── что входит: линейка с номерами, рядом персонаж со сметой ── */}
        <Block
          id="dl-inc"
          label="Что входит в работу"
          className="dl-block--fig"
          aside={<Scene slug={ind.slug} className="dl-inc-fig" hd={470} hm={250} />}
        >
          <ul className="dl-inc">
            {ind.includes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <dl className="dl-where">
            <div>
              <dt>Где работаю</dt>
              <dd>Москва и вся Россия, удалённо</dd>
            </div>
            <div>
              <dt>Как оформляю</dt>
              <dd>Договор и чек, самозанятый</dd>
            </div>
            <div>
              <dt>Когда отвечаю</dt>
              <dd>{REPLY.when}</dd>
            </div>
          </dl>
        </Block>
      </div>

      {/* ── какой сайт обычно берут: вывеска цен ── */}
      <div className="dl-wide">
        <Sign
          id="dl-types"
          title="Какой сайт обычно берут"
          side="Цена и срок на странице услуги"
          rows={types.map((s) => {
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
        <SignsIsland />
      </div>

      <div className="dl-flow">
        <Block id="dl-faq" label="Вопросы по нише">
          <Faq items={ind.faq} />
        </Block>

        <Block id="dl-others" label="Другие ниши">
          <ul className="dl-niches">
            {others.map((o) => (
              <li key={o.slug}>
                <a href={`/dlya/${o.slug}`}>
                  <SceneCrop slug={o.slug} className="dl-niche-crop" h={112} />
                  <span className="dl-niche-t">
                    <b>{o.h1}</b>
                    <i>{o.price.value}</i>
                    <span>{o.short}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <OthersIsland />
        </Block>
      </div>

      <FinalCta
        word="Ваш случай?"
        text={`Скажу, что в вашей нише реально нужно, что можно не делать, сколько это стоит и сколько займёт. ${REPLY.line}`}
        msg={msg}
      />
      <WordsIsland />
    </Shell>
  );
}
