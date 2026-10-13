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
      `доработка и ускорение чужих сайтов. Работаю один, от структуры до релиза. Ставка ${RATE.replace(/ /g, " ")}, по проекту фикс-смета.`,
    priceRange: "от 1 500 ₽",
    currenciesAccepted: "RUB",
    areaServed: [
      { "@type": "City", name: "Москва" },
      { "@type": "Country", name: "Россия" },
    ],
    knowsLanguage: "ru",
    founder: { "@id": `${SITE.url}#person` },
    provider: { "@id": `${SITE.url}#person` },
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
      <Header />
      <main id="main">
        <Hero />
        <Works />
        <Prices />
        <Reviews kwork={kwork} />
        <Process />
        <Final />
      </main>
      <Footer />
      <Tongue />
    </>
  );
}
