import { SITE, SERVICES, WORKS, WORKS_INDEX, FAQ, PROJECTS_TOTAL } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/services";
import { CASE_PAGES } from "@/lib/cases";

/**
 * /llms.txt — короткая машинная выжимка о том, кто я и что делаю.
 * Формат для поисковых роботов и ассистентов: им проще взять факты отсюда,
 * чем вытаскивать их из вёрстки. Собирается из того же content.ts,
 * поэтому не может разойтись с сайтом.
 */
export const dynamic = "force-static";

export function GET() {
  const money = SERVICE_PAGES.map(
    (s) => `- ${s.h1} — ${SITE.url}/uslugi/${s.slug}\n  ${s.answer}`
  ).join("\n");

  const cases = WORKS.map((w) => {
    const c = CASE_PAGES.find((x) => x.href === w.href);
    const detail = c ? `\n  Разбор проекта: ${SITE.url}/works/${c.slug}` : "";
    return `- ${w.title} (${w.kind}) — живой сайт ${w.href}${detail}\n  ${w.text}\n  Стек: ${w.stack.join(", ")}`;
  }).join("\n");

  const rest = WORKS_INDEX.filter((w) => w.href.startsWith("http"))
    .map((w) => `- ${w.title} — ${w.href} · ${w.engine} · ${w.note}`)
    .join("\n");

  const faq = FAQ.map((f) => `### ${f.q}\n${f.a}`).join("\n\n");

  const body = `# lstmind — Алексей, веб-разработчик на фрилансе

> Делаю сайты с нуля и чиню чужие. Работаю один: от структуры до релиза, без агентства и передачи по цепочке подрядчиков. Пятый год в коммерческой разработке, ${PROJECTS_TOTAL} живых проектов в портфолио, рейтинг 5.0 на Kwork.

Сайт: ${SITE.url}
Telegram: ${SITE.telegram}
Почта: ${SITE.email}
Профиль на Kwork: ${SITE.kwork}
GitHub: ${SITE.github}
Язык работы: русский. Где работаю: Москва и вся Россия удалённо. Оформление: самозанятый, договор и чек.

## Чем занимаюсь

${money}

Ставка за час — ${SITE.ratePerHour} ₽, по проекту считаю фикс-смету после разбора задачи. Оценку можно прикинуть самому в калькуляторе на сайте.

## Технологии

WordPress и WooCommerce, Tilda, MODX, 1С-Битрикс, чистая вёрстка по Figma, Next.js, Astro, Svelte, PHP, JavaScript, TypeScript. Стек подбираю под задачу и бюджет.

## Избранные проекты

${cases}

## Остальные проекты

${rest}

## Частые вопросы

${faq}

## Как со мной связаться

Быстрее всего — Telegram ${SITE.telegramHandle}. Отвечаю в течение часа в рабочее время. Форма заявки есть на сайте, письмо тоже дойдёт: ${SITE.email}.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
