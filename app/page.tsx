import { SITE, HOURS, priceNumber, rub } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/services";
import { OWNER } from "@/lib/legal";
import { RATE } from "@/lib/home";
import { getKworkReviewsCount } from "@/lib/kwork";
import { KWORK_URL, PROFI_URL } from "@/lib/reviews";
import { Header } from "@/components/v4/Header";
import { Footer } from "@/components/v4/Footer";
import { Tongue } from "@/components/v4/Tongue";
import { Hero } from "@/components/v4/home/Hero";
import { Works } from "@/components/v4/home/Works";
import { Prices } from "@/components/v4/home/Prices";
import { Reviews } from "@/components/v4/home/Reviews";
import { Process } from "@/components/v4/home/Process";
import { Final } from "@/components/v4/home/Final";
import "@/components/v4/home/home.css";
import { tgText } from "@/lib/cta";
import { AuditStrip } from "@/components/v4/cta/Strip";

/** часы ответа из lib/content.ts (HOURS): те же "ежедневно 10–22 мск", что на каждой странице */
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
const OPENING = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => `https://schema.org/${d}`),
  opens: hh(HOURS.from),
  closes: hh(HOURS.to),
};

/** за что берётся цена: по строке цены на странице услуги */
const unitOf = (v: string) => (/\/час/.test(v) ? "час" : /\/мес| в месяц/.test(v) ? "месяц" : /экран/.test(v) ? "экран" : "проект");

/**
 * Каталог услуг из тех же данных, что страницы /uslugi/*: название как h1, ссылка на страницу, нижняя цена числом.
 * "Аудит бесплатно" с работами по ставке (ускорение) получает цену часа из примечания к цене.
 */
const OFFERS = SERVICE_PAGES.map((s) => {
  const free = /бесплатн/i.test(s.price.value);
  const byHour = free && /\/час/.test(s.price.note);
  const min = free ? (byHour ? priceNumber(s.price.note) : null) : priceNumber(s.price.value);
  const unit = byHour ? "час" : unitOf(s.price.value);
  return {
    "@type": "Offer",
    url: `${SITE.url}/uslugi/${s.slug}`,
    itemOffered: { "@type": "Service", name: s.h1, description: s.answer },
    ...(min
      ? {
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: min,
            priceCurrency: "RUB",
            valueAddedTaxIncluded: false,
            description: free ? `${s.price.value}, работы от ${rub(min)} ₽ за ${unit}` : `от ${rub(min)} ₽ за ${unit}`,
          },
        }
      : {}),
  };
});

/** первое сообщение в Telegram с главной: шапка, язычок, подвал и кнопка героя */
const TG_HOME = tgText({ kind: "home" });

export default async function Home() {
  const kwork = await getKworkReviewsCount();

  // schema.org: факты об услугах и ценах в машинном виде — для выдачи и быстрых ответов
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE.url}#service`,
    name: "lstmind, веб-разработчик Алексей",
    url: SITE.url,
    image: `${SITE.url}/img/alex-portrait.png`,
    description:
      "Фриланс веб-разработчик Алексей (lstmind): сайты под ключ, интернет-магазины на WooCommerce, " +
      `доработка и ускорение чужих сайтов. Веду проект сам, от структуры до релиза, без менеджеров. Ставка ${RATE.replace(/ /g, " ")}, по проекту фикс-смета.`,
    priceRange: "от 2 000 ₽",
    currenciesAccepted: "RUB",
    areaServed: [
      { "@type": "City", name: "Москва" },
      { "@type": "Country", name: "Россия" },
    ],
    knowsLanguage: "ru",
    founder: { "@id": `${SITE.url}#person` },
    telephone: OWNER.phoneLd,
    email: SITE.email,
    openingHoursSpecification: OPENING,
    address: { "@type": "PostalAddress", addressLocality: "Москва", addressCountry: "RU" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: SITE.email,
      telephone: OWNER.phoneLd,
      url: SITE.telegram,
      availableLanguage: "ru",
      hoursAvailable: OPENING,
    },
    sameAs: [SITE.telegram, KWORK_URL, PROFI_URL, SITE.github],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Услуги веб-разработки",
      itemListElement: OFFERS,
    },
    // рейтинг и отзывы о себе на своём же сайте поисковики не принимают: для них это
    // self-serving разметка, за которую прилетает не звёздочка, а ручная санкция.
    // отзывы остаются в видимом тексте, по двум площадкам отдельно, со ссылками на профили, где их можно проверить.
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <Header tg={TG_HOME} />
      <main id="main">
        <Hero />
        <Works />
        <Prices />
        <Reviews kwork={kwork} />
        {/* бесплатный аудит одной полосой между отзывами и вопросами: для тех, у кого сайт уже есть */}
        <AuditStrip place="home-strip" id="audit" page />
        <Process />
        <Final />
      </main>
      <Footer tg={TG_HOME} />
      <Tongue tg={TG_HOME} />
    </>
  );
}
