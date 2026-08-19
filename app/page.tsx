import { ContactForm } from "@/components/ContactForm";
import { FooterClock } from "@/components/FooterClock";
import { WorksIndex } from "@/components/WorksIndex";
import { WorksFeatured } from "@/components/WorksFeatured";
import { CostCalc } from "@/components/CostCalc";
import { MobileNav } from "@/components/MobileNav";
import { FaqList } from "@/components/FaqList";
import {
  SITE,
  NAV,
  FACTS,
  MARQUEE,
  PAIN,
  SERVICES,
  PROCESS,
  BAND,
  REVIEWS,
  STATUS,
  FAQ,
} from "@/lib/content";
import { getKworkReviewsCount } from "@/lib/kwork";

function MarqueeSeg() {
  return (
    <div className="seg mono">
      <span>
        {MARQUEE.map((m, i) => (
          <span key={i} style={{ padding: 0, gap: 0 }}>
            {m.strong ? <b>{m.text}</b> : m.text} <span className="s">—</span>{" "}
          </span>
        ))}
      </span>
    </div>
  );
}

function BandSeg() {
  return (
    <div className="seg">
      <span>
        {BAND.map((w, i) => (
          <span key={i} style={{ padding: 0, gap: "30px" }}>
            <span className={i % 2 === 0 ? "f1" : "f2"}>{w}</span>
            <span className="d">●</span>
          </span>
        ))}
      </span>
    </div>
  );
}

export default async function Home() {
  const reviewsCount = await getKworkReviewsCount();

  // schema.org: факты об услугах и ценах в машинном виде — для выдачи и быстрых ответов
  const ratingLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "lstmind — веб-разработчик Алексей",
    url: SITE.url,
    image: `${SITE.url}/img/alex-portrait.png`,
    description:
      "Фриланс веб-разработчик Алексей (lstmind): сайты под ключ, интернет-магазины на WooCommerce, " +
      "доработка и ускорение чужих сайтов. Работаю один, от структуры до релиза.",
    priceRange: "от 1 500 ₽",
    currenciesAccepted: "RUB",
    areaServed: [
      { "@type": "City", name: "Москва" },
      { "@type": "Country", name: "Россия" },
    ],
    knowsLanguage: "ru",
    founder: { "@type": "Person", name: SITE.person, alternateName: SITE.name, url: SITE.url },
    sameAs: [SITE.telegram, SITE.kwork, SITE.github],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Услуги веб-разработки",
      itemListElement: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.text },
        ...(s.priceFrom
          ? {
              priceSpecification: {
                "@type": "PriceSpecification",
                minPrice: s.priceFrom,
                priceCurrency: "RUB",
                valueAddedTaxIncluded: true,
                description: `от ${s.priceFrom} ₽ за ${s.priceUnit}`,
              },
            }
          : {}),
      })),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      bestRating: "5",
      reviewCount: reviewsCount,
    },
    review: REVIEWS.slice(0, 4).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewBody: r.text,
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    })),
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ratingLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <MobileNav />
      <header id="hdr">
        <nav>
          <div className="logo">
            <span className="sq" />
            {SITE.name}
          </div>
          <div className="nav-r">
            {NAV.map((n) => (
              <a key={n.href} className="l" href={n.href} data-cursor>
                {n.label}
              </a>
            ))}
            <a className="nav-tg" href={SITE.telegram} target="_blank" rel="noopener noreferrer" data-cursor data-magnet>
              [ Telegram ↗ ]
            </a>
          </div>
        </nav>
      </header>

      <main id="main">
      {/* HERO */}
      <section className="hero">
        <div className="legib" />
        <div className="legib2" />
        <div className="wrap">
          <div className="status mono">
            <span className="pulse" />
            {STATUS}
          </div>
          <h1>
            <span className="ln">
              <i>Делаю сайты,</i>
            </span>
            <span className="ln">
              <i>которые работают.</i>
            </span>
            <span className="ln">
              <i>
                Чужие —{" "}
                <span className="acc" data-t="чиню.">
                  чиню.
                </span>
              </i>
            </span>
          </h1>
          <p className="sub">
            Я разработчик, а не сборщик шаблонов на коленке. Собираю с нуля и спасаю чужое:{" "}
            <b>чистый код, скорость, ноль «почти работает»</b>. Сайт, который не стыдно пустить в рекламу и
            показать клиенту.
          </p>
          <div className="cta-row">
            <a className="magnet" href="#contact" data-cursor data-magnet>
              <span className="lab">Обсудить проект →</span>
            </a>
            <a className="ghost" href="#works" data-cursor>
              Сначала покажи работы <span className="ar">↘</span>
            </a>
          </div>
          <div className="facts mono">
            {FACTS.map((f, i) => (
              <div key={i} style={{ display: "contents" }}>
                <div className="f">
                  <b>
                    {f.value}
                    {f.suffix && <span className="s">{f.suffix}</span>}
                  </b>
                  <span>{f.label}</span>
                </div>
                {i < FACTS.length - 1 && <div className="sep" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marq" aria-hidden="true">
        <div className="track">
          <MarqueeSeg />
          <MarqueeSeg />
        </div>
      </div>

      {/* PAIN */}
      <section className="blk" id="why">
        <div className="wrap">
          <div className="reveal hd-split">
            <div>
              <div className="eyebrow">
                <span className="n">01</span> <span className="scramble">Почему сайты молчат</span>
              </div>
              <h2 className="h2-xl">
                Красивый — <span className="acc">не значит</span> работающий
              </h2>
            </div>
            <p className="lead">
              Можно вбухать деньги в сайт и получить ноль заявок. Чаще всего виноваты три вещи:
            </p>
          </div>
          <div className="pain reveal">
            {PAIN.map((p) => (
              <div className="p" key={p.n}>
                <span className="p-shot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/img/pain/${p.n}.webp`}
                    srcSet={`/img/pain/${p.n}-720.webp 720w, /img/pain/${p.n}.webp 1440w`}
                    sizes="(max-width: 920px) 100vw, 380px"
                    alt=""
                    width={1440}
                    height={960}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <div className="pn mono">{p.n}</div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
          <div className="painclose reveal">
            Я делаю <span className="acc">наоборот</span> — быстро, понятно, под тебя.
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="blk" id="services" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <div className="reveal">
            <div className="eyebrow">
              <span className="n">02</span> <span className="scramble">Что я делаю</span>
            </div>
            <h2>
              От точечной правки до <span className="acc">сайта под ключ</span>
            </h2>
            <p className="lead">
              Берусь и за большие проекты с нуля, и за аккуратные доработки. Стек подбираю под задачу и
              бюджет, а не под моду. Ставка {SITE.ratePerHour} ₽/час, по проекту — фикс-смета после разбора. Работаю из Москвы, по всей России удалённо.
            </p>
          </div>
          <div className="svc reveal">
            {SERVICES.map((s, i) => (
              <a className="card" key={s.title} href={s.slug ? `/uslugi/${s.slug}` : "#contact"} data-cursor>
                {s.slug && (
                  <span className="card-bg" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/img/svc/${s.slug}-720.webp`}
                      alt=""
                      width={720}
                      height={480}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                )}
                <div className="cn mono">{String(i + 1).padStart(2, "0")}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="pr" dangerouslySetInnerHTML={{ __html: s.price }} />
                <span className="card-go mono">Подробно об услуге ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CALC — живой функционал вместо обещаний */}
      <section className="blk" id="calc">
        <div className="wrap">
          <div className="reveal">
            <div className="eyebrow">
              <span className="n">03</span> <span className="scramble">Прикинь стоимость</span>
            </div>
            <h2>
              Сколько будет <span className="acc">стоить</span>
            </h2>
            <p className="lead">
              Три клика — и вилка цены с реальным сроком. Тот же калькулятор, что у меня в Telegram-боте:
              без «оставьте телефон, вам перезвонит менеджер».
            </p>
          </div>
          <CostCalc />
        </div>
      </section>

      {/* PROCESS — светлая инверсия, слом ритма */}
      <section className="blk light" id="process">
        <div className="wrap">
          <div className="reveal">
            <div className="eyebrow">
              <span className="n">04</span> <span className="scramble">Как я работаю</span>
            </div>
            <h2>
              Один человек. <span className="acc">Никаких сюрпризов</span>
            </h2>
            <p className="lead">
              Без пинг-понга между подрядчиками и без «ой, это считается отдельно». Пять шагов от задачи до
              рабочего сайта.
            </p>
          </div>
          <figure className="proc-shot reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/scene/process.webp"
              srcSet="/img/scene/process-720.webp 720w, /img/scene/process.webp 1440w"
              sizes="(max-width: 920px) 100vw, 1112px"
              alt="Схема в блокноте, макет на планшете и готовая страница на телефоне"
              width={1440}
              height={960}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="mono">схема → макет → рабочий сайт</figcaption>
          </figure>
          <div className="steps reveal">
            {PROCESS.map((s) => (
              <div className="step" key={s.n}>
                <div className="num mono">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GIANT BAND */}
      <div className="band" aria-hidden="true">
        <div className="bt">
          <BandSeg />
          <BandSeg />
        </div>
      </div>

      {/* WORKS */}
      <section className="blk" id="works" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <div className="reveal hd-split">
            <div>
              <div className="eyebrow">
                <span className="n">05</span> <span className="scramble">Работы</span>
              </div>
              <h2 className="h2-xl">
                Не скриншоты. <span className="acc">Сами сайты.</span>
              </h2>
            </div>
            <p className="lead">
              Открой любой в новой вкладке и потыкай руками — это рабочие коммерческие проекты в проде, а не
              картинки.
            </p>
          </div>
          <WorksFeatured />
          <WorksIndex />
        </div>
      </section>

      {/* REVIEWS — соцдоказательство, живые цитаты с Kwork */}
      <section className="blk" id="reviews" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <div className="reveal rev-head">
            <div>
              <div className="eyebrow">
                <span className="n">06</span> <span className="scramble">Отзывы</span>
              </div>
              <h2>
                Не мои слова — <span className="acc">клиентов</span>
              </h2>
            </div>
            <div className="faq-badge">
              <b>
                5.0<span className="s">★</span>
              </b>
              <span>
                высший рейтинг
                <br />
                {reviewsCount} отзывов на Kwork
              </span>
              <a href={SITE.kwork} target="_blank" rel="noopener noreferrer" data-cursor>
                все отзывы →
              </a>
            </div>
          </div>
          <div className="revs reveal">
            {REVIEWS.map((r) => (
              <figure className="rev" key={r.text.slice(0, 24)}>
                <blockquote>{r.text}</blockquote>
                <figcaption className="mono">
                  <b>{r.name}</b>
                  {r.job && <span>{r.job}</span>}
                  <span className="src">{r.src}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT — человек за сайтами */}
      <section className="blk" id="about">
        <div className="wrap">
          <div className="about reveal">
            <div className="about-txt">
              <div className="eyebrow">
                <span className="n">07</span> <span className="scramble">Кто я</span>
              </div>
              <h2>
                Меня зовут <span className="acc">Алексей</span>
              </h2>
              <p className="lead">
                Пять лет собираю и чиню сайты. Один: от структуры до релиза, без передачи по цепочке
                подрядчиков.
              </p>
              <p className="lead">
                Берусь за то, с чего другие исполнители слились. Этот сайт тоже собрал сам — он мой
                главный кейс.
              </p>
              <div className="about-meta mono">
                <span>Москва и вся Россия · удалённо</span>
                <span>самозанятый · чек и договор</span>
                <span>5.0 на Kwork · Profi.ru</span>
              </div>
            </div>
            <figure className="about-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/alex-portrait.png" alt="Алексей — веб-разработчик" width={760} height={805} loading="lazy" decoding="async" />
              <figcaption className="mono">Алексей · lstmind · Россия, работаю удалённо</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="blk" id="faq">
        <div className="wrap">
          <div className="reveal">
            <div className="eyebrow">
              <span className="n">08</span> <span className="scramble">Частые вопросы</span>
            </div>
            <h2>
              Отвечаю <span className="acc">заранее</span>
            </h2>
          </div>
          <FaqList />
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="contact">
        <span className="contact-shot" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/scene/contact.webp"
            srcSet="/img/scene/contact-720.webp 720w, /img/scene/contact.webp 1440w"
            sizes="100vw"
            alt=""
            width={1440}
            height={960}
            loading="lazy"
            decoding="async"
          />
        </span>
        <div className="wrap">
          <div className="eyebrow reveal">
            <span className="n">09</span> <span className="scramble">Контакт</span>
          </div>
          <div className="grid">
          <div className="reveal">
            <h2>
              Расскажи <span className="acc">задачу</span>
            </h2>
            <p className="note">
              Опиши в двух словах, что нужно — отвечу в течение часа и скажу честно, что стоит сделать и
              сколько. Консультация бесплатная, без обязательств.
            </p>
            <div className="direct mono">
              <a href={SITE.telegram} target="_blank" rel="noopener noreferrer" data-cursor data-magnet>
                <span className="ic">↗</span>Telegram<span className="pull">{SITE.telegramHandle}</span>
              </a>
              <a href={`mailto:${SITE.email}`} data-cursor>
                <span className="ic">@</span>Почта<span className="pull">{SITE.email}</span>
              </a>
              <a href={SITE.kwork} target="_blank" rel="noopener noreferrer" data-cursor>
                <span className="ic">✦</span>Kwork<span className="pull">Профиль · 5.0★</span>
              </a>
              <a href={SITE.github} target="_blank" rel="noopener noreferrer" data-cursor>
                <span className="ic">‹›</span>GitHub<span className="pull">Код проектов</span>
              </a>
            </div>
          </div>
          <ContactForm />
          </div>
        </div>
      </section>
      </main>

      <footer>
        <div className="wrap f-top">
          <div className="logo">
            <span className="sq" />
            {SITE.name}
          </div>
          <div className="made mono">
            Этот сайт собран на Next.js без шаблонов <span className="s">—</span> и он тоже мой кейс ·{" "}
            © {new Date().getFullYear()}
          </div>
          <div className="fl mono">
            <FooterClock />
            <a href={SITE.telegram} target="_blank" rel="noopener noreferrer" data-cursor>
              Telegram
            </a>
            <a href={SITE.kwork} target="_blank" rel="noopener noreferrer" data-cursor>
              Kwork
            </a>
            <a href={SITE.github} target="_blank" rel="noopener noreferrer" data-cursor>
              GitHub
            </a>
            <a href="#top" data-cursor data-top>
              Наверх ↑
            </a>
          </div>
        </div>
        <div className="f-mark" aria-hidden="true">
          lstmind<span>.</span>
        </div>
      </footer>
    </>
  );
}
