/**
 * Сцены персонажа в разделе услуг: кто что держит на какой странице.
 * Кадры лежат в /img/v4/ill/<id>-<высота>.webp на холсте высотой 984 (у предметов obj-move 560),
 * подошвы на 978 из 984 и ось корпуса как у поз pose-j, поэтому сцена встаёт на место позы без правки вёрстки.
 * Ширины холстов и геометрия экранов взяты из манифестов public/img/v4/ill/*.json.
 */
import { CASE_PAGES } from "@/lib/cases";
import { KWORK_REVIEWS, PROFI_REVIEWS, KWORK_URL, PROFI_URL } from "@/lib/reviews";
import { POSES, IMG } from "../Figure";

export const ILL = "/img/v4/ill/";
const HS = [560, 780, 984, 1400];

/** картинка с готовым srcset: и сцены, и позы pose-j */
export type Art = { src: string; srcSet: string; w: number; h: number };

/** сцена из листов: ширина холста при высоте 984 */
export function ill(id: string, w: number, file = id): Art {
  const ws = HS.map((h) => Math.round((w * h) / 984));
  return {
    src: `${ILL}${file}-780.webp`,
    srcSet: HS.map((h, i) => `${ILL}${file}-${h}.webp ${ws[i]}w`).join(", "),
    w,
    h: 984,
  };
}

/** предмет из листа obj-move: холст высотой 560 */
export function obj(id: string, w: number): Art {
  const ws = HS.map((h) => Math.round((w * h) / 560));
  return {
    src: `${ILL}${id}-560.webp`,
    srcSet: HS.map((h, i) => `${ILL}${id}-${h}.webp ${ws[i]}w`).join(", "),
    w,
    h: 560,
  };
}

/** поза pose-j тем же типом */
export function pose(id: string): Art {
  const p = POSES[id];
  return {
    src: `${IMG}pose-${id}-${p.hs[1]}.webp`,
    srcSet: p.hs.map((h, i) => `${IMG}pose-${id}-${h}.webp ${p.ws[i]}w`).join(", "),
    w: p.w,
    h: p.h,
  };
}

export type Scene = Art & { alt: string };

/**
 * Первый экран услуги: человек уже делает эту работу. Нет в списке: типы сайтов, у них поза 6 со скрином сайта,
 * потому что скрин и есть объяснение.
 */
const SCENES: Record<string, Scene> = {
  "pochinit-sayt": { ...ill("s-pochinit", 444), alt: "Алексей с ящиком инструментов и гаечным ключом" },
  "uskorit-sayt": { ...ill("s-uskorit", 400), alt: "Алексей с секундомером в руке" },
  "perenos-sayta": { ...ill("s-perenos", 400), alt: "Алексей несёт коробку переезда, сверху ноутбук" },
  "internet-magazin": { ...ill("s-magazin", 400), alt: "Алексей с корзиной для покупок и посылкой" },
  "telegram-bot": { ...ill("s-bot", 400), alt: "Алексей держит телефон экраном к вам, в нём переписка с ботом" },
  "tehnicheskoe-seo": { ...ill("s-seo", 400), alt: "Алексей смотрит через лупу" },
  "verstka-po-figma": { ...ill("s-verstka", 452), alt: "Алексей сверяет два листа макета" },
  "podderzhka-sayta": { ...ill("s-podderzhka", 404), alt: "Алексей с кружкой и открытым ноутбуком, на связи" },
  "admin-panel-i-crm": { ...ill("s-admin", 400), alt: "Алексей держит планшет, на экране доска заказов" },
  "pererabotka-sayta": { ...ill("s-pererabotka", 412), alt: "Алексей с малярным валиком" },
  "parsing-i-avtomatizaciya": { ...ill("s-parsing", 426), alt: "Из ноутбука в руках Алексея выходит лента с данными" },
  integracii: { ...ill("s-integracii", 402), alt: "Алексей соединяет два кабеля" },
  "sayt-pod-klyuch": { ...pose("j7"), alt: "Алексей протягивает ключи от готового сайта" },
};

export const sceneOf = (slug: string): Scene | undefined => SCENES[slug];

/** экран телефона s-bot и планшета s-admin в долях холста (манифесты svc-shop.json и svc-tools.json) */
export const BOT_HOLE = ill("s-bot", 400, "s-bot-hole");
export const BOT_SCREEN = { l: 11.625, t: 14.8, w: 9.025, h: 7.93 };
/** планшет: экран 88..286 x 256..355, пальцы на нижних углах, поэтому доска внутри полей 98..274 */
export const ADMIN_SCREEN = { l: 24.5, t: 26.1, w: 44, h: 9.9 };

/** сцена в строке прайс-вывески: у типов сайтов поза 6 с ноутбуком */
export const signArt = (slug: string): Art => SCENES[slug] ?? pose("j6");

/* ── ниши: поясной кроп сцены вместе с предметом ── */

type NicheArt = Art & { l: number; r: number; top: number; cut: number };
const NICHES: Record<string, NicheArt> = {
  proizvodstvo: { ...ill("n-proizvodstvo", 400), l: 23, r: 351, top: 15, cut: 450 },
  "transportnaya-kompaniya": { ...ill("n-transport", 436), l: 6, r: 383, top: 16, cut: 420 },
  "kafe-bar-restoran": { ...ill("n-kafe", 496), l: 6, r: 489, top: 9, cut: 450 },
  "okna-i-osteklenie": { ...ill("n-okna", 490), l: 6, r: 430, top: 14, cut: 560 },
  "salon-krasoty": { ...ill("n-salon", 438), l: 6, r: 430, top: 9, cut: 450 },
  "dostavka-edy": { ...ill("n-dostavka", 488), l: 7, r: 438, top: 9, cut: 450 },
  "remont-i-otdelka": { ...ill("n-remont", 458), l: 6, r: 450, top: 18, cut: 450 },
  "mebel-na-zakaz": { ...ill("n-mebel", 590), l: 7, r: 534, top: 17, cut: 700 },
  "magazin-odezhdy": { ...ill("n-odezhda", 572), l: 6, r: 521, top: 13, cut: 470 },
};

/**
 * Кроп в квадратную рамку: по ширине силуэта с предметом, сверху от макушки.
 * Отдаются проценты для img внутри рамки с overflow:hidden.
 */
export function nicheCrop(slug: string) {
  const n = NICHES[slug];
  if (!n) throw new Error(`нет сцены для ниши ${slug} в components/v4/uslugi/scenes.ts`);
  const top = Math.max(0, n.top - 8);
  const cw = Math.max(n.r - n.l + 16, n.cut - top);
  const cx = (n.l + n.r) / 2;
  const left = Math.min(Math.max(0, cx - cw / 2), Math.max(0, n.w - cw));
  return {
    art: n as Art,
    style: {
      width: `${((n.w / cw) * 100).toFixed(2)}%`,
      left: `${((-left / cw) * 100).toFixed(2)}%`,
      top: `${((-top / cw) * 100).toFixed(2)}%`,
    },
  };
}

/* ── отзыв на странице услуги: по тому, что клиент заказывал на площадке ── */

export type PickedReview = { text: string; author: string; what: string; src: "Kwork" | "Профи"; url: string };

/** автор и кусок текста, по которому отзыв находится однозначно; услуга площадки должна совпасть с where */
const PICK: Record<string, { src: "kwork" | "profi"; author: string; where: RegExp; has: string }> = {
  "pochinit-sayt": { src: "kwork", author: "AlexandrIY", where: /доработка wordpress/i, has: "не справился" },
  "podderzhka-sayta": { src: "kwork", author: "managermoon", where: /доработка сайта на wordpress/i, has: "второй раз" },
  "pererabotka-sayta": { src: "kwork", author: "Miriade", where: /правка, доработка/i, has: "полезных моментов" },
  "uskorit-sayt": { src: "kwork", author: "ivan250215", where: /доработка сайта на wordpress/i, has: "даже лучше" },
  "tehnicheskoe-seo": { src: "profi", author: "Алена", where: /^SEO$/, has: "вник в суть" },
  "internet-magazin": { src: "profi", author: "Екатерина Суркова", where: /интернет-магазин/i, has: "погружается" },
  "sayt-na-wordpress": { src: "profi", author: "Оксана", where: /вёрстка/i, has: "Вордпрессе" },
  "telegram-bot": { src: "profi", author: "Андрей", where: /ботов telegram/i, has: "быстрей" },
  "verstka-po-figma": { src: "profi", author: "Оксана", where: /вёрстка/i, has: "в точности" },
  "perenos-sayta": { src: "profi", author: "Эдуард", where: /программисты/i, has: "Перенёс" },
  "sayt-pod-klyuch": { src: "profi", author: "Ольга", where: /программисты/i, has: "на связи" },
  "sayt-vizitka": { src: "profi", author: "Сумая", where: /сайт-приглашение/i, has: "качественно" },
  lending: { src: "profi", author: "Анна Морозова", where: /программисты/i, has: "полноценно" },
  "korporativnyy-sayt": { src: "kwork", author: "managermoon", where: /любая правка/i, has: "альтернативные" },
  "sayt-katalog": { src: "kwork", author: "rekilly", where: /доработка сайта на wordpress/i, has: "каталог" },
  "admin-panel-i-crm": { src: "kwork", author: "managermoon", where: /доработка сайта на wordpress/i, has: "Код аккуратный" },
  "parsing-i-avtomatizaciya": { src: "kwork", author: "bolseo", where: /правка, доработка/i, has: "фид" },
  integracii: { src: "kwork", author: "mahan-mm", where: /правка, доработка/i, has: "тех задание" },
  "mnogoyazychnyy-sayt": { src: "kwork", author: "13Mieva", where: /любая правка/i, has: "в третий раз" },
};

/**
 * Короткий отзыв на одну-две фразы: разрез ритма в левой колонке "Подробнее" (на телефоне между подписью и текстом).
 * Не тот же, что в блоке "Отзыв" на этой странице.
 */
const SHORT: Record<string, { src: "kwork" | "profi"; author: string; where: RegExp; has: string }> = {
  "pochinit-sayt": { src: "kwork", author: "Andnov1985", where: /elementor/i, has: "Выручил" },
  "uskorit-sayt": { src: "kwork", author: "info733", where: /opencart/i, has: "Быстро" },
  "perenos-sayta": { src: "kwork", author: "Andrew1423", where: /wordpress/i, has: "справился" },
  "internet-magazin": { src: "profi", author: "Александра", where: /интернет-магазин/i, has: "Прекрасный" },
  "sayt-na-wordpress": { src: "kwork", author: "aleks152", where: /wordpress/i, has: "компетентность" },
  "tehnicheskoe-seo": { src: "kwork", author: "gamesdrom", where: /правка, доработка/i, has: "без доработок" },
  "verstka-po-figma": { src: "kwork", author: "ivan250215", where: /доработка сайта на wordpress/i, has: "четко понял" },
  "podderzhka-sayta": { src: "kwork", author: "13Mieva", where: /elementor/i, has: "В очередной раз" },
  "pererabotka-sayta": { src: "kwork", author: "Kabelgroup", where: /правка, доработка/i, has: "качественно" },
  "parsing-i-avtomatizaciya": { src: "kwork", author: "Andrew1423", where: /wordpress/i, has: "справился" },
  integracii: { src: "kwork", author: "info733", where: /opencart/i, has: "Быстро" },
  "sayt-pod-klyuch": { src: "profi", author: "Сумая", where: /сайт-приглашение/i, has: "качественно" },
  "sayt-vizitka": { src: "profi", author: "Александра", where: /доработка сайта/i, has: "Прекрасный" },
  lending: { src: "kwork", author: "gamesdrom", where: /правка, доработка/i, has: "без доработок" },
  "korporativnyy-sayt": { src: "kwork", author: "ivan250215", where: /доработка сайта на wordpress/i, has: "четко понял" },
  "sayt-katalog": { src: "kwork", author: "Kabelgroup", where: /правка, доработка/i, has: "качественно" },
  "mnogoyazychnyy-sayt": { src: "kwork", author: "Andnov1985", where: /elementor/i, has: "Выручил" },
};

export const shortReviewFor = (slug: string) => pick(SHORT[slug], slug);

export function reviewFor(slug: string): PickedReview | undefined {
  return pick(PICK[slug], slug);
}

function pick(p: { src: "kwork" | "profi"; author: string; where: RegExp; has: string } | undefined, slug: string): PickedReview | undefined {
  if (!p) return undefined;
  const list = p.src === "kwork" ? KWORK_REVIEWS : PROFI_REVIEWS;
  const r = list.find((x) => x.author === p.author && p.where.test(x.service) && x.text.includes(p.has));
  if (!r) throw new Error(`нет отзыва ${p.author} для услуги ${slug} в lib/reviews.ts`);
  return {
    text: r.text,
    author: r.author,
    what: r.service.replace(/•/g, ", "),
    src: p.src === "kwork" ? "Kwork" : "Профи",
    url: p.src === "kwork" ? KWORK_URL : PROFI_URL,
  };
}

/* ── данные демо из разборов: ничего не выдумано, всё вытаскивается из lib/cases.ts ── */

const drova = CASE_PAGES.find((c) => c.slug === "drovyanaya");
if (!drova) throw new Error("нет разбора drovyanaya в lib/cases.ts");

/** фраза заказа словами, как в разборе Дровяной */
export const ORDER_PHRASE = (() => {
  const m = drova.answer.match(/Фраза «([^»]+)»/);
  if (!m) throw new Error("в разборе drovyanaya нет фразы заказа в «…»");
  return m[1];
})();

/** статусы заказа: "принят — готовим — готово — курьер выехал" */
export const ORDER_STATUSES = (() => {
  const line = drova.done.find((x) => x.includes("живым статусом"));
  const m = line?.match(/«([^»]+)»/);
  if (!m) throw new Error("в разборе drovyanaya нет статусов заказа в «…»");
  return m[1].split(/\s+—\s+/);
})();

/** колонки панели кухни: из подписи к кадру kitchen */
export const KITCHEN_COLS = (() => {
  const shot = drova.shots?.find((s) => s.src.endsWith("/kitchen"));
  const cols = shot ? [...shot.alt.matchAll(/«([^»]+)»/g)].map((m) => m[1]) : [];
  if (cols.length < 3) throw new Error("в подписи к кадру kitchen нет колонок в «…»");
  return cols;
})();

/** номера заказов с кадра панели кухни (public/img/case/drovyanaya/kitchen-564.webp) */
export const KITCHEN_ORDERS = ["D-GKBJ", "D-2NA2", "D-49P7"];

/** кадры экранов Дровяной: то, что за паролем */
export const drovaShot = (name: "status" | "admin" | "kitchen") => {
  const s = drova.shots?.find((x) => x.src.endsWith(`/${name}`));
  if (!s) throw new Error(`нет кадра ${name} в разборе drovyanaya`);
  return s;
};
