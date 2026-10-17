/**
 * Подача раздела услуг: крупное слово на каждую услугу, группы прайса, картинки работ.
 * Факты (цены, сроки, тексты, работы) не дублируются: всё берётся из lib/services.ts, lib/cases.ts,
 * lib/content.ts и lib/industries.ts. Здесь только то, как это показать.
 */
import { SERVICE_PAGES, serviceBySlug, type ServicePage } from "@/lib/services";
import { CASE_PAGES } from "@/lib/cases";
import { FIX_SITE, LIVE_SITES, WORKS, hostOf } from "@/lib/content";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { previewOf } from "@/components/v4/dlya/data";

const NB = " ";

/** крупное слово наверху страницы и в строке прайса: одно-два слова, капсом */
const WORDS: Record<string, string> = {
  "sayt-pod-klyuch": "Под ключ",
  "internet-magazin": "Магазин",
  "sayt-na-wordpress": "WordPress",
  "pochinit-sayt": "Чиню чужое",
  "pererabotka-sayta": "Переделка",
  "uskorit-sayt": "Ускоряю",
  "podgotovka-k-reklame": "Под рекламу",
  "verstka-po-figma": "Вёрстка",
  "perenos-sayta": "Переезд",
  "sayt-vizitka": "Визитка",
  lending: "Лендинг",
  "korporativnyy-sayt": "Корпоративный",
  "sayt-katalog": "Каталог",
  "telegram-bot": "Боты",
  "admin-panel-i-crm": "Админка",
  "parsing-i-avtomatizaciya": "Парсеры",
  "tehnicheskoe-seo": "SEO",
  "podderzhka-sayta": "Поддержка",
  integracii: "Интеграции",
  "integraciya-s-1s": "Обмен с 1С",
  "mnogoyazychnyy-sayt": "Языки",
};

export function wordOf(slug: string) {
  const w = WORDS[slug];
  if (!w) throw new Error(`нет крупного слова для услуги ${slug} в components/v4/uslugi/data.ts`);
  return w;
}

/**
 * Длина слова в знаках для подбора кегля: на десктопе слово всегда в одну строку,
 * на телефоне фраза до 10 знаков в одну строку, длиннее переносится по пробелу.
 */
export function wordFit(word: string) {
  const all = word.length;
  const long = Math.max(...word.split(" ").map((w) => w.length));
  return { d: Math.max(all, 5), m: Math.max(all <= 10 ? all : long, 5) };
}

/* ── прайс хаба: три группы ── */

const GROUPS: { title: string; side: string; slugs: string[] }[] = [
  {
    title: "Новый сайт",
    side: "с нуля, на вашем домене",
    slugs: ["sayt-pod-klyuch", "sayt-vizitka", "lending", "korporativnyy-sayt", "sayt-katalog", "internet-magazin", "sayt-na-wordpress", "mnogoyazychnyy-sayt", "verstka-po-figma"],
  },
  {
    title: "Готовый сайт",
    side: "чужой код не пугает",
    slugs: ["pochinit-sayt", "uskorit-sayt", "podgotovka-k-reklame", "tehnicheskoe-seo", "perenos-sayta", "podderzhka-sayta", "pererabotka-sayta"],
  },
  {
    title: "Код под задачу",
    side: "боты, админки, обмен данными",
    slugs: ["telegram-bot", "admin-panel-i-crm", "parsing-i-avtomatizaciya", "integracii", "integraciya-s-1s"],
  },
];

// каждая услуга ровно в одной группе: новая услуга в lib без места здесь не соберётся молча
{
  const seen = GROUPS.flatMap((g) => g.slugs);
  for (const s of SERVICE_PAGES) {
    if (seen.filter((x) => x === s.slug).length !== 1) throw new Error(`услуга ${s.slug} должна быть ровно в одной группе прайса`);
  }
  for (const x of seen) if (!serviceBySlug(x)) throw new Error(`в группах прайса лишняя услуга ${x}`);
}

/** порядок внутри группы задан руками: от общего к частному, а не по цене (иначе вёрстка за 3 000 ₽ за экран встаёт первой) */
export const HUB_GROUPS = GROUPS.map((g) => ({
  ...g,
  services: g.slugs.map((x) => serviceBySlug(x)!),
}));

/* ── цена и срок строкой вывески ── */

/** "от 2 000 ₽/час" → { pre: "от", value: "2 000 ₽", unit: "/час" }; "аудит бесплатно" → { pre: "аудит", value: "бесплатно" } */
export function splitPrice(v: string) {
  const m = v.match(/^(от|аудит)\s+(.+?)(\/час|\/мес| в месяц| за экран)?$/i);
  if (!m) return { pre: "", value: v.replace(/ /g, NB), unit: "" };
  return { pre: m[1], value: m[2].replace(/ /g, NB), unit: (m[3] || "").replace(/ /g, NB) };
}

/**
 * "от 2 недель" → { pre: "от", value: "2 недель" }; "3–10 дней" как есть.
 * Число склеено со словом, предлог со следующим словом, а между словами перенос разрешён: на телефоне колонка
 * рядом с персонажем узкая, и "нескольких часов" одной строкой уходило под рисунок. На десктопе строка и так не переносится (.u-num)
 */
const glue = (s: string) => s.replace(/(\d) /g, `$1${NB}`).replace(/(^|\s)(в|во|с|до|на|по) /gi, `$1$2${NB}`);
export function splitTerm(v: string) {
  const m = v.match(/^(от)\s+(.+)$/i);
  if (!m) return { pre: "", value: glue(v) };
  return { pre: m[1], value: glue(m[2]) };
}

/* ── работы: карточки и экран ноутбука ── */

/**
 * Картинки по адресу сайта. card: мобильный первый экран в /img/v4/<card>-240|400.webp (240x519),
 * tall: длинный десктопный скрин /img/tall/<tall>-400|760.webp, высота при ширине 400.
 */
const SHOTS: Record<string, { card: string; tall: string; tallH: number }> = {
  "drova.lstmind.ru": { card: "drova", tall: "drovyanaya", tallH: 2128 },
  "nega.lstmind.ru": { card: "nega", tall: "nega", tallH: 2128 },
  "stroy.lstmind.ru": { card: "stroy", tall: "stroy", tallH: 2128 },
  "almytech.ru": { card: "almytech", tall: "almytech", tallH: 2128 },
  "chemrar.ru": { card: "chemrar", tall: "chemrar", tallH: 2128 },
  "lavenir-mirror.ru": { card: "lavenir-mirror", tall: "lavenir", tallH: 2128 },
  "skazpokrayu.ru": { card: "skazpokrayu", tall: "skaz", tallH: 2128 },
  "qayna.ru": { card: "qayna", tall: "qayna", tallH: 2023 },
  "hp-vdnh.ru": { card: "hp-vdnh", tall: "hpvdnh", tallH: 1431 },
  "a-interiors.ru": { card: "a-interiors", tall: "ainteriors", tallH: 1057 },
  "wellevent.ru": { card: "prices-wellevent", tall: "wellevent", tallH: 2128 },
};

/** карточка в "Примерах работ": разбор (slug есть, ведёт на /works/<slug>) или живой сайт без разбора (ведёт на сам сайт) */
export type WorkCard = {
  slug?: string;
  title: string;
  kind: string;
  href: string;
  host: string;
  /** превью первого экрана относительно /img/v4/: <card>-240|400.webp */
  card: string;
};

export type CaseCard = {
  slug: string;
  title: string;
  kind: string;
  tag: string;
  href: string;
  host: string;
  card: string;
  tall: string;
  tallH: number;
};

export function caseCards(slugs: string[]): CaseCard[] {
  return slugs.map((slug) => {
    const c = CASE_PAGES.find((x) => x.slug === slug);
    if (!c) throw new Error(`нет кейса ${slug} в lib/cases.ts`);
    const w = WORKS.find((x) => x.href === c.href);
    if (!w) throw new Error(`нет работы ${c.href} в lib/content.ts`);
    const host = hostOf(c.href);
    const shot = SHOTS[host];
    if (!shot) throw new Error(`нет картинок для ${host} в components/v4/uslugi/data.ts`);
    return { slug, title: w.title, kind: w.kind, tag: w.tag, href: c.href, host, ...shot };
  });
}

/**
 * Живые сайты без разбора из поля sites услуги: адрес из списка работ (картинка витрины /img/v4/works/...)
 * или пример "чиню чужое" (FIX_SITE, своя карточка). Подпись своя под услугу. Чужой адрес сборку валит.
 */
export function siteCards(sites: { href: string; note: string }[]): WorkCard[] {
  return sites.map(({ href, note }) => {
    const host = hostOf(href);
    if (host === FIX_SITE.host) return { title: FIX_SITE.title, kind: note, href, host, card: FIX_SITE.img };
    const live = LIVE_SITES.find((x) => x.host === host);
    if (!live) throw new Error(`нет живого сайта ${href} в lib/content.ts (sites услуги)`);
    return { title: live.title, kind: note, href, host, card: previewOf(host).replace(/^\/img\/v4\//, "") };
  });
}

/** "Примеры работ" услуги: сначала живые сайты под неё, потом разборы */
export const worksFor = (s: ServicePage): WorkCard[] => [...siteCards(s.sites ?? []), ...caseCards(s.cases)];

/* ── связи страницы услуги ── */

/** сначала близкие услуги, дальше по кругу от текущей: иначе одни и те же шесть собирают ссылки со всех страниц */
export function othersFor(s: ServicePage) {
  const related = (s.related ?? []).map((x) => serviceBySlug(x)).filter(Boolean) as ServicePage[];
  const pos = SERVICE_PAGES.findIndex((x) => x.slug === s.slug);
  const ring = [...SERVICE_PAGES.slice(pos + 1), ...SERVICE_PAGES.slice(0, pos)];
  return [...related, ...ring.filter((x) => x.slug !== s.slug && !related.some((r) => r.slug === x.slug))].slice(0, 6);
}

/** страница-хаб разводит общий запрос по типам сайтов */
export const hubFor = (s: ServicePage) => (s.hub ?? []).map((x) => serviceBySlug(x)).filter(Boolean) as ServicePage[];

/** ниши, где эту услугу берут чаще всего; хабу все */
export const nichesFor = (s: ServicePage) =>
  s.hub?.length ? INDUSTRY_PAGES : INDUSTRY_PAGES.filter((i) => i.types.includes(s.slug));

/** первая работа услуги: её карточка стоит в строке прайса. null у работ под NDA (поле nda): там карточка NDA */
export const firstCase = (s: ServicePage): WorkCard | null => {
  const w = worksFor(s)[0];
  if (!w && !s.nda) throw new Error(`у услуги ${s.slug} нет ни разбора, ни живого сайта`);
  return w ?? null;
};
