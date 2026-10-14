import { SITE } from "@/lib/content";

/**
 * Пускаем всех, включая роботов, которые собирают данные для быстрых
 * ответов в поиске: сайт должен попадать не только в обычную выдачу.
 * Закрыт только /api — там нет контента, одни обработчики форм.
 *
 * Файл собирается руками, а не через MetadataRoute.Robots: Next не умеет
 * Clean-param, а без него Яндекс обходит адреса с метками как отдельные страницы.
 * Host не пишем: Яндекс не читает его с 2018 года, зеркало склеено редиректами.
 */
export const dynamic = "force-static";

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

/** метки рекламы и аналитики: страница от них не меняется */
const CLEAN_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "yclid",
  "ysclid",
  "gclid",
  "fbclid",
  "_openstat",
  "from",
];

export function GET() {
  const groups = ["*", ...ANSWER_BOTS].map((ua) => `User-Agent: ${ua}\nAllow: /\nDisallow: /api/\n`);
  const body = [
    ...groups,
    `Clean-param: ${CLEAN_PARAMS.join("&")}`,
    `Sitemap: ${SITE.url}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
