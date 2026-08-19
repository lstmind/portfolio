import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

/**
 * Пускаем всех, включая роботов, которые собирают данные для быстрых
 * ответов в поиске: сайт должен попадать не только в обычную выдачу.
 * Закрыт только /api — там нет контента, одни обработчики форм.
 */
const ANSWER_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "YandexAdditional", // быстрые ответы Яндекса
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      ...ANSWER_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: "/api/" })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
