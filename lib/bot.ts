/**
 * Экраны телеграм-бота.
 * Контент берётся из тех же данных, что и сайт: услуги, ниши, работы, кейсы,
 * отзывы, FAQ, процесс и калькулятор. Бот не может разойтись с сайтом —
 * правится один файл. Чистые функции без сети: их гоняет scripts/bot-check.mjs.
 */
import { CALC, FACTS, FAQ, HOURS, MORE_SERVICES, NOT_DOING, PROCESS, RATE, REPLY, REVIEWS, SERVICES, SITE, STACK, STATUS, WORKS } from "./content";
import { PROFI_URL } from "./reviews";
import { CASE_PAGES } from "./cases";
import { AUDIT, auditFor, tgHref, type Audit } from "./cta";
import { INDUSTRY_PAGES } from "./industries";
import { SERVICE_PAGES } from "./services";

export type Btn = { text: string; callback_data?: string; url?: string };
export type Screen = { text: string; rows: Btn[][] };

export const HOME: Btn = { text: "🏠 В меню", callback_data: "menu" };
/** кнопка бесплатного аудита: личка с готовым текстом "Хочу бесплатный экспресс-аудит. Сайт: " (lib/cta.ts) */
const auditBtn = (a: Audit = AUDIT): Btn => ({ text: `🔎 ${a.button}`, url: tgHref(a.tg) });
const DIRECT = SITE.telegram;

/** подпись под фото в телеграме — максимум 1024 символа, держим запас */
const LIMIT = 1000;
/**
 * Обрезка до LIMIT без битой разметки: недописанный тег или сущность в хвосте отрезаем, открытые теги закрываем.
 * Иначе Telegram отвечает "can't parse entities" и экран не приходит вовсе.
 */
const clamp = (s: string) => {
  if (s.length <= LIMIT) return s;
  const cut = s.slice(0, LIMIT - 20).replace(/<[^>]*$/, "").replace(/&[a-z#0-9]*$/i, "").trimEnd() + "…";
  const open: string[] = [];
  for (const m of cut.matchAll(/<(\/?)([a-z]+)\b[^>]*>/gi)) {
    if (m[1]) open.pop();
    else open.push(m[2]);
  }
  return cut + open.reverse().map((t) => `</${t}>`).join("");
};
/** экранируем то, что уедет в parse_mode=HTML, и убираем разметку из данных сайта */
const clean = (s: string) =>
  s
    .replace(/<\/?b>/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const MAIN_SLUGS = SERVICES.map((s) => s.slug).filter(Boolean) as string[];
const EXTRA_SLUGS = SERVICE_PAGES.map((s) => s.slug).filter((slug) => !MAIN_SLUGS.includes(slug));
export const ALL_SERVICE_SLUGS = [...MAIN_SLUGS, ...EXTRA_SLUGS];

const EMOJI: Record<string, string> = {
  "sayt-pod-klyuch": "🚀",
  "internet-magazin": "🛒",
  "sayt-na-wordpress": "🧩",
  "pochinit-sayt": "🛠",
  "uskorit-sayt": "⚡",
  "pererabotka-sayta": "🎨",
  "podgotovka-k-reklame": "📣",
  "verstka-po-figma": "▦",
  "perenos-sayta": "⇄",
  "telegram-bot": "🤖",
  "admin-panel-i-crm": "🗄",
  "tehnicheskoe-seo": "🔎",
  "parsing-i-avtomatizaciya": "🧲",
  integracii: "🔌",
  "integraciya-s-1s": "🔄",
  "podderzhka-sayta": "🧰",
  "mnogoyazychnyy-sayt": "🌍",
  "sayt-vizitka": "📇",
  lending: "🎯",
  "korporativnyy-sayt": "🏢",
  "sayt-katalog": "📚",
};
const emoji = (slug: string) => EMOJI[slug] ?? "•";
const svcBtn = (slug: string): Btn[] => {
  const s = SERVICE_PAGES.find((x) => x.slug === slug);
  return [{ text: `${emoji(slug)} ${s?.h1 ?? slug}`, callback_data: `svc:${slug}` }];
};

// ---------------- главное меню ----------------
export function screenMain(): Screen {
  return {
    text: clamp(
      "👋 <b>Привет! Это бот Алексея</b> — веб-разработчика.\n\n" +
        "Делаю сайты, телеграм-боты и админки: то, что быстро грузится и приносит заявки. Здесь есть услуги с ценами, расчёт стоимости за минуту, живые работы и прямая связь.\n\n" +
        `⭐ <b>${clean(FACTS[0].value)}${clean(FACTS[0].suffix)} ${clean(FACTS[0].label)} · ${clean(FACTS[1].value)} ${clean(FACTS[1].label)} · ${clean(FACTS[2].value)}${clean(FACTS[2].suffix)} на Kwork</b>\n\n` +
        `🟢 ${clean(STATUS)}\n\n` +
        "С чего начнём? 👇",
    ),
    rows: [
      [{ text: "🧭 Подобрать под задачу", callback_data: "need" }],
      [
        { text: "🧮 Рассчитать стоимость", callback_data: "calc" },
        { text: "💰 Все цены", callback_data: "prices" },
      ],
      [
        { text: "💼 Услуги", callback_data: "services" },
        { text: "🏷 Ниши", callback_data: "niches" },
      ],
      [
        { text: "🗂 Работы", callback_data: "works" },
        { text: "🔬 Кейсы", callback_data: "cases" },
        { text: "⭐ Отзывы", callback_data: "rev:0" },
      ],
      [
        { text: "❓ Вопросы", callback_data: "faq" },
        { text: "⚙️ Как работаю", callback_data: "process" },
        { text: "👤 Обо мне", callback_data: "about" },
      ],
      [{ text: "📝 Оставить заявку", callback_data: "lead:other" }],
      [
        { text: "🌐 Сайт", url: SITE.url },
        { text: "✍️ Написать напрямую", url: DIRECT },
      ],
    ],
  };
}

// ---------------- подбор под задачу ----------------
/** входы «по-человечески»: люди приходят с задачей, а не с названием услуги */
const NEEDS: { key: string; title: string; text: string; slugs: string[] }[] = [
  {
    key: "new",
    title: "Нужен сайт с нуля",
    text: "Сайта нет вообще или он настолько старый, что проще собрать заново.",
    slugs: ["sayt-pod-klyuch", "lending", "korporativnyy-sayt", "internet-magazin"],
  },
  {
    key: "fix",
    title: "Сайт есть, но с ним беда",
    text: "Кривая вёрстка, баги, тормоза, брошенный прошлым разработчиком проект.",
    slugs: ["pochinit-sayt", "uskorit-sayt", "podderzhka-sayta", "perenos-sayta"],
  },
  {
    key: "ads",
    title: "Реклама не окупается",
    text: "Клики в Директе идут, а заявок мало, или непонятно, с какой рекламы они приходят. Кампании ведёт директолог, сайт под рекламу готовлю я.",
    slugs: ["podgotovka-k-reklame", "lending", "uskorit-sayt", "integracii"],
  },
  {
    key: "auto",
    title: "Автоматизировать работу",
    text: "Заявки теряются, данные переносят руками, заказы живут в тетради.",
    slugs: ["telegram-bot", "admin-panel-i-crm", "parsing-i-avtomatizaciya", "integracii", "integraciya-s-1s"],
  },
  {
    key: "seo",
    title: "Сайт не видно в поиске",
    text: "Индексация, скорость, разметка — техническая часть, без которой продвигать бесполезно.",
    slugs: ["tehnicheskoe-seo", "uskorit-sayt", "sayt-katalog"],
  },
  {
    key: "design",
    title: "Есть макет или дизайнер",
    text: "Нужны руки, которые аккуратно превратят макет в живой сайт.",
    slugs: ["verstka-po-figma", "sayt-vizitka", "mnogoyazychnyy-sayt"],
  },
];

export function screenNeed(): Screen {
  return {
    text: clamp(
      "🧭 <b>Что у вас за задача?</b>\n\n" +
        "Выберите, что ближе — покажу подходящие услуги с ценами. Если ничего не подходит, жмите «Оставить заявку»: разберёмся словами.",
    ),
    rows: [
      ...NEEDS.map((n) => [{ text: n.title, callback_data: `need:${n.key}` }]),
      [{ text: "📝 Оставить заявку", callback_data: "lead:other" }],
      [HOME],
    ],
  };
}

export function screenNeedPick(key: string): Screen {
  const n = NEEDS.find((x) => x.key === key) ?? NEEDS[0];
  // сайт уже есть: первым шагом бесплатный экспресс-аудит
  const hasSite = n.key === "fix" || n.key === "seo" || n.key === "ads";
  const list = n.slugs
    .map((slug) => {
      const s = SERVICE_PAGES.find((x) => x.slug === slug);
      return s ? `${emoji(slug)} <b>${clean(s.h1)}</b> — ${clean(s.price.value)}\n${clean(s.short)}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
  return {
    text: clamp(`🧭 <b>${clean(n.title)}</b>\n\n${clean(n.text)}\n\n${list}` + (hasSite ? `\n\n🔎 <b>${clean(AUDIT.title)}</b>\n${clean(AUDIT.promise)}` : "")),
    rows: [
      ...(hasSite ? [[auditBtn()]] : []),
      ...n.slugs.map((slug) => svcBtn(slug)),
      [{ text: "⬅️ Другая задача", callback_data: "need" }, HOME],
    ],
  };
}

// ---------------- услуги ----------------
export function screenServices(): Screen {
  return {
    text: clamp("💼 <b>Услуги и цены</b>\n\nВыберите — расскажу, что входит, сколько стоит и сколько займёт. Ни к чему не обязывает 🙂"),
    rows: [
      ...MAIN_SLUGS.map((slug) => svcBtn(slug)),
      [{ text: "➕ Ещё услуги", callback_data: "services2" }],
      [{ text: "💰 Все цены одним списком", callback_data: "prices" }],
      [HOME],
    ],
  };
}

export function screenServicesExtra(): Screen {
  return {
    text: clamp("💼 <b>Ещё услуги</b>\n\nТо, что заказывают реже, но делаю так же:"),
    rows: [...EXTRA_SLUGS.map((slug) => svcBtn(slug)), [{ text: "⬅️ Основные услуги", callback_data: "services" }, HOME]],
  };
}

export function screenService(slug: string): Screen {
  const s = SERVICE_PAGES.find((x) => x.slug === slug) ?? SERVICE_PAGES[0];
  const audit = auditFor(s.slug);
  const list = s.includes.slice(0, 5).map((i) => `• ${clean(i)}`).join("\n");
  const cases = s.cases
    .map((c) => CASE_PAGES.find((x) => x.slug === c))
    .filter(Boolean)
    .slice(0, 2) as (typeof CASE_PAGES)[number][];
  return {
    text: clamp(
      `${emoji(s.slug)} <b>${clean(s.h1)}</b>\n\n${clean(s.answer)}\n\n` +
        `<b>Что входит:</b>\n${list}\n\n` +
        `💰 <b>${clean(s.price.value)}</b>
<i>${clean(s.price.note)}</i>
` +
        `⏱ <b>${clean(s.term.value)}</b>
<i>${clean(s.term.note)}</i>`,
    ),
    rows: [
      [{ text: "📝 Оставить заявку на это", callback_data: `lead:${s.slug}` }],
      ...(audit ? [[auditBtn(audit)]] : []),
      ...(cases.length ? [cases.map((c) => ({ text: `🔬 ${WORKS.find((w) => w.href === c.href)?.title ?? c.slug}`, callback_data: `case:${c.slug}` }))] : []),
      [{ text: "📄 Подробно на сайте ↗", url: `${SITE.url}/uslugi/${s.slug}` }],
      [{ text: "⬅️ К услугам", callback_data: MAIN_SLUGS.includes(s.slug) ? "services" : "services2" }, HOME],
    ],
  };
}

/** прайс одним экраном: частый запрос «скиньте прайс» */
export function screenPrices(): Screen {
  const line = (slug: string) => {
    const s = SERVICE_PAGES.find((x) => x.slug === slug);
    // 20 строк в подпись до 1000 знаков: без тегов у цены и без хвоста "Интеграции: оплата, доставка, CRM"
    return s ? `${emoji(slug)} ${clean(s.h1.split(":")[0])} — ${clean(s.price.value)}` : "";
  };
  const main = MAIN_SLUGS.map(line).filter(Boolean).join("\n");
  const extra = EXTRA_SLUGS.map(line).filter(Boolean).join("\n");
  return {
    text: clamp(
      // ставка в первой строке: внизу её отрезал лимит подписи, когда услуг стало 20
      `💰 <b>Цены на всё сразу</b>\nСтавка <b>${RATE}</b>, проект считаю фикс-сметой\n\n` +
        `${main}\n${extra}`,
    ),
    rows: [
      [{ text: "🧮 Прикинуть по своей задаче", callback_data: "calc" }],
      [{ text: "📝 Оставить заявку", callback_data: "lead:other" }],
      [{ text: "💼 К услугам", callback_data: "services" }, HOME],
    ],
  };
}

// ---------------- ниши ----------------
export function screenNiches(): Screen {
  return {
    text: clamp(
      "🏷 <b>Ниши, в которых уже работал</b>\n\nВ каждой свои обязательные блоки и свой путь до заявки. Выберите — расскажу, как устроен сайт именно там:",
    ),
    rows: [...INDUSTRY_PAGES.map((i) => [{ text: i.nav, callback_data: `ind:${i.slug}` }]), [HOME]],
  };
}

export function screenNiche(slug: string): Screen {
  const i = INDUSTRY_PAGES.find((x) => x.slug === slug) ?? INDUSTRY_PAGES[0];
  const list = i.includes.slice(0, 5).map((x) => `• ${clean(x)}`).join("\n");
  return {
    text: clamp(
      `🏷 <b>${clean(i.h1)}</b>\n\n${clean(i.answer)}\n\n<b>Обычно нужно:</b>\n${list}\n\n💰 <b>${clean(i.price.value)}</b> · ⏱ ${clean(i.term.value)}
<i>${clean(i.price.note)}</i>`,
    ),
    rows: [
      [{ text: "📝 Оставить заявку", callback_data: `lead:ind_${i.slug}` }],
      [{ text: "📄 Подробно на сайте ↗", url: `${SITE.url}/dlya/${i.slug}` }],
      [{ text: "⬅️ К нишам", callback_data: "niches" }, HOME],
    ],
  };
}

// ---------------- работы и кейсы ----------------
const DEMOS = WORKS.filter((w) => w.tag.startsWith("DEMO"));
const LIVE = WORKS.filter((w) => !w.tag.startsWith("DEMO"));
const caseSlug = (href: string) => CASE_PAGES.find((c) => c.href === href)?.slug;

export function screenWorks(): Screen {
  const demos = DEMOS.slice(0, 3).map((w) => `• <b>${clean(w.title)}</b> — ${clean(w.kind).toLowerCase()}`).join("\n");
  const live = LIVE.slice(0, 5).map((w) => `• <b>${clean(w.title)}</b> — ${clean(w.kind).toLowerCase()}`).join("\n");
  return {
    text: clamp(
      "🗂 <b>Работы</b> — живые сайты, а не картинки.\n\n" +
        `<b>Демо-проекты, которые можно потыкать прямо сейчас:</b>\n${demos}\n\n` +
        `<b>Из коммерческих:</b>\n${live}\n\n` +
        "Открыть сайт — кнопкой, разбор проекта — в «Кейсах».",
    ),
    rows: [
      ...DEMOS.slice(0, 3).map((w) => [{ text: `${w.title} ↗`, url: w.href }]),
      [{ text: "🔬 Разборы проектов", callback_data: "cases" }],
      [{ text: "Все работы на сайте ↗", url: `${SITE.url}/works` }],
      [HOME],
    ],
  };
}

export function screenCases(): Screen {
  return {
    text: clamp(
      "🔬 <b>Разборы проектов</b>\n\nЧто за задача была, что сделано и как это устроено внутри. Выберите проект:",
    ),
    rows: [
      ...CASE_PAGES.slice(0, 8).map((c) => {
        const w = WORKS.find((x) => x.href === c.href);
        return [{ text: `${w?.title ?? c.slug} — ${w?.kind ?? ""}`.slice(0, 60), callback_data: `case:${c.slug}` }];
      }),
      [{ text: "Все работы на сайте ↗", url: `${SITE.url}/works` }],
      [HOME],
    ],
  };
}

export function screenCase(slug: string): Screen {
  const c = CASE_PAGES.find((x) => x.slug === slug) ?? CASE_PAGES[0];
  const w = WORKS.find((x) => x.href === c.href);
  const done = c.done.slice(0, 5).map((d) => `• ${clean(d)}`).join("\n");
  return {
    text: clamp(
      `🔬 <b>${clean(w?.title ?? c.slug)}</b>${w ? ` — ${clean(w.kind).toLowerCase()}` : ""}\n\n` +
        `${clean(c.answer)}\n\n<b>Что сделано:</b>\n${done}\n\n` +
        (w ? `🧰 ${clean(w.stack.join(" · "))}` : ""),
    ),
    rows: [
      [
        { text: "Открыть сайт ↗", url: c.href },
        { text: "Разбор целиком ↗", url: `${SITE.url}/works/${c.slug}` },
      ],
      [{ text: "📝 Хочу такой же", callback_data: `lead:case_${c.slug}` }],
      [{ text: "⬅️ К кейсам", callback_data: "cases" }, HOME],
    ],
  };
}

// ---------------- отзывы: по одному, с листалкой ----------------
export function screenReview(i: number, count: number): Screen {
  const idx = ((i % REVIEWS.length) + REVIEWS.length) % REVIEWS.length;
  const r = REVIEWS[idx];
  return {
    text: clamp(
      `⭐ <b>Отзывы клиентов</b>\n<b>5.0</b> на Kwork · ${count} отзывов · без отрицательных\n\n` +
        `«${clean(r.text)}»\n\n— <i>${clean(r.name)}${r.job ? `, ${clean(r.job)}` : ""}</i>\n<i>${clean(r.src)}</i>\n\n` +
        `<i>${idx + 1} из ${REVIEWS.length}</i>`,
    ),
    rows: [
      [
        { text: "◀️", callback_data: `rev:${idx - 1}` },
        { text: `${idx + 1}/${REVIEWS.length}`, callback_data: `rev:${idx}` },
        { text: "▶️", callback_data: `rev:${idx + 1}` },
      ],
      [
        { text: "Все отзывы на Kwork ↗", url: SITE.kwork },
        { text: "На Профи ↗", url: PROFI_URL },
      ],
      [HOME],
    ],
  };
}

// ---------------- вопросы: все, разложены по темам ----------------
const FAQ_GROUPS: { key: string; title: string; match: RegExp }[] = [
  { key: "money", title: "💰 Цены и оплата", match: /стои|цен|оплат|бюджет|дорог|дешев/i },
  { key: "time", title: "⏱ Сроки и работа", match: /срок|быстро|сколько занимает|срочн|этап|правк/i },
  { key: "tech", title: "🧩 Технологии и код", match: /код|cms|wordpress|битрикс|tilda|хостинг|домен|seo|скорост|адаптив|бот|crm|парс/i },
  { key: "trust", title: "🤝 Гарантии и поддержка", match: /гарант|поддержк|договор|самозанят|доступ|исходник|пропад/i },
];

function faqIndexes(key: string): number[] {
  const group = FAQ_GROUPS.find((g) => g.key === key) ?? FAQ_GROUPS[0];
  const taken = new Set<number>();
  FAQ_GROUPS.forEach((g) => {
    if (g.key === group.key) return;
    FAQ.forEach((f, i) => {
      if (g.match.test(f.q) && !group.match.test(f.q)) taken.add(i);
    });
  });
  const list = FAQ.map((f, i) => i).filter((i) => group.match.test(FAQ[i].q) && !taken.has(i));
  return list.length ? list.slice(0, 8) : FAQ.map((_, i) => i).slice(0, 8);
}

export function screenFaqGroups(): Screen {
  return {
    text: clamp(`❓ <b>Частые вопросы</b>\n\nВсего собрано ${FAQ.length} ответов. Выберите тему:`),
    rows: [...FAQ_GROUPS.map((g) => [{ text: g.title, callback_data: `faqg:${g.key}` }]), [HOME]],
  };
}

export function screenFaqList(key: string): Screen {
  const group = FAQ_GROUPS.find((g) => g.key === key) ?? FAQ_GROUPS[0];
  const idx = faqIndexes(group.key);
  return {
    text: clamp(`❓ <b>${clean(group.title)}</b>\n\nВыберите вопрос:`),
    rows: [
      ...idx.map((i) => [{ text: FAQ[i].q.slice(0, 60), callback_data: `faq:${i}` }]),
      [{ text: "⬅️ Темы", callback_data: "faq" }, HOME],
    ],
  };
}

export function screenFaq(i: number): Screen {
  const f = FAQ[i] ?? FAQ[0];
  return {
    text: clamp(`❓ <b>${clean(f.q)}</b>\n\n${clean(f.a)}${f.more ? `\n\n${clean(f.more.label)}: ${SITE.url}${f.more.href}` : ""}`),
    rows: [
      [{ text: "📝 Оставить заявку", callback_data: "lead:other" }],
      [{ text: "⬅️ Вопросы", callback_data: "faq" }, HOME],
    ],
  };
}

// ---------------- как работаю, обо мне ----------------
export function screenProcess(): Screen {
  const steps = PROCESS.map((p) => `<b>${p.n}. ${clean(p.title)}</b>\n${clean(p.text)}`).join("\n\n");
  return {
    text: clamp(`⚙️ <b>Как я работаю</b>\n\n${steps}`),
    rows: [
      [{ text: "📝 Оставить заявку", callback_data: "lead:other" }],
      [{ text: "🤝 Что не моё", callback_data: "nope" }],
      [HOME],
    ],
  };
}

export function screenAbout(): Screen {
  const facts = FACTS.map((f) => `• ${clean(f.value)}${clean(f.suffix)} — ${clean(f.label)}`).join("\n");
  return {
    text: clamp(
      "👤 <b>Алексей, веб-разработчик</b>\n\n" +
        "Веду проект сам, от структуры до релиза: пишете напрямую мне, без менеджеров и агентства. Сильный дизайн с нуля делаю в паре с дизайнером. Москва, вся Россия удалённо. Самозанятый: договор и чек.\n\n" +
        `${facts}\n\n` +
        `🧰 <b>Стек:</b> ${clean(STACK.join(", "))}`,
    ),
    rows: [
      [
        { text: "⚙️ Как работаю", callback_data: "process" },
        { text: "🤝 Что не моё", callback_data: "nope" },
      ],
      [
        { text: "Kwork ↗", url: SITE.kwork },
        { text: "GitHub ↗", url: SITE.github },
      ],
      [{ text: "✍️ Написать напрямую", url: DIRECT }],
      [HOME],
    ],
  };
}

export function screenNotDoing(): Screen {
  // короткие имена и без вводной: семь пунктов целиком влезают в подпись до 1000 знаков, последний не обрезается
  const list = NOT_DOING.map((n) => `• <b>${clean(n.short[0].toUpperCase() + n.short.slice(1))}</b> — ${clean(n.why)}`).join("\n");
  return {
    text: clamp("🤝 <b>Не моё, но помогу</b>\n\n" + list),
    rows: [
      // моя часть такой работы отдельной услугой: "сайт под рекламу подготовлю сам"
      ...NOT_DOING.filter((n) => n.more?.href.startsWith("/uslugi/")).map((n) => svcBtn(n.more!.href.replace("/uslugi/", ""))),
      [{ text: "💼 Что делаю", callback_data: "services" }],
      [{ text: "📝 Оставить заявку", callback_data: "lead:other" }],
      [HOME],
    ],
  };
}

// ---------------- калькулятор: те же цифры, что на сайте ----------------
const typeLabel = (k: string) => CALC.types.find((t) => t.k === k)?.label ?? k;
const scaleLabel = (k: string) => CALC.scales.find((t) => t.k === k)?.label ?? k;
const urgLabel = (k: string) => CALC.urgency.find((t) => t.k === k)?.label ?? k;

export function screenCalc1(): Screen {
  const rows: Btn[][] = [];
  for (let i = 0; i < CALC.types.length; i += 2) {
    rows.push(CALC.types.slice(i, i + 2).map((t) => ({ text: t.label, callback_data: `calc:${t.k}` })));
  }
  return {
    text: clamp("🧮 <b>Калькулятор стоимости</b>\n\nЗа минуту прикину вилку цены и срок. Без обязательств.\n\n<b>1/3 — что нужно?</b>"),
    rows: [...rows, [{ text: "💰 Или сразу все цены", callback_data: "prices" }], [HOME]],
  };
}

export function screenCalc2(type: string): Screen {
  return {
    text: clamp(`🧮 <b>${clean(typeLabel(type))}</b>\n\n<b>2/3 — масштаб?</b>`),
    rows: [
      CALC.scales.map((s) => ({ text: s.label, callback_data: `calc:${type}:${s.k}` })),
      [{ text: "⬅️ Назад", callback_data: "calc" }, HOME],
    ],
  };
}

export function screenCalc3(type: string, scale: string): Screen {
  return {
    text: clamp(`🧮 <b>${clean(typeLabel(type))} · ${clean(scaleLabel(scale))}</b>\n\n<b>3/3 — сроки?</b>`),
    rows: [
      CALC.urgency.map((u) => ({ text: u.label, callback_data: `calc:${type}:${scale}:${u.k}` })),
      [{ text: "⬅️ Назад", callback_data: `calc:${type}` }, HOME],
    ],
  };
}

export function screenCalcResult(type: string, scale: string, urg: string): Screen {
  const idx = scale === "s" ? 0 : scale === "m" ? 1 : 2;
  const [lo, hi] = CALC.prices[type][idx];
  const mult = urg === "u" ? 1.25 : 1;
  const low = Math.round(lo * mult);
  const high = Math.round(hi * mult);
  const term = (urg === "u" ? CALC.termsUrgent : CALC.terms)[type][idx];
  return {
    text: clamp(
      "🧮 <b>Примерный расчёт</b>\n\n" +
        `Тип: <b>${clean(typeLabel(type))}</b>\nМасштаб: ${clean(scaleLabel(scale))}\nСроки: ${clean(urgLabel(urg))}\n\n` +
        `💰 <b>≈ ${low} 000 – ${high} 000 ₽</b>\n⏱ ${clean(term)}\n<i>${clean(CALC.termNote)}</i>\n\n` +
        "<i>Это ориентир. Точную фикс-смету назову после короткого разбора — бесплатно.</i>",
    ),
    rows: [
      [{ text: "📝 Оставить заявку", callback_data: `lead:calc_${type}` }],
      [{ text: "🔄 Пересчитать", callback_data: "calc" }, HOME],
    ],
  };
}

// ---------------- заявка ----------------
/** подпись заявки: что человек смотрел перед тем, как написать */
export function leadSubject(key: string): string {
  if (key.startsWith("calc_")) return `расчёт: ${typeLabel(key.slice(5))}`;
  if (key.startsWith("ind_")) {
    const i = INDUSTRY_PAGES.find((x) => x.slug === key.slice(4));
    return i ? `ниша: ${i.nav}` : "не выбрана";
  }
  if (key.startsWith("case_")) {
    const c = CASE_PAGES.find((x) => x.slug === key.slice(5));
    const w = c && WORKS.find((x) => x.href === c.href);
    return w ? `хочет как ${w.title}` : "не выбрана";
  }
  const s = SERVICE_PAGES.find((x) => x.slug === key);
  return s ? s.h1 : "не выбрана";
}

export function screenLead(key: string): Screen {
  const svc = leadSubject(key);
  return {
    text: clamp(
      "📝 <b>Заявка</b>\n\n" +
        (svc !== "не выбрана" ? `Тема: <b>${clean(svc)}</b>\n\n` : "") +
        "Напишите одним сообщением, что нужно — можно с бюджетом и сроком. Если есть ТЗ или макет, пришлите файлом.\n\n" +
        `Алексей ответит ${REPLY.within}, ${HOURS.full} ⏱`,
    ),
    rows: [
      [{ text: "✍️ Написать напрямую", url: DIRECT }],
      [HOME],
    ],
  };
}

/** текст-приглашение к ответу: тема заявки уезжает сюда и возвращается в reply_to_message */
export function leadPrompt(key: string): string {
  const svc = leadSubject(key);
  const base = "Опишите задачу одним сообщением. Можно с бюджетом и сроком, можно приложить файл.";
  // тема идёт последней строкой: из ответа клиента её достаёт subjectFromPrompt
  return svc === "не выбрана" ? base : `${base}

— тема: ${svc}`;
}

/** вытащить тему из сообщения, на которое ответил клиент */
export function subjectFromPrompt(text: string): string | null {
  const m = /^— тема: (.+)$/m.exec(text.trim());
  return m ? m[1].trim() : null;
}

export function route(data: string): Screen | null {
  if (data === "menu") return screenMain();
  if (data === "need") return screenNeed();
  if (data.startsWith("need:")) return screenNeedPick(data.slice(5));
  if (data === "services") return screenServices();
  if (data === "services2") return screenServicesExtra();
  if (data === "prices") return screenPrices();
  if (data === "niches") return screenNiches();
  if (data === "process") return screenProcess();
  if (data === "about") return screenAbout();
  if (data === "nope") return screenNotDoing();
  if (data === "works") return screenWorks();
  if (data === "cases") return screenCases();
  if (data.startsWith("case:")) return screenCase(data.slice(5));
  if (data === "faq") return screenFaqGroups();
  if (data.startsWith("faqg:")) return screenFaqList(data.slice(5));
  if (data.startsWith("faq:")) return screenFaq(Number(data.slice(4)) || 0);
  if (data.startsWith("svc:")) return screenService(data.slice(4));
  if (data.startsWith("ind:")) return screenNiche(data.slice(4));
  if (data === "calc") return screenCalc1();
  if (data.startsWith("calc:")) {
    const p = data.split(":"); // calc:type[:scale[:urg]]
    if (p.length === 2) return screenCalc2(p[1]);
    if (p.length === 3) return screenCalc3(p[1], p[2]);
    if (p.length === 4) return screenCalcResult(p[1], p[2], p[3]);
  }
  return null;
}

/** команды для меню бота: их ставит scripts/bot-setup.mjs */
export const BOT_COMMANDS = [
  { command: "start", description: "Меню" },
  { command: "need", description: "Подобрать услугу под задачу" },
  { command: "calc", description: "Калькулятор стоимости" },
  { command: "prices", description: "Все цены одним списком" },
  { command: "services", description: "Услуги" },
  { command: "niches", description: "Ниши: как устроен сайт" },
  { command: "works", description: "Работы и демо-проекты" },
  { command: "cases", description: "Разборы проектов" },
  { command: "reviews", description: "Отзывы" },
  { command: "faq", description: "Частые вопросы" },
  { command: "about", description: "Обо мне и стек" },
];

export const MORE_SERVICE_SLUGS = MORE_SERVICES.map((m) => m.slug);
