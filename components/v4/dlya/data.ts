/**
 * Подача раздела ниш: крупное слово на каждую нишу, картинки живых сайтов, связи с услугами и разборами.
 * Факты (тексты, цены, сроки, работы) не дублируются: всё берётся из lib/industries.ts, lib/services.ts,
 * lib/cases.ts, lib/content.ts и lib/home.ts. Здесь только то, как это показать.
 */
import fs from "node:fs";
import path from "node:path";
import { INDUSTRY_PAGES, workByHref, type IndustryPage } from "@/lib/industries";
import { SERVICE_PAGES, serviceBySlug, type ServicePage } from "@/lib/services";
import { CASE_PAGES } from "@/lib/cases";
import { WORKS, hostOf } from "@/lib/content";
import { tgText } from "@/lib/cta";
import { HERO_SITES } from "@/lib/home";

const NB = " ";

/** крупное слово после "сайты для": одно-два слова, капсом */
const WORDS: Record<string, string> = {
  proizvodstvo: "Производства",
  "transportnaya-kompaniya": "Перевозчиков",
  "kafe-bar-restoran": "Кафе и баров",
  "okna-i-osteklenie": "Оконных фирм",
  "salon-krasoty": "Салонов красоты",
  "dostavka-edy": "Доставки еды",
  "remont-i-otdelka": "Ремонта",
  "mebel-na-zakaz": "Мебели на заказ",
  "magazin-odezhdy": "Магазинов одежды",
};

export function wordOf(slug: string) {
  const w = WORDS[slug];
  if (!w) throw new Error(`нет крупного слова для ниши ${slug} в components/v4/dlya/data.ts`);
  return w;
}

// у каждой ниши из lib есть слово: новая ниша без слова не соберётся молча
for (const i of INDUSTRY_PAGES) wordOf(i.slug);

/** слово услуги в строке вывески "какой сайт обычно берут": те же слова, что в разделе услуг */
const SERVICE_WORDS: Record<string, string> = {
  "sayt-vizitka": "Визитка",
  lending: "Лендинг",
  "korporativnyy-sayt": "Корпоративный",
  "sayt-katalog": "Каталог",
  "internet-magazin": "Магазин",
  "sayt-na-wordpress": "WordPress",
  "sayt-pod-klyuch": "Под ключ",
};
export function serviceWord(slug: string) {
  const w = SERVICE_WORDS[slug];
  if (!w) throw new Error(`нет слова для услуги ${slug} в components/v4/dlya/data.ts`);
  return w;
}

/** число знаков для подбора кегля: на десктопе слово в одну строку, на телефоне по самому длинному слову */
export function wordFit(word: string) {
  const long = Math.max(...word.split(" ").map((w) => w.length));
  return { d: Math.max(word.length, 5), m: Math.max(long, 5) };
}

/* ── цена и срок вывеской ── */

/** "от 25 000 ₽" → { pre: "от", value: "25 000 ₽" } */
export function splitPrice(v: string) {
  const m = v.match(/^(от|аудит)\s+(.+?)(\/час|\/мес| за экран)?$/i);
  if (!m) return { pre: "", value: v.replace(/ /g, NB), unit: "" };
  return { pre: m[1], value: m[2].replace(/ /g, NB), unit: (m[3] || "").replace(/ /g, NB) };
}

/** "от 2 недель" → { pre: "от", value: "2 недель" } */
export function splitTerm(v: string) {
  const m = v.match(/^(от)\s+(.+)$/i);
  if (!m) return { pre: "", value: v.replace(/ /g, NB) };
  return { pre: m[1], value: m[2].replace(/ /g, NB) };
}

/* ── картинки живых сайтов ── */

/**
 * Мобильный первый экран сайта 240x519: /img/v4/<имя>-240|400.webp у сайтов из героя главной,
 * у остальных /img/v4/works/<адрес через дефис>-240|400.webp (их сняли для витрины работ).
 * Если картинки нет, страница не соберётся: пустой серой карточки на проде быть не должно.
 */
const PUBLIC = path.join(process.cwd(), "public");
const has = (src: string) => fs.existsSync(path.join(PUBLIC, src));

export function previewOf(host: string) {
  const hero = HERO_SITES.find((s) => s.host === host);
  const bases = [hero && `/img/v4/${hero.img}`, `/img/v4/works/${host.replace(/\./g, "-")}`].filter(Boolean) as string[];
  const base = bases.find((b) => has(`${b}-240.webp`) && has(`${b}-400.webp`));
  if (!base) throw new Error(`нет превью сайта ${host}: ждём /img/v4/works/${host.replace(/\./g, "-")}-240|400.webp`);
  return base;
}

/* ── работы ниши ── */

export type SiteCard = {
  title: string;
  host: string;
  href: string;
  note: string;
  img: string;
  /** slug разбора, если он есть */
  caseSlug?: string;
};

const caseOfHost = (host: string) => CASE_PAGES.find((c) => hostOf(c.href) === host);

/** живые сайты ниши в порядке lib/industries.ts */
export function sitesOf(ind: IndustryPage): SiteCard[] {
  return ind.examples.map((ex) => {
    const host = hostOf(ex.href);
    const w = workByHref(ex.href);
    return { title: w?.title ?? host, host, href: ex.href, note: ex.note, img: previewOf(host), caseSlug: caseOfHost(host)?.slug };
  });
}

/** разборы проектов ниши: название и тип из WORKS */
export function casesOf(ind: IndustryPage) {
  return ind.cases
    .map((slug) => {
      const c = CASE_PAGES.find((x) => x.slug === slug);
      const w = c && WORKS.find((x) => x.href === c.href);
      return c && w ? { slug, title: w.title, kind: w.kind, tag: w.tag } : null;
    })
    .filter(Boolean) as { slug: string; title: string; kind: string; tag: string }[];
}

/** первая работа ниши: её карточка стоит в строке вывески хаба */
export function leadSite(ind: IndustryPage) {
  return sitesOf(ind)[0];
}

/* ── услуги ниши ── */

/** карточка услуги: сайт из первого разбора услуги */
export function serviceSite(s: ServicePage) {
  for (const slug of s.cases) {
    const c = CASE_PAGES.find((x) => x.slug === slug);
    if (!c) continue;
    const host = hostOf(c.href);
    const w = WORKS.find((x) => x.href === c.href);
    return { title: w?.title ?? host, host, img: previewOf(host) };
  }
  throw new Error(`у услуги ${s.slug} нет разбора с картинкой`);
}

export function typesOf(ind: IndustryPage) {
  return ind.types.map((t) => {
    const s = serviceBySlug(t);
    if (!s) throw new Error(`нет услуги ${t} в lib/services.ts (ниша ${ind.slug})`);
    return s;
  });
}

/** если ниши нет в списке: общие типы сайтов, как на старой странице */
export const HUB_FALLBACK = SERVICE_PAGES.filter(
  (s) => s.hub || ["sayt-vizitka", "lending", "internet-magazin"].includes(s.slug),
).slice(0, 4);

/** первое сообщение в Telegram: сразу видно, с какой страницы пришли */
export const tgMsg = (h1: string) => tgText({ kind: "niche", name: h1 });
