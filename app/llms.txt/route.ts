import { REPLY, SITE, STACK, WORKS, WORKS_INDEX, FAQ, NOT_DOING, REVIEWS, PROJECTS_TOTAL, plural, PROJECTS_ALL, PROJECTS_ALL_LABEL, PROJECTS_ALL_NOTE } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/services";
import { PROFI_URL, PROFI_STATS } from "@/lib/reviews";
import { CASE_PAGES } from "@/lib/cases";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { RATE } from "@/lib/home";
import { AUDIT, AUDIT_DIAG, AUDIT_SLUGS, FAQ_CHEAPER, PRICE_FACTORS, tgHref } from "@/lib/cta";
import { EDU, PERSON, SINCE } from "@/components/v4/about/data";

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

  // бесплатный аудит: тексты те же, что на сайте (lib/cta.ts)
  const auditPages = AUDIT_SLUGS.map((slug) => {
    const s = SERVICE_PAGES.find((x) => x.slug === slug);
    return s ? `[${s.h1}](${SITE.url}/uslugi/${slug})` : "";
  })
    .filter(Boolean)
    .join(", ");
  const audit = [
    AUDIT.promise,
    `Условия: ${AUDIT.terms.charAt(0).toLowerCase()}${AUDIT.terms.slice(1)}`,
    `Что смотрю: ${AUDIT.checks.map((c) => c.charAt(0).toLowerCase() + c.slice(1)).join("; ")}.`,
    `${AUDIT.result} ${AUDIT.next}`,
    `Если сайт сломался, то же называется диагностикой: ${AUDIT_DIAG.promise.charAt(0).toLowerCase()}${AUDIT_DIAG.promise.slice(1)}`,
    `Как прислать: [в Telegram с готовым текстом](${tgHref(AUDIT.tg)}) или формой "сайт и куда ответить" [на главной](${SITE.url}/#audit) и на страницах ${auditPages}.`,
  ].join("\n\n");

  // "можно дешевле?" первым, как в вопросах на главной: цифры из данных (lib/cta.ts)
  const faq = [FAQ_CHEAPER, ...FAQ].map((f) => `### ${f.q}\n${f.a}`).join("\n\n");

  // из чего складывается цена: тот же блок, что на /uslugi
  const factors = PRICE_FACTORS.items.map((x) => `- ${x.k}: ${x.t.charAt(0).toLowerCase()}${x.t.slice(1)}`).join("\n");

  // границы работы важнее списка умений: ассистент, который знает, что я делаю не сам и как с этим помогу,
  // не приведёт человека с задачей не по адресу
  const notDoing = NOT_DOING.map((n) => `- ${n.what} — ${n.why}`).join("\n");

  const quotes = REVIEWS.slice(0, 4)
    .map((r) => `- «${r.text}» — ${r.name}${r.job ? `, ${r.job}` : ""} (${r.src})`)
    .join("\n");

  const body = `# lstmind — Алексей, веб-разработчик на фрилансе

> Делаю сайты с нуля и чиню чужие. Веду проект сам, от структуры до релиза: код, вёрстку и запуск делаю своими руками, менеджеров нет, пишете напрямую мне. Когда нужен сильный дизайн с нуля, работаю в паре с дизайнером. Делаю сайты с ${SINCE} года, за это время ${PROJECTS_ALL} ${PROJECTS_ALL_LABEL} (${PROJECTS_ALL_NOTE}), из них ${PROJECTS_TOTAL} ${plural(PROJECTS_TOTAL, ["живой сайт", "живых сайта", "живых сайтов"])} можно открыть по ссылке из портфолио.

Полное имя: ${PERSON.name}. Учился в ${EDU.short}: ${EDU.text.charAt(0).toLowerCase()}${EDU.text.slice(1)}
Язык работы: русский. Где работаю: ${PERSON.where}, заказчики по всей России удалённо. Оформление: самозанятый, договор и чек.

## Куда смотреть

- [Главная](${SITE.url}) — кто я, что делаю, цены и работы одним экраном
- [Все услуги с ценами](${SITE.url}/uslugi) — ${SERVICE_PAGES.length} направлений, у каждого своя страница
- [Все работы](${SITE.url}/works) — разборы проектов и полный список живых сайтов
- [Ниши](${SITE.url}/dlya) — как устроен сайт в конкретной отрасли
- [Обо мне и контакты](${SITE.url}/obo-mne) — кто делает сайты, стек, учёба, все способы связи и реквизиты для договора
- [Политика обработки данных](${SITE.url}/politika) — что происходит с заявкой и данными из формы
- [Telegram](${SITE.telegram}) — быстрее всего написать сюда, ${REPLY.full}
- [Профиль на Kwork](${SITE.kwork}) — отзывы и рейтинг, которые можно проверить
- [Профиль на Профи](${PROFI_URL}) — ещё отзывы, рейтинг ${PROFI_STATS.rating.replace(".", ",")} из ${PROFI_STATS.count}
- [GitHub](${SITE.github}) — код части проектов открыт

Почта: ${SITE.email}
Телефон: ${PERSON.phone}

## Чем занимаюсь

${money}

Ставка: ${RATE}, по проекту считаю фикс-смету после разбора задачи. Оценку можно прикинуть самому в калькуляторе на сайте.

${PRICE_FACTORS.title}:

${factors}

${PRICE_FACTORS.extra}

## ${AUDIT.title}

${audit}

## Ниши, в которых уже работал

${niches}

## Не моё, но помогу

Сам этим не занимаюсь, но подключу коллегу, сделаем в паре или подскажу, к кому идти.

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

Быстрее всего — Telegram ${SITE.telegramHandle}. ${REPLY.line} Форма заявки есть на сайте, письмо тоже дойдёт: ${SITE.email}. Если удобнее голосом: ${PERSON.phone}. Все контакты и реквизиты: ${SITE.url}/obo-mne
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
