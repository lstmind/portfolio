import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

/**
 * Иконка на домашнем экране телефона: знак l’ (белая l и красный апостроф) на плитке туши
 * (design-concepts/v4/brand/final-logo, _tools/build.py).
 * maskable: плитка во весь квадрат, знак внутри круга 80%, Android режет кругом, каплей или скруглённым квадратом.
 * Во вкладке только app/favicon.ico: 16 и 32 нарисованы по пикселям, svg рядом браузер взял бы вместо них и размыл бы в 16.
 * Цвет бумаги и под заставкой при запуске, и в строке состояния.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name}: Алексей, веб-разработчик`,
    short_name: SITE.name,
    description: "Сайты, магазины, телеграм-боты и починка чужих сайтов. Без менеджеров, договор и чек.",
    lang: "ru",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f6f3",
    theme_color: "#f7f6f3",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
