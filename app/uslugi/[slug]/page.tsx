import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICE_PAGES, serviceBySlug } from "@/lib/services";
import { REPLY, SITE, priceNumber } from "@/lib/content";
import { auditFor, priceLine } from "@/lib/cta";
import { Shell } from "@/components/v4/Shell";
import { AuditStrip, PriceStrip } from "@/components/v4/cta/Strip";
import { Block, Faq, FinalCta, Go } from "@/components/v4/uslugi/bits";
import { BigCount, CaseCards, Niches, Quote, Rating, ServiceHero, ShortQuote, ShotFigure, Steps, tgMsg } from "@/components/v4/uslugi/Service";
import { Sign } from "@/components/v4/uslugi/Sign";
import { CaseShots, Demo } from "@/components/v4/uslugi/Demos";
import { caseCards, hubFor, nichesFor, othersFor } from "@/components/v4/uslugi/data";
import { reviewFor, sceneOf, shortReviewFor } from "@/components/v4/uslugi/scenes";
import { CardsIsland, DemosIsland, HeroIsland, NichesIsland, SignsIsland, WordsIsland } from "@/components/v4/uslugi/islands";

// чужой slug сразу получает готовую 404, без рендера на запрос
export const dynamicParams = false;

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
  if (!s) notFound();
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: `/uslugi/${s.slug}` },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: SITE.ogName,
      url: `${SITE.url}/uslugi/${s.slug}`,
      title: s.metaTitle,
      description: s.metaDescription,
    },
    // без своего twitter-блока карточка наследует заголовок главной и врёт про страницу
    twitter: {
      card: "summary_large_image",
      title: s.metaTitle,
      description: s.metaDescription,
    },
  };
}

export default async function ServicePageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) notFound();

  const cards = caseCards(s.cases);
  const others = othersFor(s);
  const hub = hubFor(s);
  const niches = nichesFor(s);
  const review = reviewFor(s.slug);
  // сцена на первом экране: тогда поза 6 со скрином работы встаёт рядом с "Когда это нужно"
  const scene = sceneOf(s.slug);
  const short = shortReviewFor(s.slug);
  // первое сообщение в Telegram: у шапки, язычка, подвала, первого экрана, полосы и финала одно
  const msg = tgMsg(s.h1);
  // аудит на этой услуге: тогда посередине полоса аудита вместо полосы цены
  const audit = auditFor(s.slug);
  const leadShots = s.slug === "telegram-bot" ? (["status"] as const) : s.slug === "admin-panel-i-crm" ? (["admin", "kitchen"] as const) : null;

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
        provider: { "@id": `${SITE.url}#person` },
        offers: {
          "@type": "Offer",
          priceCurrency: "RUB",
          // цена числом, иначе поисковик Offer не читает и в выдаче её не показывает
          ...(priceNumber(s.price.value) !== null
            ? {
                price: priceNumber(s.price.value),
                priceSpecification: {
                  "@type": "PriceSpecification",
                  priceCurrency: "RUB",
                  minPrice: priceNumber(s.price.value),
                  valueAddedTaxIncluded: false,
                },
              }
            : {}),
          url: `${SITE.url}/uslugi/${s.slug}`,
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
          { "@type": "ListItem", position: 2, name: "Услуги", item: `${SITE.url}/uslugi` },
          { "@type": "ListItem", position: 3, name: s.h1, item: `${SITE.url}/uslugi/${s.slug}` },
        ],
      },
    ],
  };

  return (
    <Shell current="/uslugi" main="u-page" tg={msg} after=".u-hero .u-tg" until="#u-final-t">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <ServiceHero s={s} shot={cards[0]} audit={audit} />

      <div className="u-flow">
        <Block id="u-lead" label="Подробнее" className="u-lead" aside={leadShots ? <CaseShots names={[...leadShots]} /> : short ? <ShortQuote r={short} /> : undefined}>
          {s.lead.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Block>

        {hub.length > 0 && (
          <div className="u-wide" id="u-types">
            <p className="u-wide-p">
              &quot;Под ключ&quot; значит, что всё делаю я. А что именно делать, зависит от задачи: каждому типу сайта нужна своя
              структура, свой срок и своя цена.
            </p>
            <Sign id="u-hub" title="Какой сайт нужен" side="у каждого типа своя страница" services={hub} size="s" />
          </div>
        )}

        <Block id="u-inc" label="Что входит в работу" aside={<Demo s={s} cards={cards} />}>
          <ol className="u-inc">
            {s.includes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </Block>

        {audit ? (
          // персонаж у полосы только там, где сразу под ней в той же колонке нет второго (сцена со скрином работы в "Когда это нужно"):
          // два рисунка подряд через полэкрана читаются как повтор шаблона
          <AuditStrip audit={audit} place="strip" id="ct-audit" art={scene ? null : s.slug === "tehnicheskoe-seo" ? "phone" : "loupe"} />
        ) : (
          <PriceStrip line={priceLine(s)} tg={msg} />
        )}

        <Block id="u-fit" label="Когда это нужно" aside={scene ? <ShotFigure shot={cards[0]} /> : <BigCount />}>
          <ul className="u-fit">
            {s.fit.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Block>

        <Block id="u-works" label="Примеры работ">
          <CaseCards cards={cards} />
          <p className="u-more">
            <a href="/works">
              Все работы и разборы
              <Go />
            </a>
          </p>
        </Block>

        {review && (
          <Block id="u-rev" label="Отзыв" aside={<Rating src={review.src} />}>
            <Quote r={review} />
          </Block>
        )}

        <Block id="u-steps" label="Как идёт работа">
          <Steps />
        </Block>

        <Block id="u-faq" label="Вопросы по услуге">
          <Faq items={s.faq} />
        </Block>

        {niches.length > 0 && (
          <Niches
            niches={niches}
            intro={
              hub.length > 0
                ? "В некоторых нишах сайт устроен иначе: там свои обязательные блоки и свой путь до заявки. Вот те, с которыми я работал плотнее всего."
                : undefined
            }
          />
        )}

        <div className="u-wide">
          <Sign id="u-others" title="Другие услуги" side="все цены на одной странице" services={others} size="s" />
          <p className="u-more">
            <a href="/uslugi">
              Все услуги и что не моё
              <Go />
            </a>
          </p>
        </div>
      </div>

      <FinalCta
        word="Обсудим?"
        text={`Скажу честно: берусь или нет, сколько это стоит и сколько займёт. Если задачу лучше решить иначе, так и скажу. ${REPLY.line}`}
        msg={msg}
      />

      <HeroIsland />
      <DemosIsland />
      <NichesIsland />
      <CardsIsland />
      <SignsIsland />
      <WordsIsland />
    </Shell>
  );
}
