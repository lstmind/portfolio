import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { SITE } from "@/lib/content";
import { ClientFX } from "@/components/ClientFX";
import { YM_ID } from "@/lib/metrika";
import "./globals.css";

/**
 * Шрифты собраны в свои подмножества и лежат рядом с кодом.
 * Через next/font/google Google отдаёт их кусками по unicode-range, и один только
 * знак ₽ в заголовке тянул latin-ext на 115 кб — там вся диакритика Европы,
 * которой на русском сайте не будет никогда. Здесь каждый шрифт это один
 * переменный файл: латиница, кириллица, пунктуация, стрелки и валюта.
 * Было девять запросов и 300 кб, стало три и 105.
 */
const unbounded = localFont({
  src: "./fonts/unbounded.woff2",
  weight: "700 900",
  variable: "--font-unbounded",
  display: "swap",
  fallback: ["Arial Black", "system-ui", "sans-serif"],
});
const mono = localFont({
  src: "./fonts/jbmono.woff2",
  weight: "400 700",
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
  // моноширинный идёт в мелких подписях: пусть не конкурирует с заголовками за канал
  preload: false,
});
const manrope = localFont({
  src: "./fonts/manrope.woff2",
  weight: "400 700",
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  // запрос впереди, бренд в хвост: в выдаче видно первые ~60 знаков, и имя там ничего не ловит
  title: "Веб-разработчик в Москве: сайты под ключ, ремонт чужих | lstmind",
  description:
    "Фриланс веб-разработчик: сайты под ключ, магазины, боты и админки, спасение и ускорение чужих сайтов. Москва и вся Россия удалённо. Рейтинг 5.0 на Kwork.",
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
      "Сайты под ключ, магазины, доработки и ускорение. Чистый код, скорость, реальные кейсы. Рейтинг 5.0 на Kwork.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Алексей (lstmind) — сайты, которые работают",
    description: "Сайты под ключ, магазины, спасение и ускорение чужих сайтов. Рейтинг 5.0 на Kwork.",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "sFBc1LBjy66FYgol2qlYubyt7aDi2Yfa2N2bWKylyRE",
    yandex: "bbd073da5a9dfea9",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080A",
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
      sameAs: [SITE.telegram, SITE.kwork, SITE.github],
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
    <html lang="ru" className={`${unbounded.variable} ${mono.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a className="skip" href="#main">
          К содержимому
        </a>
        <ClientFX />
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
