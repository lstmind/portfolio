/**
 * Факты страницы "Обо мне": реквизиты, учёба, стек, что получается лучше всего.
 * Всё, что уже есть в lib (контакты, рейтинги, живые сайты, ставка), берётся оттуда, здесь только своё.
 */
import { LIVE_SITES, hostOf, plural } from "@/lib/content";
import { OWNER } from "@/lib/legal";

const NB = " ";

/** с какого года делает сайты: стаж считается от него, в 2027 сам станет 6 лет */
export const SINCE = 2021;
export const yearsNow = () => new Date().getFullYear() - SINCE;
export const yearsWord = (n: number) => `${n}${NB}${plural(n, ["год", "года", "лет"])}`;

export const PERSON = {
  /** полностью, как в политике и чеке; ФИО, ИНН и телефон живут в lib/legal.ts (OWNER), здесь только ссылки на них */
  full: OWNER.fullName,
  name: "Алексей Кунцевич",
  given: "Алексей",
  family: "Кунцевич",
  inn: OWNER.inn,
  phone: OWNER.phone,
  tel: OWNER.phoneHref.replace("tel:", ""),
  /** для разметки: международный вид с дефисами */
  phoneLd: OWNER.phoneLd,
  city: "Москва",
  where: "Москва и Чехов",
} as const;

export const EDU = {
  short: "МИЭТ",
  name: 'Национальный исследовательский университет "МИЭТ"',
  url: "https://miet.ru",
  text: "Кафедра инженерной графики и дизайна, информационные системы и технологии, 2020–2024.",
};

/** страховка заказов через Профи (ВСК) */
export const INSURED = 50000;

/** весь стек: как на Профи и на сайте, без обобщений */
export const STACK_ALL = [
  "WordPress",
  "WooCommerce",
  "OpenCart",
  "1С-Битрикс",
  "MODX",
  "Tilda",
  "Laravel",
  "PHP",
  "JavaScript",
  "Next.js",
  "React",
  "Astro",
  "Svelte",
  "Telegram Bot API",
  "MAX Bot API",
  "вёрстка по Figma",
];

/** слова барабана "Пишу на ...": как они звучат после "на" */
export const STACK_DRUM = ["WordPress", "Битриксе", "Laravel", "OpenCart", "MODX", "Next.js", "React"];

/** живой сайт из портфолио по адресу: строка в lib/content.ts пропала, сборка падает, а не показывает пустую карточку */
const site = (href: string) => {
  const s = LIVE_SITES.find((x) => x.host === hostOf(href));
  if (!s) throw new Error(`нет живого сайта ${href} в lib/content.ts (components/v4/about/data.ts)`);
  return s;
};

/**
 * Что получается лучше всего: слово, строка, пример с карточкой живого сайта (те же превью, что в прайсе главной).
 * "Чужое" это Well Event (решение владельца): MODX был до меня, как в прайсе главной.
 */
export const CAN = [
  {
    word: "Магазины",
    href: "/uslugi/internet-magazin",
    text: "С оплатой, доставкой и загрузкой товаров из таблиц или со старого сайта.",
    site: site("https://qayna.ru/"),
    img: "qayna",
    eg: "магазин на WooCommerce",
  },
  {
    word: "Боты",
    href: "/uslugi/telegram-bot",
    text: "Для Telegram, MAX и ВК: заявки, запись, оплата, связь с CRM.",
    site: site("https://drova.lstmind.ru/"),
    img: "drova",
    eg: "бот понимает заказ словами",
  },
  {
    word: "Чужое",
    href: "/uslugi/pochinit-sayt",
    text: "Разбираюсь в коде после других разработчиков: чиню, ускоряю, чищу от вирусов.",
    site: site("https://wellevent.ru/"),
    img: "prices-wellevent",
    eg: "MODX был до меня",
  },
  {
    word: "Тех. SEO",
    href: "/uslugi/tehnicheskoe-seo",
    text: "Индексация, редиректы, дубли, скорость.",
    site: site("https://nega.lstmind.ru/"),
    img: "nega",
    eg: "Lighthouse 100 на десктопе",
  },
];

/**
 * Кадры страницы: холсты и файлы (design-concepts/v4/about/img/sizes.json), лежат в /img/v4/about/.
 * sole: где подошвы (ножки стула) на холсте, чтобы фигура стояла ровно на линейке.
 */
type Frame = { w: number; h: number; sole: number; files: [number, number][] };
export const FRAMES: Record<"desk" | "stack" | "phone", Frame> = {
  desk: { w: 541, h: 837, sole: 831, files: [[476, 308], [663, 429], [837, 541], [1191, 770], [1674, 1082]] },
  stack: { w: 424, h: 984, sole: 978, files: [[560, 241], [780, 336], [984, 424], [1400, 603], [1968, 848]] },
  phone: { w: 400, h: 984, sole: 978, files: [[560, 228], [780, 317], [984, 400], [1400, 569], [1968, 800]] },
};

export const frameSrc = (id: keyof typeof FRAMES, i = 1) => `/img/v4/about/about-${id}-${FRAMES[id].files[i][0]}.webp`;
export const frameSrcSet = (id: keyof typeof FRAMES) =>
  FRAMES[id].files.map(([h, w]) => `/img/v4/about/about-${id}-${h}.webp ${w}w`).join(", ");
