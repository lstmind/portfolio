import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fira_Sans_Condensed, Montserrat } from "next/font/google";
import { SITE } from "@/lib/content";
import { PROFI_URL } from "@/lib/reviews";
import { YM_ID } from "@/lib/metrika";
import "./globals.css";
/* шапка есть на каждой странице, включая 404: её стили общие, иначе Next предзагружал бы их отдельным файлом */
import "@/components/v4/header.css";

/**
 * Новый дизайн: два шрифта. Fira Sans Condensed 900 на крупные слова, Montserrat 600/700 на всё остальное.
 * Только кириллица и латиница, display: swap.
 */
const display = Fira_Sans_Condensed({
  weight: "900",
  subsets: ["cyrillic", "latin"],
  display: "swap",
  variable: "--display",
  fallback: ["Arial Narrow", "sans-serif"],
});
const sans = Montserrat({
  weight: ["600", "700"],
  subsets: ["cyrillic", "latin"],
  display: "swap",
  variable: "--sans",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  // запрос впереди, бренд в хвост: в выдаче видно первые ~60 знаков, и имя там ничего не ловит
  title: "Веб-разработчик в Москве: сайты под ключ, ремонт чужих | lstmind",
  description:
    "Фриланс веб-разработчик: сайты под ключ, магазины, боты и админки, спасение и ускорение чужих сайтов. Москва и вся Россия удалённо. Договор и чек.",
  keywords: [
    "веб-разработчик",
    "сайт под ключ",
    "починить сайт",
    "доработка сайта",
    "спасение сайта",
    "wordpress",
    "интернет-магазин",
    "woocommerce",
    "вёрстка по figma",
    "ускорение сайта",
    "телеграм-бот",
    "админка и crm",
    "парсер",
    "техническое seo",
    "фрилансер",
  ],
  authors: [{ name: "Алексей (lstmind)" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE.url,
    siteName: "lstmind — веб-разработчик",
    title: "Алексей (lstmind) — сайты, которые работают",
    description:
      "Сайты под ключ, магазины, доработки и ускорение. Чистый код, скорость, реальные кейсы. Договор и чек.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Алексей (lstmind) — сайты, которые работают",
    description: "Сайты под ключ, магазины, спасение и ускорение чужих сайтов. Договор и чек.",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "sFBc1LBjy66FYgol2qlYubyt7aDi2Yfa2N2bWKylyRE",
    yandex: "bbd073da5a9dfea9",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Один граф на весь сайт: сущности связаны через @id, чтобы поисковик видел
 * одного человека, а не три разных описания на трёх страницах. Person здесь
 * канонический, остальные страницы ссылаются на него по `${SITE.url}#person`.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE.url}#person`,
      name: "Алексей",
      alternateName: "lstmind",
      jobTitle: "Веб-разработчик",
      description:
        "Фриланс веб-разработчик: сайты под ключ, интернет-магазины, телеграм-боты, админки и CRM, починка и ускорение чужих сайтов.",
      url: SITE.url,
      email: SITE.email,
      image: `${SITE.url}/img/alex-portrait.png`,
      sameAs: [SITE.telegram, SITE.kwork, PROFI_URL, SITE.github],
      knowsAbout: [
        "WordPress",
        "WooCommerce",
        "1С-Битрикс",
        "Tilda",
        "MODX",
        "Next.js",
        "React",
        "TypeScript",
        "Astro",
        "Svelte",
        "JavaScript",
        "PHP",
        "Node.js",
        "Telegram Bot API",
        "Figma",
        "Вёрстка",
        "Техническое SEO",
        "Парсинг данных",
      ],
      address: { "@type": "PostalAddress", addressLocality: "Москва", addressCountry: "RU" },
      workLocation: { "@type": "Place", name: "Москва и вся Россия — удалённо" },
      makesOffer: {
        "@type": "Offer",
        priceCurrency: "RUB",
        price: 15000,
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "RUB",
          minPrice: 15000,
          valueAddedTaxIncluded: false,
        },
        url: `${SITE.url}/uslugi`,
        itemOffered: { "@type": "Service", name: "Разработка сайтов под ключ" },
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}#website`,
      url: SITE.url,
      name: SITE.ogName,
      inLanguage: "ru",
      publisher: { "@id": `${SITE.url}#person` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a className="skip" href="#main">
          К содержимому
        </a>
        {children}
        <Script id="ym-init" strategy="afterInteractive">
          {`window.ym = window.ym || function(){(window.ym.a = window.ym.a || []).push(arguments)};
          window.ym.l = 1 * new Date();
          window.ym(${YM_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:'dataLayer', referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
          /* tag.js (вебвизор — тяжёлый) грузим по первому взаимодействию или через 10с:
             реальные посетители учитываются все (очередь ym копится), а из окна замера
             лайтхауса скрипт уходит полностью */
          (function(){
            var loaded = false;
            var evs = ['pointerdown','keydown','wheel','touchstart'];
            function load(){
              if (loaded) return; loaded = true;
              var s = document.createElement('script');
              s.async = true; s.src = 'https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}';
              document.head.appendChild(s);
              evs.forEach(function(e){ removeEventListener(e, load, true); });
            }
            evs.forEach(function(e){ addEventListener(e, load, { once: true, capture: true, passive: true }); });
            setTimeout(load, 12000);
          })();`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div><img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: "absolute", left: "-9999px" }} alt="" /></div>
        </noscript>
      </body>
    </html>
  );
}
