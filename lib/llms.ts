import {
  REPLY,
  SITE,
  WORKS,
  WORKS_INDEX,
  FAQ,
  NOT_DOING,
  REVIEWS,
  PROJECTS_TOTAL,
  PAY,
  plural,
  rub,
  PROJECTS_ALL,
  PROJECTS_ALL_LABEL,
  PROJECTS_ALL_NOTE,
  TITLE_TAIL,
  WP_SITES,
} from "@/lib/content";
import { SERVICE_PAGES, serviceBySlug, type ServicePage } from "@/lib/services";
import { KWORK_STATS, PROFI_URL, PROFI_STATS, REVIEWS_SNAPSHOT } from "@/lib/reviews";
import { CASE_PAGES, type CasePage } from "@/lib/cases";
import { INDUSTRY_PAGES, nichesOfCase } from "@/lib/industries";
import { RATE } from "@/lib/home";
import { AUDIT, AUDIT_DIAG, AUDIT_SLUGS, FAQ_CHEAPER, PRICE_FACTORS, tgHref } from "@/lib/cta";
import { CAN, EDU, INSURED, PERSON, SINCE, STACK_ALL } from "@/components/v4/about/data";

/**
 * Машинные выжимки сайта для поисковых роботов и ассистентов: /llms.txt (короткий индекс)
 * и /llms-full.txt (всё содержание услуг, ниш и разборов). Собираются из тех же lib,
 * что и страницы, поэтому не могут разойтись с сайтом. Формат по llmstxt.org: markdown,
 * ссылки markdown-ссылками (голый адрес за ссылку не считается).
 */

const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const list = (xs: readonly string[]) => xs.map((x) => `- ${x}`).join("\n");
const qa = (items: readonly { q: string; a: string; more?: { href: string; label: string } }[], level = "###") =>
  items.map((f) => `${level} ${f.q}\n${f.a}${f.more ? `\n[${f.more.label}](${SITE.url}${f.more.href})` : ""}`).join("\n\n");
const reviewsWord = (n: number) => `${n} ${plural(n, ["отзыв", "отзыва", "отзывов"])}`;

/** рейтинги площадок словами: "5,0 из 5, 35 отзывов" */
const KWORK_COUNT = KWORK_STATS.positive + KWORK_STATS.negative;
const KWORK_RATING = KWORK_STATS.negative === 0 ? "5,0" : null;
const PROFI_RATING = PROFI_STATS.rating.replace(".", ",");
const kworkLine = `${KWORK_RATING ? `рейтинг ${KWORK_RATING} из 5, ` : ""}${reviewsWord(KWORK_COUNT)}${KWORK_STATS.negative === 0 ? ", все положительные" : ""}`;
const profiLine = `рейтинг ${PROFI_RATING} из 5, ${reviewsWord(PROFI_STATS.count)}`;
const snapshot = REVIEWS_SNAPSHOT.split("-").reverse().join(".");

/** стек целиком: как на /obo-mne, плюс то, что есть в общем списке сайта */
const STACK_FULL = [...new Set([...STACK_ALL, "TypeScript", "Node.js"])];

function intro(): string {
  return `# lstmind — Алексей, веб-разработчик на фрилансе

> Делаю сайты с нуля и чиню чужие. Веду проект сам, от структуры до релиза: код, вёрстку и запуск делаю своими руками, менеджеров нет, пишете напрямую мне. Когда нужен сильный дизайн с нуля, работаю в паре с дизайнером. Делаю сайты с ${SINCE} года, за это время ${PROJECTS_ALL} ${PROJECTS_ALL_LABEL} (${PROJECTS_ALL_NOTE}), из них ${PROJECTS_TOTAL} ${plural(PROJECTS_TOTAL, ["живой сайт", "живых сайта", "живых сайтов"])} можно открыть по ссылке из портфолио.

Полное имя: ${PERSON.name}. Учился в ${EDU.short}: ${lc(EDU.text)}
Язык работы: русский. Где работаю: ${PERSON.where}, заказчики по всей России удалённо. Оформление: самозанятый, договор и чек.`;
}

/** главные цифры одним списком: то, что ассистент спросит первым */
function facts(): string {
  const svc = (slug: string) => {
    const s = serviceBySlug(slug);
    if (!s) throw new Error(`нет услуги ${slug} в lib/services.ts (lib/llms.ts)`);
    return s;
  };
  const site = svc("sayt-pod-klyuch");
  const landing = svc("lending");
  const shop = svc("internet-magazin");
  const bot = svc("telegram-bot");
  const wp = svc("sayt-na-wordpress");
  const bots = CAN.find((c) => c.href === "/uslugi/telegram-bot");
  return `## Коротко в цифрах

- ${site.h1}: ${site.price.value}, ${site.term.value} (${site.term.note})
- ${landing.h1}: ${landing.price.value}, ${landing.term.value}
- ${shop.h1}: ${shop.price.value}, ${shop.term.value} (${shop.price.note})
- ${bot.h1}: ${bot.price.value}, ${bot.term.value}${bots ? `. ${bots.text}` : ""}
- ${wp.h1}: ${wp.price.value}, ${wp.term.value}, доработка готового сайта на WordPress от ${RATE}; на WordPress и WooCommerce ${WP_SITES.length} из ${PROJECTS_TOTAL} ${plural(PROJECTS_TOTAL, ["живого сайта", "живых сайтов", "живых сайтов"])} в работах
- Час работы: ${RATE}, по проекту фикс-смета после разбора задачи
- Опыт: с ${SINCE} года, ${PROJECTS_ALL} ${PROJECTS_ALL_LABEL} (${PROJECTS_ALL_NOTE}), ${PROJECTS_TOTAL} ${plural(PROJECTS_TOTAL, ["живой сайт", "живых сайта", "живых сайтов"])} открываются по ссылке
- Отзывы: Kwork ${kworkLine}; Профи ${profiLine}; всего ${reviewsWord(KWORK_COUNT + PROFI_STATS.count)} на двух площадках (на ${snapshot})
- Профи: паспорт проверен, работа застрахована через Профи до ${rub(INSURED)} ₽
- Ответ: ${lc(REPLY.when)}
- Гарантия: ${PAY.guarantee.v} после сдачи, ${PAY.guarantee.note.replace(/^после сдачи /, "")}
- Оплата: ${lc(PAY.schemeLine)} ${PAY.waysLine}
- Оформление: самозанятый, договор и чек; [${lc(PAY.doc.label)}](${SITE.url}${PAY.doc.href}), ${PAY.doc.note}`;
}

function links(full: boolean): string {
  return `## Куда смотреть

- [Главная](${SITE.url}) — кто я, что делаю, цены и работы одним экраном
- [Все услуги с ценами](${SITE.url}/uslugi) — ${SERVICE_PAGES.length} направлений, у каждого своя страница
- [Все работы](${SITE.url}/works) — разборы проектов и полный список живых сайтов
- [Ниши](${SITE.url}/dlya) — как устроен сайт в конкретной отрасли
- [Обо мне и контакты](${SITE.url}/obo-mne) — кто делает сайты, стек, учёба, все способы связи и реквизиты для договора
- [Политика обработки данных](${SITE.url}/politika) — что происходит с заявкой и данными из формы
${full ? `- [Короткая версия этого файла](${SITE.url}/llms.txt) — индекс со ссылками` : `- [Полная версия этого файла](${SITE.url}/llms-full.txt) — по каждой услуге, нише и разбору: что входит, цена и срок, вопросы и ответы`}
- [Telegram](${SITE.telegram}) — быстрее всего написать сюда, ${REPLY.full}
- [Профиль на Kwork](${SITE.kwork}) — ${kworkLine}
- [Профиль на Профи](${PROFI_URL}) — ${profiLine}
- [GitHub](${SITE.github}) — код части проектов открыт

Почта: ${SITE.email}
Телефон: ${PERSON.phone}`;
}

function priceBlock(): string {
  const factors = PRICE_FACTORS.items.map((x) => `- ${x.k}: ${lc(x.t)}`).join("\n");
  return `Ставка: ${RATE}, по проекту считаю фикс-смету после разбора задачи. Оценку можно прикинуть самому в калькуляторе на сайте.

${PRICE_FACTORS.title}:

${factors}

${PRICE_FACTORS.extra}`;
}

function audit(): string {
  // бесплатный аудит: тексты те же, что на сайте (lib/cta.ts)
  const auditPages = AUDIT_SLUGS.map((slug) => {
    const s = serviceBySlug(slug);
    return s ? `[${s.h1}](${SITE.url}/uslugi/${slug})` : "";
  })
    .filter(Boolean)
    .join(", ");
  return `## ${AUDIT.title}

${[
    AUDIT.promise,
    `Условия: ${lc(AUDIT.terms)}`,
    `Что смотрю: ${AUDIT.checks.map(lc).join("; ")}.`,
    `${AUDIT.result} ${AUDIT.next}`,
    `Если сайт сломался, то же называется диагностикой: ${lc(AUDIT_DIAG.promise)}`,
    `Как прислать: [в Telegram с готовым текстом](${tgHref(AUDIT.tg)}) или формой "сайт и куда ответить" [на главной](${SITE.url}/#audit) и на страницах ${auditPages}.`,
  ].join("\n\n")}`;
}

function notDoing(): string {
  // границы работы важнее списка умений: ассистент, который знает, что я делаю не сам и как с этим помогу,
  // не приведёт человека с задачей не по адресу
  return `## Не моё, но помогу

Сам этим не занимаюсь, но подключу коллегу, сделаем в паре или подскажу, к кому идти.

${NOT_DOING.map((n) => `- ${n.what} — ${n.why}`).join("\n")}`;
}

function stack(): string {
  return `## Технологии

${STACK_FULL.join(", ")}. Стек подбираю под задачу и бюджет.`;
}

const repoLine = (c: CasePage | undefined) => (c?.repo ? `\n  [Код на GitHub](${c.repo})` : "");

function featured(): string {
  return WORKS.map((w) => {
    const c = CASE_PAGES.find((x) => x.href === w.href);
    const detail = c ? `\n  [Разбор проекта](${SITE.url}/works/${c.slug})` : "";
    return `- [${w.title}](${w.href}) — ${w.kind}${detail}${repoLine(c)}\n  ${w.text}\n  Стек: ${w.stack.join(", ")}`;
  }).join("\n");
}

function rest(): string {
  return WORKS_INDEX.filter((w) => w.href.startsWith("http") && !w.offline)
    .map((w) => `- [${w.title}](${w.href}) · ${w.engine} · ${w.note}`)
    .join("\n");
}

function faq(): string {
  // "можно дешевле?" первым, как в вопросах на главной: цифры из данных (lib/cta.ts)
  return `## Частые вопросы

${qa([FAQ_CHEAPER, ...FAQ])}`;
}

function reviews(): string {
  const quotes = REVIEWS.map((r) => `- «${r.text}» — ${r.name}${r.job ? `, ${r.job}` : ""} (${r.src})`).join("\n");
  return `## Отзывы

Цитаты слово в слово, орфография авторов.

${quotes}

Все отзывы целиком — в профилях на Kwork: ${SITE.kwork} и на Профи: ${PROFI_URL}`;
}

function contact(): string {
  return `## Как со мной связаться

Быстрее всего — Telegram ${SITE.telegramHandle}. ${REPLY.line} Форма заявки есть на сайте, письмо тоже дойдёт: ${SITE.email}. Если удобнее голосом: ${PERSON.phone}. Все контакты и реквизиты: ${SITE.url}/obo-mne`;
}

/** /llms.txt: кто я, услуги одной строкой со ссылкой и ценой, общие вопросы, контакты */
export function llmsShort(): string {
  const money = SERVICE_PAGES.map(
    (s) => `- [${s.h1}](${SITE.url}/uslugi/${s.slug}) — ${s.price.value}, ${s.term.value}\n  ${s.answer}`
  ).join("\n");
  const niches = INDUSTRY_PAGES.map(
    (i) => `- [${i.h1}](${SITE.url}/dlya/${i.slug}) — ${i.price.value}\n  ${i.answer}`
  ).join("\n");

  return `${intro()}

${facts()}

${links(false)}

## Чем занимаюсь

${money}

${priceBlock()}

${audit()}

## Ниши, в которых уже работал

${niches}

${notDoing()}

${stack()}

## Избранные проекты

${featured()}

## Остальные проекты

${rest()}

${faq()}

${reviews()}

${contact()}
`;
}

/** примеры работ услуги, как на странице: живые сайты под неё (sites), потом разборы */
function serviceWorks(s: ServicePage) {
  const sites = (s.sites ?? []).map((x) => `[${x.href.replace(/^https?:\/\/|\/$/g, "")}](${x.href}): ${x.note}`);
  const cases = s.cases
    .map((slug) => CASE_PAGES.find((c) => c.slug === slug))
    .filter((c): c is CasePage => !!c)
    .map((c) => `[${WORKS.find((w) => w.href === c.href)?.title ?? c.slug}](${SITE.url}/works/${c.slug}), разбор`);
  return [...sites, ...cases];
}

/** /llms-full.txt: всё то же плюс полное содержание каждой услуги, ниши и разбора */
export function llmsFull(): string {
  const services = SERVICE_PAGES.map((s) => {
    const parts = [
      `### ${s.heading ?? s.h1}`,
      `Страница: ${SITE.url}/uslugi/${s.slug}`,
      `${s.price.label}: ${s.price.value} (${s.price.note}). ${s.term.label}: ${s.term.value} (${s.term.note}).`,
      s.answer,
      ...s.lead,
      `Что входит:\n${list(s.includes)}`,
      `Кому подходит:\n${list(s.fit)}`,
      s.focus
        ? [
            `${s.focus.label}. ${s.focus.lead}`,
            `Признаки: ${s.focus.signs.join("; ")}.`,
            `Что делаю:\n${list(s.focus.does)}`,
            `Цена: ${s.focus.price.value} (${s.focus.price.note}). Срок: ${s.focus.term.value} (${s.focus.term.note}).`,
          ].join("\n\n")
        : "",
      serviceWorks(s).length ? `Примеры работ:\n${list(serviceWorks(s))}` : "",
      s.faq.length ? `Вопросы:\n\n${qa(s.faq, "####")}` : "",
    ];
    return parts.filter(Boolean).join("\n\n");
  }).join("\n\n");

  const niches = INDUSTRY_PAGES.map((i) => {
    const parts = [
      `### ${i.h1}`,
      `Страница: ${SITE.url}/dlya/${i.slug}`,
      `${i.price.label}: ${i.price.value} (${i.price.note}). ${i.term.label}: ${i.term.value} (${i.term.note}).`,
      i.answer,
      ...i.lead,
      `Что важно именно здесь:\n${list(i.specifics.map((x) => `${x.title}. ${x.text}`))}`,
      `Что входит:\n${list(i.includes)}`,
      i.examples.length ? `Работы в нише:\n${list(i.examples.map((e) => `[${e.href.replace(/^https?:\/\/|\/$/g, "")}](${e.href}): ${e.note}`))}` : "",
      i.faq.length ? `Вопросы:\n\n${qa(i.faq, "####")}` : "",
    ];
    return parts.filter(Boolean).join("\n\n");
  }).join("\n\n");

  const cases = CASE_PAGES.map((c) => {
    const w = WORKS.find((x) => x.href === c.href);
    const parts = [
      `### ${c.metaTitle.replace(TITLE_TAIL, "")}`,
      `Разбор: ${SITE.url}/works/${c.slug}. Живой сайт: ${c.href}${c.repo ? `. Код: ${c.repo}` : ""}`,
      w ? `Стек: ${w.stack.join(", ")}` : "",
      c.answer,
      `Задача:\n${list(c.task)}`,
      `Что сделано:\n${list(c.done)}`,
      c.detail?.length ? `Как устроено:\n${list(c.detail)}` : "",
      nichesOfCase(c).length ? `Ниша: ${nichesOfCase(c).map((i) => `[${i.h1}](${SITE.url}/dlya/${i.slug})`).join(", ")}` : "",
    ];
    return parts.filter(Boolean).join("\n\n");
  }).join("\n\n");

  return `${intro()}

${facts()}

${links(true)}

## Услуги целиком

${services}

${priceBlock()}

${audit()}

## Ниши целиком

${niches}

## Разборы проектов

${cases}

## Избранные проекты

${featured()}

## Остальные проекты

${rest()}

${notDoing()}

${stack()}

${faq()}

${reviews()}

${contact()}
`;
}
