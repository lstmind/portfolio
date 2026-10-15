import { SITE, priceNumber } from "@/lib/content";
import { serviceBySlug } from "@/lib/services";
import { PROFI_URL } from "@/lib/reviews";
import { OWNER } from "@/lib/legal";
import { EDU, PERSON, SINCE, STACK_ALL } from "@/components/v4/about/data";

/**
 * Один Person на весь сайт: его отдаёт app/layout.tsx на каждой странице.
 * Публичное имя "Алексей" (FACTS.md), фамилия только на /obo-mne: там узел с тем же @id
 * дополняет этот (PERSON_EXTRA_LD), а name и description не повторяет, чтобы у сущности
 * не получилось двух имён и двух описаний.
 */
export const PERSON_ID = `${SITE.url}#person`;

/** нижняя цена сайта числом, из страницы "Сайт под ключ": разметка не расходится с ценой на сайте */
const SITE_MIN = priceNumber(serviceBySlug("sayt-pod-klyuch")!.price.value);

/** стек с /obo-mne плюс то, что есть в услугах; без повторов и без обобщений вроде "вёрстка по Figma" */
const KNOWS = [
  "Разработка сайтов",
  "Интернет-магазины",
  ...new Set([
    ...STACK_ALL.filter((s) => !/вёрстка|MAX/.test(s)),
    "TypeScript",
    "Node.js",
    "Figma",
    "Вёрстка",
    "Техническое SEO",
    "Парсинг данных",
  ]),
];

export const PERSON_LD = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE.person,
  alternateName: SITE.name,
  jobTitle: "Веб-разработчик",
  description: `Веб-разработчик на фрилансе с ${SINCE} года: сайты под ключ, интернет-магазины, боты для Telegram, MAX и ВК, админки и CRM, доработка и ускорение чужих сайтов, техническое SEO.`,
  // страница о человеке: кто он, контакты, реквизиты. Сайт целиком описывает WebSite
  url: `${SITE.url}/obo-mne`,
  mainEntityOfPage: `${SITE.url}/obo-mne`,
  email: SITE.email,
  telephone: OWNER.phoneLd,
  image: `${SITE.url}/img/alex-portrait.png`,
  sameAs: [SITE.telegram, SITE.kwork, PROFI_URL, SITE.github],
  knowsAbout: KNOWS,
  address: { "@type": "PostalAddress", addressLocality: PERSON.city, addressCountry: "RU" },
  workLocation: { "@type": "Place", name: "Москва и вся Россия, удалённо" },
  makesOffer: {
    "@type": "Offer",
    priceCurrency: "RUB",
    price: SITE_MIN,
    priceSpecification: {
      "@type": "PriceSpecification",
      priceCurrency: "RUB",
      minPrice: SITE_MIN,
      valueAddedTaxIncluded: false,
    },
    url: `${SITE.url}/uslugi`,
    itemOffered: { "@type": "Service", name: "Разработка сайтов под ключ" },
  },
};

/** дополнение на /obo-mne: фамилия и учёба, без своего name и description */
export const PERSON_EXTRA_LD = {
  "@type": "Person",
  "@id": PERSON_ID,
  givenName: PERSON.given,
  familyName: PERSON.family,
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: EDU.name,
    alternateName: EDU.short,
    url: EDU.url,
  },
};
