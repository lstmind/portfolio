// Single source of truth for site content. Edit here to update the site.

export const SITE = {
  name: "lstmind",
  person: "Алексей",
  role: "Веб-разработчик",
  telegram: "https://t.me/lstmind",
  telegramHandle: "@lstmind",
  email: "lstmind@yandex.ru",
  kwork: "https://kwork.ru/user/lstmind",
  // Боевой домен. NEXT_PUBLIC_SITE_URL в Vercel переопределит при необходимости.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lstmind.ru",
  ratePerHour: 1500,
} as const;

export const NAV = [
  { label: "Услуги", href: "#services" },
  { label: "Подход", href: "#process" },
  { label: "Работы", href: "#works" },
  { label: "FAQ", href: "#faq" },
];

export const FACTS = [
  { value: "5+", suffix: "", label: "лет в коммерческом коде" },
  { value: "Под ключ", suffix: "", label: "от лендинга до магазина" },
  { value: "5.0", suffix: "★", label: "высший рейтинг на Kwork" },
  { value: "1500", suffix: "₽", label: "в час · по проекту фикс" },
];

export const MARQUEE = [
  { text: "Сайты под ключ", strong: true },
  { text: "Спасение чужих сайтов", strong: false },
  { text: "Интернет-магазины", strong: true },
  { text: "Ускорение", strong: false },
  { text: "WooCommerce", strong: true },
  { text: "Вёрстка по Figma", strong: false },
  { text: "Миграции", strong: true },
];

export const PAIN = [
  {
    n: "01",
    title: "Грузится вечность",
    text: "5 секунд загрузки — и половина посетителей ушла к конкуренту. Google это видит и опускает сайт в выдаче.",
  },
  {
    n: "02",
    title: "Непонятно, что продаёшь",
    text: "На первом экране каша вместо оффера. Человек не понял за пять секунд — закрыл вкладку и не вернулся.",
  },
  {
    n: "03",
    title: "Собран на шаблоне",
    text: "Тормозит, разъезжается на телефоне, у соседа точно такой же. Шаблон видно сразу — и доверие тает.",
  },
];

export type Service = { icon: string; title: string; text: string; price: string };

export const SERVICES: Service[] = [
  {
    icon: "site",
    title: "Сайт под ключ",
    text: "Не шаблон. Собираю под твою задачу — от структуры до релиза. Дизайн, который продаёт, и код, который не тормозит.",
    price: "от <b>15 000 ₽</b> · под ключ",
  },
  {
    icon: "shop",
    title: "Интернет-магазин",
    text: "WooCommerce под ключ: каталог, фильтры, оплата. Перенесу товары, настрою под рекламу — покупатель доходит до корзины.",
    price: "от <b>35 000 ₽</b>",
  },
  {
    icon: "wrench",
    title: "Спасение сайта",
    text: "Достался кривой сайт? Починю вёрстку, уберу баги, доделаю что бросил прошлый. На копии, с откатом — твой прод цел.",
    price: "От <b>1 500 ₽/час</b>",
  },
  {
    icon: "bolt",
    title: "Ускорение сайта",
    text: "Медленный сайт теряет до половины заявок. Разгоняю до зелёного PageSpeed: картинки, кэш, чистка лишнего. Аудит бесплатно.",
    price: "Аудит <b>бесплатно</b>",
  },
  {
    icon: "figma",
    title: "Вёрстка по Figma",
    text: "Пиксель-в-пиксель из макета. Адаптив, чистый код, кроссбраузер. Без «почти как в дизайне» — точно как в дизайне.",
    price: "От <b>1 500 ₽</b> / экран",
  },
  {
    icon: "migrate",
    title: "Миграции и хостинг",
    text: "Перенос между хостингами и доменами без простоя. SSL, почта, домен — всё настрою, сайт не упадёт ни на минуту.",
    price: "от <b>1 500 ₽</b>",
  },
];

export const PROCESS = [
  { n: "01", title: "Разбор задачи", text: "Созвон на 30 минут: что продаём, кому, какой бюджет и срок. Без этого любой дизайн — пальцем в небо." },
  { n: "02", title: "Смета и сроки", text: "Фикс-цена и дедлайн до старта. Ты знаешь, за что платишь — доп.хотелки обсуждаем заранее, без сюрпризов по деньгам." },
  { n: "03", title: "Дизайн + код", text: "Делаю сам, не передаю по цепочке фрилансеров. Каждый блок — под результат, а не «чтобы было красиво»." },
  { n: "04", title: "Не трогаю твой прод", text: "Работаю на копии с бэкапом. Рабочий сайт не задену, пока новое не готово, не проверено и не одобрено тобой." },
  { n: "05", title: "Запуск + поддержка", text: "Заливаю, проверяю на трёх устройствах, отдаю все доступы. Месяц после релиза правлю мелочи бесплатно." },
];

export const BAND = ["Результат", "Скорость", "Чистый код", "Под ключ"];

export type Work = {
  href: string;
  tag: string;
  title: string;
  kind: string;
  text: string;
  stack: string[];
  img: string;
  /** высокий полностраничный скрин для ховер-проезда (ширина 760) */
  imgTall: string;
  /** реальная высота высокого скрина */
  imgTallH: number;
  alt: string;
};

export const WORKS: Work[] = [
  {
    href: "https://www.skazpokrayu.ru/",
    tag: "LIVE · Магазин",
    title: "Сказ по краю",
    kind: "WooCommerce",
    text: "Интернет-магазин премиальных арт-объектов ручной работы. Каталог с фильтрами, корзина, оформление заказа под ключ.",
    stack: ["WordPress", "WooCommerce", "Каталог + фильтры"],
    img: "/img/skaz.png",
    imgTall: "/img/tall/skaz.jpg",
    imgTallH: 3800,
    alt: "Сказ по краю — интернет-магазин",
  },
  {
    href: "https://tksibstar.com/",
    tag: "LIVE · С нуля",
    title: "СибСтар",
    kind: "Сайт с нуля",
    text: "Сайт транспортной компании с нуля: грузоперевозки по России, расчёт заявки, галерея. Быстрая чистая вёрстка.",
    stack: ["Вёрстка", "Формы заявок", "SEO-база"],
    img: "/img/sibstar.png",
    imgTall: "/img/tall/sibstar.jpg",
    imgTallH: 3800,
    alt: "СибСтар — сайт грузоперевозок",
  },
  {
    href: "https://wellevent.ru/",
    tag: "LIVE · Услуги",
    title: "Well Event",
    kind: "Кейтеринг",
    text: "Сайт кейтеринг-сервиса: услуги, портфолио, расчёт стоимости мероприятия. Адаптив и заявки прямо с первого экрана.",
    stack: ["Лендинг", "Портфолио", "Форма расчёта"],
    img: "/img/wellevent.png",
    imgTall: "/img/tall/wellevent.jpg",
    imgTallH: 3800,
    alt: "Well Event — сайт кейтеринга",
  },
  {
    href: "https://skazpokrayu.online/",
    tag: "LIVE · Бренд",
    title: "Сказ по краю",
    kind: "Webflow",
    text: "Бренд-лендинг авторской керамики на Webflow: редакторская типографика, иллюстрации, плавные анимации. Премиальная подача под русские сказки.",
    stack: ["Webflow", "Брендинг", "Анимации"],
    img: "/img/skaz-online.png",
    imgTall: "/img/tall/skaz-online.jpg",
    imgTallH: 3800,
    alt: "Сказ по краю — бренд-лендинг на Webflow",
  },
  {
    href: "https://wallerox.com/",
    tag: "LIVE · Финтех",
    title: "Wallerox",
    kind: "Платёжный сервис",
    text: "Сайт цифрового кошелька: тёмная тема, крупная типографика, мультиязычность. Продуктовая подача уровня финтех-стартапа.",
    stack: ["WordPress", "Финтех", "EN"],
    img: "/img/tall/wallerox.jpg",
    imgTall: "/img/tall/wallerox.jpg",
    imgTallH: 2690,
    alt: "Wallerox — сайт платёжного сервиса",
  },
  {
    href: "https://lavenir-mirror.ru/",
    tag: "LIVE · Каталог",
    title: "Lavenir Zerkala",
    kind: "Tilda",
    text: "Сайт производителя премиальных интерьерных зеркал: тёмная подача, галерея работ, запись на замер. Собран быстро и под рекламу.",
    stack: ["Tilda", "Каталог работ", "Заявки"],
    img: "/img/tall/lavenir.jpg",
    imgTall: "/img/tall/lavenir.jpg",
    imgTallH: 3800,
    alt: "Lavenir — премиальные зеркала",
  },
  {
    href: "https://a-interiors.ru/",
    tag: "LIVE · Магазин",
    title: "Luxury Design",
    kind: "Мебель люкс",
    text: "Магазин американской мебели люкс-сегмента: каталог по брендам и коллекциям, поиск, корзина. Подача под дорогую аудиторию.",
    stack: ["WordPress", "WooCommerce", "Люкс-сегмент"],
    img: "/img/tall/ainteriors.jpg",
    imgTall: "/img/tall/ainteriors.jpg",
    imgTallH: 1623,
    alt: "Luxury Design — магазин американской мебели",
  },
  {
    href: "https://marvli.com/",
    tag: "LIVE · Сервис",
    title: "Marvli",
    kind: "E-wallet",
    text: "Сайт международного e-wallet сервиса: лендинг продукта, тарифы, интеграция с кабинетом. Чистая сервисная подача, EN.",
    stack: ["WordPress", "Сервис", "EN"],
    img: "/img/tall/marvli.jpg",
    imgTall: "/img/tall/marvli.jpg",
    imgTallH: 3800,
    alt: "Marvli — e-wallet сервис",
  },
];

/* ── Полный индекс работ (живые проекты, сгруппированы по типу) ── */

export type WorkIndexItem = { title: string; href: string; cat: string; stack: string };

export const WORK_CATS = ["Все", "Магазины", "Сайты и лендинги", "Порталы и сервисы"] as const;

export const WORKS_INDEX: WorkIndexItem[] = [
  // магазины
  { title: "GrillMebel — уличная мебель и барбекю", href: "https://grillmebel.ru/", cat: "Магазины", stack: "WordPress · Woo" },
  { title: "QAYNA — дизайнерская одежда", href: "https://qayna.ru/", cat: "Магазины", stack: "WordPress · Woo" },
  { title: "SWG — светодиодное освещение", href: "https://swgshop.ru/", cat: "Магазины", stack: "WordPress · Woo" },
  { title: "ТехноКварц — кварцевый агломерат", href: "https://tehnokvarc.ru/", cat: "Магазины", stack: "WordPress · Woo" },
  { title: "АртХаус — стройматериалы", href: "https://arthouse24.ru/", cat: "Магазины", stack: "WordPress · Woo" },
  { title: "FitPit — спортивное питание (KZ)", href: "https://fitpit.kz/", cat: "Магазины", stack: "WordPress · Woo" },
  { title: "Modelium — 3D-модели для печати", href: "https://modelium.club/", cat: "Магазины", stack: "WordPress · Woo · EN" },
  { title: "КомпКМ — компрессорная техника", href: "https://kompkm.ru/", cat: "Магазины", stack: "Woo · Авито-парсер" },
  { title: "Snowboardel — сноуборды", href: "http://snowboardel.com/", cat: "Магазины", stack: "Woo · Авито-парсер" },
  // сайты и лендинги
  { title: "Сибирь Продукт — смеси для мороженого", href: "https://siberiaproduct.com/", cat: "Сайты и лендинги", stack: "Tilda" },
  { title: "Донбасс Авто — автосалон", href: "https://donbass-auto.ru/", cat: "Сайты и лендинги", stack: "Tilda" },
  { title: "HP VDNH — бар на ВДНХ", href: "https://hp-vdnh.ru/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "Базис ТК — транспортная компания", href: "https://bazis-tk.ru/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "Казаночка — баскетбольный клуб", href: "https://bckazanochka.ru/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "Курт и К — производство упаковки", href: "https://envelopes.ru/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "Sealt Siia — переезды (Эстония)", href: "https://sealtsiia.ee/", cat: "Сайты и лендинги", stack: "WordPress · EN" },
  { title: "Alliance GT — грузоперевозки", href: "https://alliance-gt.ru/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "ЕваТур — туроператор (Грузия)", href: "https://evatour.com.ge/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "ДомУпак — упаковочные материалы", href: "https://domupack.ru/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "Демонтаж Москва — демонтажные работы", href: "https://demontazh-moscow.ru/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "Аренда Такси — таксопарк (KZ)", href: "https://arendataxi.kz/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "Оконный портал — окна и остекление", href: "https://okonnyiportal.ru/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "РязаньОкно — оконная компания", href: "https://ryazanokno.ru/", cat: "Сайты и лендинги", stack: "WordPress" },
  { title: "Storona — вёрстка и сборка", href: "https://storona.yolastudio.ru/", cat: "Сайты и лендинги", stack: "Вёрстка" },
  { title: "Lazerviz — вёрстка и сборка", href: "https://lazerviz.yolastudio.ru/wp/", cat: "Сайты и лендинги", stack: "Вёрстка" },
  { title: "Sever — вёрстка + формы PHP", href: "https://sever.yolastudio.ru/", cat: "Сайты и лендинги", stack: "Вёрстка · PHP" },
  { title: "Yaris — вёрстка + формы PHP", href: "https://yaris.yolastudio.ru/", cat: "Сайты и лендинги", stack: "Вёрстка · PHP" },
  // порталы и сервисы
  { title: "Legio.news — новостной сервис с рейтингом прогнозов", href: "https://legio.news/", cat: "Порталы и сервисы", stack: "WordPress · кастом" },
  { title: "L2-Servera — каталог игровых серверов", href: "https://l2-servera.com/", cat: "Порталы и сервисы", stack: "WordPress" },
  { title: "Binolla Blog — контент-платформа", href: "https://blog.binolla.com/", cat: "Порталы и сервисы", stack: "WordPress · EN" },
];

export const FAQ = [
  {
    q: "Сколько стоит лендинг?",
    a: "Простой лендинг — от 15 000 ₽ за 5–7 дней (3–4 экрана, кастом-дизайн, форма заявок в Telegram). Стандартный, с анимацией и проработкой — 25–50k за 7–14 дней. Точную смету называю после короткого разбора задачи. Мелкие доработки и правки — 1 500 ₽/час.",
  },
  {
    q: "Делаешь мобильную вёрстку?",
    a: "Любой сайт собираю mobile-first — большинство клиентов заходят с телефона. Проверяю на трёх устройствах, тач-цели удобные, ничего не разъезжается. Адаптив входит в цену, а не «за отдельные деньги».",
  },
  {
    q: "Как происходит оплата?",
    a: "По проекту — обычно 50% предоплата, 50% после сдачи; на крупных делим на этапы. По часовым задачам — по факту в конце недели. Работаю как самозанятый, чек дам. Никакой оплаты «вслепую» — сначала смета и понятный объём.",
  },
  {
    q: "Срочные сроки берёшь?",
    a: "Берусь — со срочной наценкой. От работы не отказываюсь: если горит, найду способ успеть — расставлю приоритеты, при необходимости подключу проверенных ребят. Наценку и реальный срок назову сразу, чтобы без сюрпризов.",
  },
  {
    q: "Делаешь ли SEO?",
    a: "Базовое SEO — всегда и по умолчанию: чистый код, скорость, корректные мета-теги, структура, sitemap. Это фундамент, без него продвигаться бесполезно. Полное продвижение (семантика, тексты, ссылки) — отдельная история, подскажу стратегию или возьму отдельно.",
  },
  {
    q: "Можно увидеть код в процессе?",
    a: "Конечно. Показываю промежуточный результат на тестовом домене — тыкаешь руками ещё до релиза. Код чистый, в стиле проекта — другой разработчик потом разберётся без меня и без боли.",
  },
  {
    q: "Поддержка после релиза?",
    a: "Месяц после сдачи правлю мелочи и баги бесплатно. Дальше — по часам или на абонентке, как удобнее. Я не из тех, кто пропадает после оплаты: отвечу и через полгода.",
  },
];
