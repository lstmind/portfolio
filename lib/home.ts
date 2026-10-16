/**
 * Подача главной: какие работы, цены, шаги и вопросы показываем и какими короткими словами.
 * Факты (названия, адреса, цены, ставка, тексты вопросов) не дублируются, а берутся из
 * content.ts, services.ts и industries.ts: поменяли там, поменялось и здесь.
 */
import { FIX_SITE, LIVE_SITES, PROJECTS_ALL, PROJECTS_TOTAL, FAQ, type FaqItem, RATE, SITE_FROM, hostOf, plural, rub } from "./content";
import { serviceBySlug } from "./services";
import { INDUSTRY_PAGES } from "./industries";
import { FAQ_CHEAPER, ONE_PHRASE } from "./cta";

const NB = " ";

/** rub, SITE_FROM и RATE живут в content.ts (их берут и формы, и lib/cta.ts без кругового импорта); здесь те же имена для старых импортов */
export { rub, SITE_FROM, RATE };

const siteByHref = (href: string) => {
  const host = hostOf(href);
  const s = LIVE_SITES.find((x) => x.host === host);
  if (!s) throw new Error(`нет живого сайта ${href} в lib/content.ts`);
  return s;
};

export const liveSitesWord = (n = PROJECTS_TOTAL) => plural(n, ["живой сайт", "живых сайта", "живых сайтов"]);

/* ── герой ── */

/** первое слово заголовка по кругу; второе всегда "сайты" */
export const HERO_WORDS = ["делаю", "чиню", "ускоряю"];
/** подписи у фигуры построчно: слева главное в работе со мной (пишете тому, кто делает, менеджеров нет),
 * справа общий опыт, а не число живых сайтов (оно в блоке работ и на /works) */
export const HERO_SIDES = [["без менеджеров"], [`${PROJECTS_ALL} проектов`, "и доработок"]];

/** карточки на дуге: превью первых экранов в /img/v4/<img>-240|400|blur.webp */
const HERO_RING: { img: string; href: string }[] = [
  { img: "nega", href: "https://nega.lstmind.ru/" },
  { img: "qayna", href: "https://qayna.ru/" },
  { img: "chemrar", href: "https://chemrar.ru/" },
  { img: "drova", href: "https://drova.lstmind.ru/" },
  { img: "a-interiors", href: "https://a-interiors.ru/" },
  { img: "hp-vdnh", href: "https://hp-vdnh.ru/" },
  { img: "skazpokrayu", href: "https://www.skazpokrayu.ru/" },
  { img: "stroy", href: "https://stroy.lstmind.ru/" },
  { img: "devabala", href: "https://devabala.com/" },
  { img: "almytech", href: "https://almytech.ru/" },
  { img: "perlovskiebani", href: "https://perlovskiebani.ru/" },
  { img: "lavenir-mirror", href: "https://lavenir-mirror.ru/" },
  { img: "swgshop", href: "https://swgshop.ru/" },
  { img: "mcdparking", href: "https://mcdparking.com/" },
];
export const HERO_SITES = HERO_RING.map((r) => {
  const s = siteByHref(r.href);
  return { img: r.img, name: s.title, host: s.host, href: r.href };
});

/* ── сайты ── */

type Featured = {
  href: string;
  /** длинный мобильный скрин: /img/v4/<shot>-390|600|780.webp, высота при ширине 390 */
  shot: string;
  shotH: number;
  /** сколько секунд скрин едет вниз на телефоне */
  dur: number;
  /** ниша · движок · чей проект */
  meta: string;
  /** одна строка о главном */
  line: string;
  /** slug разбора: /works/<case> */
  case: string;
  /** что на скрине: "сайта", "магазина", "каталога" */
  what: string;
};
const FEATURED: Featured[] = [
  { href: "https://drova.lstmind.ru/", shot: "work-drova-m", shotH: 5064, dur: 36, meta: "пиццерия · Next.js · свой проект", line: `Заказ пишут словами, чек сразу уходит на${NB}кухню`, case: "drovyanaya", what: "сайта" },
  { href: "https://chemrar.ru/", shot: "work-chemrar-m", shotH: 5064, dur: 36, meta: "фармацевтика · WordPress · заказ", line: "Сайт фармкомпании: исследования, доклиника, производство", case: "chemrar", what: "сайта" },
  { href: "https://nega.lstmind.ru/", shot: "work-nega-m", shotH: 4220, dur: 30, meta: "салон красоты · Next.js · свой проект", line: `Запись онлайн по живому расписанию, Lighthouse${NB}100 на${NB}десктопе`, case: "nega", what: "сайта" },
  { href: "https://qayna.ru/", shot: "work-qayna-m", shotH: 5064, dur: 36, meta: "одежда · WooCommerce · заказ", line: "Магазин бренда: коллекции, избранное, личный кабинет", case: "qayna", what: "магазина" },
  { href: "https://almytech.ru/", shot: "work-almytech-m", shotH: 5064, dur: 36, meta: "электроника · 1С-Битрикс · заказ", line: "Каталог услуг завода и заявка с файлом ТЗ", case: "almytech", what: "сайта" },
  { href: "https://stroy.lstmind.ru/", shot: "work-stroy-m", shotH: 5064, dur: 36, meta: "отделка · Astro, Svelte · свой проект", line: `320 позиций, поиск с опечатками, расчёт плитки по${NB}СП`, case: "vedomost", what: "каталога" },
];
export const WORKS_FEATURED = FEATURED.map((f) => {
  const s = siteByHref(f.href);
  return { ...f, name: s.title, host: s.host };
});
/** остальные живые сайты строкой адресов: в том же порядке, что в content.ts */
export const WORKS_REST = LIVE_SITES.filter((s) => !FEATURED.some((f) => hostOf(f.href) === s.host));

/* ── цены ── */

type PriceRow = {
  word: string;
  slug: string;
  note: string;
  /** карточка живого сайта у строки: превью /img/v4/<img>-240|400.webp */
  img: string;
  site: string;
  /** вторая строка подписи карточки; без неё адрес сайта */
  cap?: string;
};
const PRICE_ROWS: PriceRow[] = [
  { word: "Сайты", slug: "sayt-pod-klyuch", note: "Смета фиксируется после разбора задачи", img: "chemrar", site: "https://chemrar.ru/" },
  { word: "Магазины", slug: "internet-magazin", note: `С корзиной и оплатой от ${rub(100000)}${NB}₽`, img: "qayna", site: "https://qayna.ru/" },
  { word: "Чиню чужое", slug: "pochinit-sayt", note: "Сначала смотрю код и называю часы", img: FIX_SITE.img, site: FIX_SITE.href, cap: FIX_SITE.cap },
  { word: "Ускоряю", slug: "uskorit-sayt", note: `Работы от ${RATE}, объём после аудита`, img: "nega", site: "https://nega.lstmind.ru/", cap: "Lighthouse 100 на десктопе" },
  { word: "Боты", slug: "telegram-bot", note: `С каталогом и оплатой от ${rub(70000)}${NB}₽`, img: "drova", site: "https://drova.lstmind.ru/", cap: "бот понимает заказ словами" },
];

/** "от 2 000 ₽/час" → { pre: "от", value: "2 000 ₽", unit: "/час" }; "аудит бесплатно" → { pre: "аудит", value: "бесплатно" } */
function splitPrice(v: string) {
  const m = v.match(/^(от|аудит)\s+(.+?)(\/час)?$/i);
  if (!m) return { pre: "", value: v.replace(/ /g, NB), unit: "" };
  return { pre: m[1], value: m[2].replace(/ /g, NB), unit: m[3] || "" };
}

export const PRICES = PRICE_ROWS.map((r) => {
  const svc = serviceBySlug(r.slug);
  if (!svc) throw new Error(`нет услуги ${r.slug} в lib/services.ts`);
  // пример "чиню чужое" не из списка живых сайтов: чужой магазин, который я дорабатываю (FIX_SITE в content.ts)
  const s = r.site === FIX_SITE.href ? FIX_SITE : siteByHref(r.site);
  return { ...r, href: `/uslugi/${r.slug}`, price: splitPrice(svc.price.value), name: s.title, cap: r.cap ?? s.host };
});

/* ── как это будет: 4 шага, по позе на шаг ── */

export const PROCESS_STEPS: {
  word: string;
  line: string;
  pose: string;
  alt: string;
  screen?: { href: string; img: string; w: number; h: number };
  /** строка под основной: на шаге разбора "хватит одной фразы и ссылки", снимает страх "а что писать" */
  note?: string;
}[] = [
  {
    word: "Разбор",
    pose: "j4",
    alt: "Алексей говорит по телефону",
    line: `Не${NB}моя задача или не${NB}сходится бюджет, скажу в${NB}первом${NB}же ответе.`,
    note: ONE_PHRASE,
  },
  { word: "Смета", pose: "j5", alt: "Алексей пишет смету на листе", line: `Фикс-цена и${NB}срок до${NB}старта, в${NB}договоре всё, что считается сделанным.` },
  {
    word: "Ссылка",
    pose: "j6",
    alt: "Алексей показывает ноутбук экраном к вам",
    line: `Тестовый адрес с${NB}первого дня, смотрите хоть каждый день. Рабочий сайт не${NB}трогаю.`,
    screen: { href: "https://stroy.lstmind.ru/", img: "process-stroy-320", w: 320, h: 1702 },
  },
  { word: "Ключи", pose: "j7", alt: "Алексей протягивает ключи", line: `Домен, хостинг и${NB}код на${NB}вас. Доступы отдаю сразу, а${NB}не${NB}в${NB}день сдачи.` },
];
/** "₽/час" не рвётся после косой черты (word joiner) */
export const PROCESS_SPEC = { left: ["напрямую", "договор, акт, чек"], right: [RATE.replace("/", "/⁠"), `Москва и${NB}вся Россия удалённо`] };

/* ── вопросы финала: пять, которые снимают главные страхи ── */

const FAQ_KEYS = [
  "А если вы возьмёте деньги и пропадёте?",
  "Не окажусь ли я привязан к вам одному?",
  "Разработчик пропал и бросил сайт. Возьмётесь доделать?",
  "Работаете по договору?",
  "Что если сайт сломается после сдачи?",
];
// "Можно дешевле?" первым: вопросы стоят сразу под калькулятором, и про цену спрашивают раньше всего. Ответ с цифрами из lib/cta.ts
export const FAQ_HOME: FaqItem[] = [
  FAQ_CHEAPER,
  ...FAQ_KEYS.map((q) => {
    const f = FAQ.find((x) => x.q === q);
    if (!f) throw new Error(`нет вопроса "${q}" в lib/content.ts`);
    return f;
  }),
];

/* ── подвал ── */

export const FOOTER_NICHES = INDUSTRY_PAGES.map((p) => ({ href: `/dlya/${p.slug}`, label: p.forWhom }));
