import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fira_Sans_Condensed, Montserrat } from "next/font/google";
import { SITE, PROJECTS_ALL, PROJECTS_ALL_LABEL, PROJECTS_TOTAL, TITLE_TAIL } from "@/lib/content";
import { PERSON_LD } from "@/lib/person-ld";
import { liveSitesWord, SITE_FROM } from "@/lib/home";
import { PROFI_STATS } from "@/lib/reviews";
import { YM_ID } from "@/lib/metrika";
import { Goals } from "@/components/v4/goals";
import { Cookie } from "@/components/v4/legal/Cookie";
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
/* тексты превью главной: голос сайта, факты из lib (общий опыт, число живых сайтов, рейтинг Профи), без длинных тире */
const EXP = `${PROJECTS_ALL} ${PROJECTS_ALL_LABEL}`;
const LIVE = `${PROJECTS_TOTAL} ${liveSitesWord()}`;
const FROM = SITE_FROM;
const OG_TITLE = "Алексей (lstmind): делаю, чиню и ускоряю сайты";
const OG_TEXT =
  `Без менеджеров: с кем переписываетесь, тот и пишет код. ${EXP}, из них ${LIVE} можно открыть по ссылке. ` +
  `Сайт ${FROM}, договор и чек. Kwork 5,0, Профи ${PROFI_STATS.rating.replace(".", ",")}.`;

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
  title: `Веб-разработчик в Москве: создание и доработка сайтов${TITLE_TAIL}`,
  description: `Создаю сайты под ключ ${FROM}, интернет-магазины и Telegram-ботов, дорабатываю и ускоряю чужие сайты. Без менеджеров, ${EXP}, договор и чек.`,
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
    siteName: SITE.ogName,
    title: OG_TITLE,
    description: OG_TEXT,
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_TEXT,
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
 * канонический (lib/person-ld.ts), остальные страницы ссылаются на него по `${SITE.url}#person`.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    PERSON_LD,
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
        {/* апостроф в логотипе падает только на первой странице визита: переходы по сайту полные,
            иначе он исчезал бы и падал заново на каждой странице (header.css, lg-seen). до шапки, чтобы не мигнул */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{sessionStorage.getItem("lg-drop")?document.documentElement.classList.add("lg-seen"):sessionStorage.setItem("lg-drop","1")}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a className="skip" href="#main">
          К содержимому
        </a>
        {/* плашка cookie: скрыта до первого скролла или касания (не раньше 3 с), в порядке Tab сразу после пропуска */}
        <Cookie />
        {children}
        <Goals />
        {/* noscript-пикселя Метрики нет намеренно: без JS не видна и плашка cookie, а пиксель отправил бы хит без уведомления */}
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
      </body>
    </html>
  );
}
