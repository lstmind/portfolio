import type { Metadata, Viewport } from "next";
import { Unbounded, JetBrains_Mono, Manrope } from "next/font/google";
import { SITE } from "@/lib/content";
import { ClientFX } from "@/components/ClientFX";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "700", "800", "900"],
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
  title: "Алексей (lstmind) — веб-разработчик. Сайты, которые работают",
  description:
    "Фриланс веб-разработчик: сайты под ключ, интернет-магазины, доработки и ускорение. WordPress, Tilda, чистая вёрстка. Работаю на копии, с бэкапом. Рейтинг 5.0 на Kwork.",
  keywords: [
    "веб-разработчик",
    "сайт под ключ",
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
  robots: { index: true, follow: true },
  verification: { google: "sFBc1LBjy66FYgol2qlYubyt7aDi2Yfa2N2bWKylyRE" },
};

export const viewport: Viewport = {
  themeColor: "#08080A",
  width: "device-width",
  initialScale: 1,
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
        <ClientFX />
        {children}
      </body>
    </html>
  );
}
