import { SITE, SERVICES } from "@/lib/content";
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

/** первое сообщение в Telegram с главной: шапка, язычок, подвал и кнопка героя */
const TG_HOME = tgText({ kind: "home" });

export default async function Home() {
  const kwork = await getKworkReviewsCount();

  // schema.org: факты об услугах и ценах в машинном виде — для выдачи и быстрых ответов
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE.url}#service`,
    name: "lstmind — веб-разработчик Алексей",
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
    address: { "@type": "PostalAddress", addressLocality: "Москва", addressCountry: "RU" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: SITE.email,
      url: SITE.telegram,
      availableLanguage: "ru",
    },
    sameAs: [SITE.telegram, KWORK_URL, PROFI_URL, SITE.github],
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
                valueAddedTaxIncluded: false,
                description: `от ${s.priceFrom} ₽ за ${s.priceUnit}`,
              },
            }
          : {}),
      })),
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
