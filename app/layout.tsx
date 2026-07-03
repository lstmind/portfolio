import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Unbounded, JetBrains_Mono, Manrope } from "next/font/google";
import { SITE } from "@/lib/content";
import { ClientFX } from "@/components/ClientFX";
import { YM_ID } from "@/lib/metrika";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["cyrillic", "latin"],
  weight: ["700", "800", "900"],
  variable: "--font-unbounded",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Алексей (lstmind) — веб-разработчик. Сайты под ключ, починю чужой сайт",
  description:
    "Фриланс веб-разработчик: сайты под ключ, интернет-магазины, спасение и ускорение чужих сайтов. WordPress, Tilda, чистая вёрстка. Работаю на копии, с бэкапом. Рейтинг 5.0 на Kwork.",
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
  verification: { google: "sFBc1LBjy66FYgol2qlYubyt7aDi2Yfa2N2bWKylyRE" },
};

export const viewport: Viewport = {
  themeColor: "#08080A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Алексей",
  alternateName: "lstmind",
  jobTitle: "Веб-разработчик",
  url: SITE.url,
  email: SITE.email,
  sameAs: [SITE.telegram, SITE.kwork],
  knowsAbout: ["WordPress", "WooCommerce", "Tilda", "JavaScript", "PHP", "Figma", "Вёрстка"],
  makesOffer: {
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: "Разработка сайтов под ключ" },
  },
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
