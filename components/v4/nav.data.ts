/**
 * Данные меню шапки. Факты (услуги, цены, ниши, работы) не дублируются: группы услуг те же, что в прайсе хаба
 * (components/v4/uslugi/data.ts), ниши и их сайты из components/v4/dlya/data.ts. Здесь только короткие подписи
 * для меню: заголовок страницы услуги ("Перенос сайта и настройка хостинга") в строку меню не влезает.
 */
import { SERVICE_PAGES, serviceBySlug } from "@/lib/services";
import { INDUSTRY_PAGES } from "@/lib/industries";
import { LIVE_SITES, PROJECTS_TOTAL, plural } from "@/lib/content";
import { RATE } from "@/lib/home";
import { HUB_GROUPS, splitPrice } from "./uslugi/data";
import { sitesOf, wordOf } from "./dlya/data";

const NB = " ";

/** короткое имя услуги в меню: два-три слова, понятные без заголовка страницы */
const LABELS: Record<string, string> = {
  "sayt-pod-klyuch": "Сайт под ключ",
  "sayt-vizitka": "Сайт-визитка",
  lending: "Лендинг",
  "korporativnyy-sayt": "Корпоративный сайт",
  "sayt-katalog": "Сайт-каталог",
  "internet-magazin": "Интернет-магазин",
  "mnogoyazychnyy-sayt": "Многоязычный сайт",
  "verstka-po-figma": "Вёрстка по Figma",
  "pochinit-sayt": "Починить сайт",
  "uskorit-sayt": "Ускорить сайт",
  "tehnicheskoe-seo": "Техническое SEO",
  "perenos-sayta": "Перенос и хостинг",
  "podderzhka-sayta": "Поддержка",
  "pererabotka-sayta": "Переделка сайта",
  "telegram-bot": "Телеграм-бот",
  "admin-panel-i-crm": "Админка и CRM",
  "parsing-i-avtomatizaciya": "Парсеры",
  integracii: "Интеграции",
};

/** короткое имя услуги: в меню и крупным словом в превью ссылки */
export const serviceLabel = (slug: string) => LABELS[slug];

// у каждой услуги из lib есть имя в меню: новая услуга без подписи не соберётся молча
for (const s of SERVICE_PAGES) {
  if (!LABELS[s.slug]) throw new Error(`нет имени услуги ${s.slug} для меню в components/v4/nav.data.ts`);
}

const nb = (p: { pre: string; value: string; unit: string }) => ({
  pre: p.pre,
  value: p.value.replace(/ /g, NB),
  unit: p.unit.replace(/ /g, NB),
});

export const NAV_SERVICES = HUB_GROUPS.map((g) => ({
  title: g.title,
  side: g.side,
  items: g.services.map((s) => ({
    href: `/uslugi/${s.slug}`,
    label: LABELS[s.slug],
    price: nb(splitPrice(s.price.value)),
  })),
}));

const live = new Set(LIVE_SITES.map((s) => s.host));

/** карточка у ниши: первый её живой сайт, который ещё не стоит у ниши выше (кафе и доставка еды делят пиццерию) */
const used = new Set<string>();
export const NAV_NICHES = INDUSTRY_PAGES.map((i) => {
  const sites = sitesOf(i).filter((s) => live.has(s.host));
  const n = sites.length;
  const card = sites.find((s) => !used.has(s.host)) ?? sites[0] ?? sitesOf(i)[0];
  used.add(card.host);
  return {
    href: `/dlya/${i.slug}`,
    word: wordOf(i.slug),
    /** имя ниши для пилюли на телефоне: "Кафе и бары" */
    nav: i.nav.charAt(0).toUpperCase() + i.nav.slice(1),
    n,
    sites: `${n}${NB}${plural(n, ["живой сайт", "живых сайта", "живых сайтов"])}`,
    price: i.price.value.replace(/ /g, NB),
    img: card.img,
  };
});

const nNiches = INDUSTRY_PAGES.length;
const nNicheSites = new Set(INDUSTRY_PAGES.flatMap((i) => sitesOf(i).map((s) => s.host)).filter((h) => live.has(h))).size;

const site = serviceBySlug("sayt-pod-klyuch");
if (!site) throw new Error("нет услуги sayt-pod-klyuch в lib/services.ts");

/** крупные слова листа на телефоне и подпись к каждому */
export const NAV_META = {
  services: `${SERVICE_PAGES.length}${NB}${plural(SERVICE_PAGES.length, ["направление", "направления", "направлений"])}`,
  works: `${PROJECTS_TOTAL}${NB}${plural(PROJECTS_TOTAL, ["живой сайт", "живых сайта", "живых сайтов"])}`,
  niches: `${nNiches}${NB}${plural(nNiches, ["ниша", "ниши", "ниш"])}`,
  nicheSites: `${nNicheSites}${NB}${plural(nNicheSites, ["живой сайт", "живых сайта", "живых сайтов"])} в${NB}них`,
  prices: `сайт ${site.price.value.replace(/ /g, NB)}`,
  rate: `час работы ${RATE}`,
  about: `контакты и${NB}реквизиты`,
};
