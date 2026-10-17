/**
 * Подача раздела работ: один список живых сайтов для витрины и разборы для страниц кейсов.
 * Факты (названия, адреса, тип, движок, тексты) берутся из lib/: content.ts, cases.ts, home.ts.
 * Здесь только то, что нужно показу: какая картинка у сайта, к какой группе движков он относится.
 */
import fs from "node:fs";
import path from "node:path";
import { LIVE_SITES, WORKS, WORKS_INDEX, WORK_CATS, hostOf } from "@/lib/content";
import { CASE_PAGES, type CasePage } from "@/lib/cases";
import { HERO_SITES, WORKS_FEATURED } from "@/lib/home";

const NB = " ";

/** превью первого экрана телефона: /img/v4/<имя>-240|400.webp у сайтов из героя, остальные снял для витрины */
const PREVIEW_DIR = "/img/v4/works/";
const fileKey = (host: string) => host.replace(/\./g, "-");

const PUBLIC = path.join(process.cwd(), "public");
function mustExist(src: string) {
  if (!fs.existsSync(path.join(PUBLIC, src))) throw new Error(`нет картинки ${src}: снять превью и положить в public${PREVIEW_DIR}`);
  return src;
}

function previewOf(host: string) {
  const hero = HERO_SITES.find((s) => s.host === host);
  const base = hero ? `/img/v4/${hero.img}` : `${PREVIEW_DIR}${fileKey(host)}`;
  mustExist(`${base}-240.webp`);
  mustExist(`${base}-400.webp`);
  return base;
}

/** движок одной из шести групп: по ним фильтр, чтобы WooCommerce и WordPress не стояли отдельными кнопками */
export const PLATFORMS = ["WordPress", "1С-Битрикс", "Tilda", "MODX", `Next.js, Vue, Astro`, "Без CMS"] as const;
export type Platform = (typeof PLATFORMS)[number];
function platformOf(engine: string): Platform {
  if (/WordPress|WooCommerce/i.test(engine)) return "WordPress";
  if (/Битрикс/i.test(engine)) return "1С-Битрикс";
  if (/Tilda/i.test(engine)) return "Tilda";
  if (/MODX/i.test(engine)) return "MODX";
  if (/Next|React|Nuxt|Vue|Astro|Svelte/i.test(engine)) return `Next.js, Vue, Astro`;
  return "Без CMS";
}

/** типы для фильтра: те же, что в lib, без "Все" */
export const CATS = WORK_CATS.filter((c) => c !== "Все");

export type Site = {
  title: string;
  href: string;
  host: string;
  cat: string;
  engine: string;
  platform: Platform;
  /** что на сайте: строка из индекса или описание избранной работы */
  note: string;
  /** свой демо-проект, а не заказ */
  own: boolean;
  /** slug разбора, если он есть */
  caseSlug?: string;
  /** превью без суффикса размера */
  img: string;
};

const caseOfHost = (host: string) => CASE_PAGES.find((c) => hostOf(c.href) === host);

/** все живые сайты в порядке lib/content.ts: сначала избранные с разборами, потом индекс */
export const SITES: Site[] = LIVE_SITES.map((s) => {
  const w = WORKS.find((x) => hostOf(x.href) === s.host);
  const i = WORKS_INDEX.find((x) => hostOf(x.href) === s.host);
  const cat = w?.cat ?? i?.cat;
  const engine = w?.engine ?? i?.engine;
  if (!cat || !engine) throw new Error(`у сайта ${s.host} нет cat или engine в lib/content.ts`);
  return {
    title: s.title,
    href: s.href,
    host: s.host,
    cat,
    engine,
    platform: platformOf(engine),
    note: w ? w.text : i!.note,
    own: !!w && w.tag.startsWith("DEMO"),
    caseSlug: caseOfHost(s.host)?.slug,
    img: previewOf(s.host),
  };
});

/** короткая подпись типа над карточкой */
export const CAT_SHORT: Record<string, string> = {
  Магазины: "магазин",
  "Сайты и лендинги": "сайт",
  "Порталы и сервисы": "сервис",
  "Функционал и интеграции": "функционал",
};

/* ── разборы ── */

/** длинные скрины мобильной версии, снятые для разборов: высота при ширине 390 */
const TALL_OWN: Record<string, number> = {
  "lavenir-mirror.ru": 5064,
  "skazpokrayu.ru": 5064,
  "hp-vdnh.ru": 5064,
  "wellevent.ru": 5064,
  "a-interiors.ru": 2189,
};

/** длинный скрин телефона для разбора: из секции работ главной или снятый здесь; файлы -390|600|780.webp */
function tallOf(host: string): { base: string; h: number } {
  const f = WORKS_FEATURED.find((x) => x.host === host);
  const t = f ? { base: `/img/v4/${f.shot}`, h: f.shotH } : TALL_OWN[host] ? { base: `${PREVIEW_DIR}${fileKey(host)}-m`, h: TALL_OWN[host] } : null;
  if (!t) throw new Error(`нет длинного скрина для ${host}`);
  [390, 600, 780].forEach((w) => mustExist(`${t.base}-${w}.webp`));
  // верхний кадр ленты (постер): грузится первым, сама лента после загрузки страницы
  [390, 600, 780].forEach((w) => mustExist(`${t.base}-top-${w}.webp`));
  return t;
}

export type CaseView = {
  c: CasePage;
  site: Site;
  /** запись из WORKS: тип, стек, alt */
  kind: string;
  stack: string[];
  alt: string;
  tall: { base: string; h: number };
};

export function caseView(c: CasePage): CaseView | null {
  const host = hostOf(c.href);
  const site = SITES.find((s) => s.host === host);
  const w = WORKS.find((x) => hostOf(x.href) === host);
  if (!site || !w) return null;
  return {
    c,
    site,
    kind: w.kind,
    stack: w.stack,
    alt: w.alt,
    tall: tallOf(host),
  };
}

/** строка над именем: тип · движок · чей проект */
export const metaLine = (kind: string, s: Site) => [kind, s.engine, s.own ? `свой${NB}проект` : "заказ"];

/** разборы по кругу от текущего: следующий и ещё два, чтобы ссылки расходились по всем страницам */
export function nextCases(slug: string, n = 3) {
  const pos = CASE_PAGES.findIndex((x) => x.slug === slug);
  const ring = [...CASE_PAGES.slice(pos + 1), ...CASE_PAGES.slice(0, pos)];
  return ring
    .slice(0, n)
    .map((c) => caseView(c))
    .filter(Boolean) as CaseView[];
}

/* ── сцены персонажа из листа hubs-cases ── */

type IllPose = {
  slug: string;
  canvas: [number, number];
  files: { src: string; w: number; h: number }[];
};
const ILL_HUBS: IllPose[] = JSON.parse(fs.readFileSync(path.join(PUBLIC, "img/v4/ill/hubs-cases.json"), "utf8")).poses;

/** поза сцены: холст и srcset по ширинам файлов; подошвы у всех на 978 из 984, как у pose-j */
export function illPose(slug: "h-papka" | "h-shema" | "h-priglashaet") {
  const p = ILL_HUBS.find((x) => x.slug === slug);
  if (!p) throw new Error(`нет позы ${slug} в img/v4/ill/hubs-cases.json`);
  p.files.forEach((f) => mustExist(f.src));
  return {
    w: p.canvas[0],
    h: p.canvas[1],
    src: p.files[1].src,
    srcSet: p.files.map((f) => `${f.src} ${f.w}w`).join(", "),
  };
}

/* ── пункты "Что сделано" на длинном скрине ── */

/**
 * Где на длинном мобильном скрине (тот же tall, что в карточке разбора) видно пункт "Что сделано".
 * i: номер пункта в c.done, y/h: верх и высота рамки в долях высоты скрина, x/w: по ширине (по умолчанию почти вся).
 * Размечено руками по скринам: только то, что на главной сайта действительно видно. Бот, кухня, админка,
 * сборка и прочее за кадром рамки не получают, их строки остаются обычным текстом.
 */
export type ShotPoint = {
  i: number;
  y: number;
  h: number;
  x?: number;
  w?: number;
  label: string;
};

const POINTS: Record<string, ShotPoint[]> = {
  drovyanaya: [
    { i: 0, y: 0.136, h: 0.032, label: "Заказ словами" },
    { i: 3, y: 0.575, h: 0.14, label: "Меню и размеры" },
    { i: 4, y: 0.315, h: 0.17, label: "Колесо вкусов" },
  ],
  nega: [
    { i: 0, y: 0.179, h: 0.017, label: "Выбрать время" },
    { i: 1, y: 0.165, h: 0.013, label: "Ближайшее окно" },
    { i: 3, y: 0.26, h: 0.1, label: "Направления и цены" },
    { i: 5, y: 0.885, h: 0.06, label: "Крупная типографика" },
  ],
  vedomost: [
    { i: 0, y: 0.285, h: 0.15, label: "Каталог" },
    { i: 1, y: 0.175, h: 0.085, label: "Поиск" },
    { i: 2, y: 0.525, h: 0.135, label: "Расчёт раскладки" },
  ],
  almytech: [
    { i: 0, y: 0.099, h: 0.148, label: "Услуги производства" },
    { i: 1, y: 0.55, h: 0.145, label: "Производство" },
    { i: 3, y: 0.913, h: 0.085, label: "Сертификаты" },
    { i: 4, y: 0.508, h: 0.014, label: "Заявка на расчёт" },
    { i: 5, y: 0, h: 0.085, label: "Тёмная подача" },
  ],
  chemrar: [
    { i: 0, y: 0.468, h: 0.11, label: "Компании группы" },
    { i: 1, y: 0.098, h: 0.12, label: "Этапы разработки" },
    { i: 3, y: 0.335, h: 0.095, label: "Пресс-центр" },
    { i: 4, y: 0.88, h: 0.115, label: "Портфель проектов" },
  ],
  lavenir: [
    { i: 0, y: 0, h: 0.082, label: "Тёмная подача" },
    { i: 1, y: 0.43, h: 0.14, label: "Галерея работ" },
    { i: 3, y: 0.818, h: 0.14, label: "Комплектация" },
    { i: 4, y: 0.092, h: 0.014, label: "Запись на замер" },
  ],
  "skaz-po-krayu": [
    { i: 0, y: 0.086, h: 0.03, label: "Фильтры и сортировка" },
    { i: 2, y: 0.12, h: 0.055, label: "Комплекты" },
  ],
  qayna: [
    { i: 0, y: 0.32, h: 0.135, label: "Каталог по типам" },
    { i: 1, y: 0.505, h: 0.062, label: "Новая коллекция" },
    { i: 4, y: 0.154, h: 0.014, label: "Избранное и кабинет" },
  ],
  "hp-vdnh": [
    { i: 0, y: 0.244, h: 0.13, label: "Галерея" },
    { i: 1, y: 0.5, h: 0.145, label: "Форматы" },
    { i: 2, y: 0.467, h: 0.017, label: "Меню" },
    { i: 3, y: 0.174, h: 0.016, label: "Бронь столика" },
    { i: 4, y: 0.012, h: 0.014, label: "Карта лояльности" },
  ],
  "well-event": [
    { i: 0, y: 0.372, h: 0.1, label: "Разделы" },
    { i: 3, y: 0.312, h: 0.05, label: "Расчёт стоимости" },
    { i: 4, y: 0.002, h: 0.128, label: "Заявка с первого экрана" },
  ],
  "luxury-design": [
    { i: 0, y: 0.155, h: 0.25, label: "Коллекции" },
    { i: 1, y: 0.055, h: 0.085, x: 0.87, w: 0.12, label: "Поиск и избранное" },
    { i: 3, y: 0.036, h: 0.02, x: 0.87, w: 0.12, label: "Вход в кабинет" },
  ],
};

/** точки разбора по порядку пунктов; номер пункта проверяется по c.done, чтобы правка текста в lib не сдвинула рамки молча */
export function shotPoints(c: CasePage): ShotPoint[] {
  const pts = POINTS[c.slug] ?? [];
  pts.forEach((p) => {
    if (!c.done[p.i]) throw new Error(`у разбора ${c.slug} нет пункта ${p.i} для рамки "${p.label}"`);
  });
  return [...pts].sort((a, b) => a.i - b.i);
}
