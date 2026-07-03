import { SITE } from "./content";

/** Фолбэк, если Kwork недоступен или сменил разметку */
export const FALLBACK_REVIEWS = 29;

/**
 * Живое число отзывов с профиля Kwork.
 * Страница профиля несёт totalReviewsCount в window.stateData — парсим regex'ом.
 * Кэш сутки (ISR): бейдж обновляется сам, «29» больше не протухает.
 */
export async function getKworkReviewsCount(): Promise<number> {
  try {
    const res = await fetch(SITE.kwork, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return FALLBACK_REVIEWS;
    const html = await res.text();
    const m = html.match(/"totalReviewsCount"\s*:\s*(\d+)/);
    const n = m ? parseInt(m[1], 10) : 0;
    return n > 0 ? n : FALLBACK_REVIEWS;
  } catch {
    return FALLBACK_REVIEWS;
  }
}
