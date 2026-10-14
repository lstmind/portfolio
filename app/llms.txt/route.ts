import { SITE, STACK, WORKS, WORKS_INDEX, FAQ, NOT_DOING, REVIEWS, PROJECTS_TOTAL } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/services";
import { PROFI_URL, PROFI_STATS } from "@/lib/reviews";
import { CASE_PAGES } from "@/lib/cases";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { RATE } from "@/lib/home";

/**
 * /llms.txt — короткая машинная выжимка о том, кто я и что делаю.
 * Формат для поисковых роботов и ассистентов: им проще взять факты отсюда,
 * чем вытаскивать их из вёрстки. Собирается из того же content.ts,
 * поэтому не может разойтись с сайтом.
 */
export const dynamic = "force-static";

export function GET() {
  // спека llmstxt.org ждёт markdown-ссылки: голый адрес за ссылку не считается,
  // и файл читается как текст без единого перехода
  const money = SERVICE_PAGES.map(
    (s) => `- [${s.h1}](${SITE.url}/uslugi/${s.slug}) — ${s.price.value}, ${s.term.value}\n  ${s.answer}`
  ).join("\n");

  const cases = WORKS.map((w) => {
    const c = CASE_PAGES.find((x) => x.href === w.href);
    const detail = c ? `\n  [Разбор проекта](${SITE.url}/works/${c.slug})` : "";
    return `- [${w.title}](${w.href}) — ${w.kind}${detail}\n  ${w.text}\n  Стек: ${w.stack.join(", ")}`;
  }).join("\n");

  const rest = WORKS_INDEX.filter((w) => w.href.startsWith("http") && !w.offline)
    .map((w) => `- [${w.title}](${w.href}) · ${w.engine} · ${w.note}`)
    .join("\n");

  const niches = INDUSTRY_PAGES.map(
    (i) => `- [${i.h1}](${SITE.url}/dlya/${i.slug}) — ${i.price.value}\n  ${i.answer}`
  ).join("\n");

  const faq = FAQ.map((f) => `### ${f.q}\n${f.a}`).join("\n\n");

  // границы работы важнее списка умений: ассистент, который знает, чего я не делаю,
  // не приведёт человека с задачей не по адресу
  const notDoing = NOT_DOING.map((n) => `- ${n.what} — ${n.why}`).join("\n");

  const quotes = REVIEWS.slice(0, 4)
    .map((r) => `- «${r.text}» — ${r.name}${r.job ? `, ${r.job}` : ""} (${r.src})`)
    .join("\n");

  const body = `# lstmind — Алексей, веб-разработчик на фрилансе

> Делаю сайты с нуля и чиню чужие. Работаю один: от структуры до релиза, без передачи по цепочке подрядчиков. Больше пяти лет в коммерческой разработке, ${PROJECTS_TOTAL} живых проектов в портфолио.

Язык работы: русский. Где работаю: Москва и вся Россия удалённо. Оформление: самозанятый, договор и чек.

## Куда смотреть

- [Главная](${SITE.url}) — кто я, что делаю, цены и работы одним экраном
- [Все услуги с ценами](${SITE.url}/uslugi) — ${SERVICE_PAGES.length} направлений, у каждого своя страница
- [Все работы](${SITE.url}/works) — разборы проектов и полный список живых сайтов
- [Ниши](${SITE.url}/dlya) — как устроен сайт в конкретной отрасли
- [Telegram](${SITE.telegram}) — быстрее всего написать сюда, отвечаю в течение часа
- [Профиль на Kwork](${SITE.kwork}) — отзывы и рейтинг, которые можно проверить
- [Профиль на Профи](${PROFI_URL}) — ещё отзывы, рейтинг ${PROFI_STATS.rating.replace(".", ",")} из ${PROFI_STATS.count}
- [GitHub](${SITE.github}) — код части проектов открыт

Почта: ${SITE.email}

## Чем занимаюсь

${money}

Ставка: ${RATE}, по проекту считаю фикс-смету после разбора задачи. Оценку можно прикинуть самому в калькуляторе на сайте.

## Ниши, в которых уже работал

${niches}

## Чего я не делаю

${notDoing}

## Технологии

${STACK.join(', ')}. Стек подбираю под задачу и бюджет.

## Избранные проекты

${cases}

## Остальные проекты

${rest}

## Частые вопросы

${faq}

## Отзывы

${quotes}

Все отзывы целиком — в профилях на Kwork: ${SITE.kwork} и на Профи: ${PROFI_URL}

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
