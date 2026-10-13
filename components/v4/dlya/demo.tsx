/**
 * Мини-механики ниш: по одной на страницу ниши, каждая показывает руками один пункт из specifics этой ниши.
 * Разметка и данные здесь (сервер), поведение в demo.run.js (островок). Без скрипта видно финальное состояние
 * или исходный экран, который тоже что-то показывает.
 * Данные: пункт ниши из lib/industries.ts, заказ и статусы Дровяной из lib/cases.ts, кадры с живых сайтов из работ.
 * Запись салона повторяет услуги, длительность и мастеров демо-сайта nega.lstmind.ru (это мой демо-проект).
 */
import type { IndustryPage } from "@/lib/industries";
import { CASE_PAGES } from "@/lib/cases";
import { Out } from "./parts";
import "./demo.css";

type Kind = "file" | "route" | "table" | "measure" | "book" | "chat" | "tile" | "gallery" | "size";

/** какой пункт "Что важно" показывает механика: заголовок дословно из lib/industries.ts */
const DEMOS: Record<string, { k: Kind; spec: string }> = {
  proizvodstvo: { k: "file", spec: "Заявка с файлом" },
  "transportnaya-kompaniya": { k: "route", spec: "Расчёт заявки" },
  "kafe-bar-restoran": { k: "table", spec: "Бронь в один-два тапа" },
  "okna-i-osteklenie": { k: "measure", spec: "Замер как главное действие" },
  "salon-krasoty": { k: "book", spec: "Запись в четыре шага" },
  "dostavka-edy": { k: "chat", spec: "Заказ должен доехать до кухни" },
  "remont-i-otdelka": { k: "tile", spec: "Каталог материалов с расчётом" },
  "mebel-na-zakaz": { k: "gallery", spec: "Галерея — главный экран" },
  "magazin-odezhdy": { k: "size", spec: "Размеры и мерки" },
};

/** пункт ниши, который показывает механика; без него страница не соберётся */
export function demoSpec(ind: IndustryPage) {
  const d = DEMOS[ind.slug];
  if (!d) throw new Error(`нет механики для ниши ${ind.slug} в components/v4/dlya/demo.tsx`);
  const i = ind.specifics.findIndex((s) => s.title === d.spec);
  if (i < 0) throw new Error(`в нише ${ind.slug} нет пункта "${d.spec}" (lib/industries.ts)`);
  return { ...d, i, title: ind.specifics[i].title };
}

const Btn = ({ children, className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" className={`dd-btn ${className}`} {...p}>
    {children}
  </button>
);

const Again = () => (
  <button type="button" className="dd-again" hidden>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" />
    </svg>
    Ещё раз
  </button>
);

/* ── производство: чертёж перетаскивается в форму заявки ── */
function FileDemo() {
  return (
    <div className="dd-file">
      <button type="button" className="dd-sheet" aria-label="Прикрепить чертёж к заявке">
        <svg viewBox="0 0 120 150" aria-hidden="true">
          <rect x=".75" y=".75" width="118.5" height="148.5" rx="6" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 8h104v134H8z" fill="none" stroke="currentColor" strokeOpacity=".35" />
          <path d="M28 40h48l16 16v44H28z" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="52" cy="76" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M52 60v32M36 76h32" stroke="currentColor" strokeOpacity=".4" strokeDasharray="3 3" />
          <path d="M28 110h64M28 106v8M92 106v8M100 40v60M96 40h8M96 100h8" stroke="currentColor" strokeOpacity=".55" />
          <path d="M70 124h42v18H70z" fill="none" stroke="currentColor" strokeOpacity=".55" />
        </svg>
        <span className="dd-fname">чертёж.pdf</span>
      </button>
      <div className="dd-form" aria-label="Форма заявки на расчёт">
        <p className="dd-ft">Заявка на расчёт</p>
        <span className="dd-field">
          <i>Что изготовить</i>По чертежу
        </span>
        <span className="dd-drop">
          <span className="dd-drop-0">Перетащите чертёж сюда</span>
          <span className="dd-drop-1">
            <b>чертёж.pdf</b> прикреплён
          </span>
        </span>
        <Btn className="dd-send" disabled>
          Отправить
        </Btn>
      </div>
      <p className="dd-done" aria-live="polite" />
      <Again />
    </div>
  );
}

/* ── перевозки: груз меняет машину на линии маршрута ── */
const TRUCKS: { id: string; name: string; d: string }[] = [
  // фургон
  { id: "box", name: "Коробки", d: "M4 30V14a4 4 0 0 1 4-4h34v20zM42 16h10l8 8v6H42zM46 18v6h10l-5-6z" },
  // тентованный грузовик
  { id: "pal", name: "Паллеты", d: "M2 30V6h60v24zM62 14h10l8 9v7H62zM65 16v7h11l-5-7z" },
  // фура с холодильной установкой
  { id: "ref", name: "Рефрижератор", d: "M2 30V8h70v22zM72 15h10l8 8v7H72zM75 17v6h11l-5-6zM-4 12h6v12h-6z" },
];
function RouteDemo() {
  return (
    <div className="dd-route">
      <div className="dd-road">
        <span className="dd-pt dd-pt-a">
          <i>Откуда</i>ваш склад
        </span>
        <span className="dd-pt dd-pt-b">
          <i>Куда</i>
          <b className="dd-city">Новосибирск</b>
        </span>
        <span className="dd-line" aria-hidden="true" />
        <span className="dd-truck" aria-hidden="true">
          {TRUCKS.map((t) => (
            <svg key={t.id} data-t={t.id} viewBox="-6 0 98 40" className={t.id === "box" ? "is-on" : undefined}>
              <path d={t.d} fill="currentColor" fillRule="evenodd" />
              <circle cx="16" cy="32" r="5" fill="currentColor" stroke="var(--paper)" strokeWidth="2" />
              <circle cx={t.id === "box" ? 50 : t.id === "pal" ? 70 : 80} cy="32" r="5" fill="currentColor" stroke="var(--paper)" strokeWidth="2" />
            </svg>
          ))}
        </span>
      </div>
      <div className="dd-rows">
        <div className="dd-chips" role="radiogroup" aria-label="Куда везём" data-g="city">
          <span className="dd-chl">Куда</span>
          {["Новосибирск", "Краснодар"].map((c, i) => (
            <button type="button" role="radio" aria-checked={i === 0} className="dd-chip" data-v={c} key={c}>
              {c}
            </button>
          ))}
        </div>
        <div className="dd-chips" role="radiogroup" aria-label="Что везём" data-g="cargo">
          <span className="dd-chl">Груз</span>
          {TRUCKS.map((t, i) => (
            <button type="button" role="radio" aria-checked={i === 0} className="dd-chip" data-v={t.id} key={t.id}>
              {t.name}
            </button>
          ))}
        </div>
      </div>
      <Btn className="dd-send">Отправить заявку</Btn>
      <p className="dd-done" aria-live="polite" />
    </div>
  );
}

/* ── кафе: план зала, стол и время в два тапа ── */
const TABLES = [
  { n: 1, s: 2, x: 14, y: 22 },
  { n: 2, s: 2, x: 14, y: 52 },
  { n: 3, s: 4, x: 40, y: 22 },
  { n: 4, s: 4, x: 40, y: 56 },
  { n: 5, s: 6, x: 70, y: 30 },
  { n: 6, s: 2, x: 70, y: 70 },
  { n: 7, s: 4, x: 14, y: 82 },
];
const TIMES = ["18:00", "19:00", "20:00", "21:00"];
/** заняты: номер стола по времени (просто чтобы было видно, что занятые недоступны) */
const BUSY: Record<string, number[]> = { "18:00": [2, 5], "19:00": [1, 3, 6], "20:00": [4, 5, 7], "21:00": [3] };
function TableDemo() {
  return (
    <div className="dd-table">
      <div className="dd-hall" role="group" aria-label="План зала">
        <span className="dd-bar-c" aria-hidden="true">бар</span>
        <span className="dd-win" aria-hidden="true">окна</span>
        {TABLES.map((t) => (
          <button
            type="button"
            className="dd-tb"
            data-n={t.n}
            key={t.n}
            aria-pressed="false"
            aria-label={`Стол ${t.n}, мест: ${t.s}`}
            style={{ left: `${t.x}%`, top: `${t.y}%`, "--s": t.s } as React.CSSProperties}
          >
            <span className="dd-tb-in">{t.n}</span>
            {Array.from({ length: t.s }, (_, j) => (
              <i key={j} style={{ "--j": j } as React.CSSProperties} />
            ))}
          </button>
        ))}
      </div>
      <div className="dd-chips" role="radiogroup" aria-label="Время, сегодня" data-g="time">
        <span className="dd-chl">Сегодня</span>
        {TIMES.map((t) => (
          <button type="button" role="radio" aria-checked="false" className="dd-chip" data-v={t} data-busy={BUSY[t].join(",")} key={t}>
            {t}
          </button>
        ))}
      </div>
      <p className="dd-done" aria-live="polite">
        Тап по столу, тап по времени
      </p>
      <Again />
    </div>
  );
}

/* ── окна: настоящий длинный экран okonnyiportal.ru едет, кнопка замера стоит внизу ── */
function MeasureDemo() {
  return (
    <div className="dd-measure">
      <div className="dd-phone">
        <div className="dd-scr" tabIndex={0} aria-label="Мобильная версия okonnyiportal.ru, можно листать">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dd-long" alt="" loading="lazy" decoding="async" src="/img/v4/dlya/okon-m-390.webp" width={390} height={3153} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="dd-barimg"
            alt="Закреплённая внизу кнопка: вызов замерщика"
            loading="lazy"
            decoding="async"
            src="/img/v4/dlya/okon-bar-390.webp"
            srcSet="/img/v4/dlya/okon-bar-390.webp 390w, /img/v4/dlya/okon-bar-780.webp 780w"
            sizes="240px"
            width={390}
            height={47}
          />
        </div>
      </div>
      <p className="dd-done">Листаете сайт, а вызов замерщика всё время внизу экрана</p>
      <a className="dd-link" href="https://okonnyiportal.ru/" target="_blank" rel="noopener">
        okonnyiportal.ru
        <Out />
      </a>
    </div>
  );
}

/* ── салон: запись в четыре шага, как на nega.lstmind.ru ── */
const BOOK = {
  services: [
    { v: "Женская стрижка", t: "1 ч 20", m: "Полина" },
    { v: "Окрашивание в один тон", t: "2 ч", m: "Кира" },
    { v: "Маникюр с покрытием", t: "1 ч 40", m: "Айгуль" },
    { v: "Оформление бровей", t: "40 мин", m: "Вера" },
  ],
  days: ["Сегодня", "Завтра", "Послезавтра"],
  times: ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00", "20:30"],
};
function BookDemo() {
  return (
    <div className="dd-book" data-book={JSON.stringify(BOOK)}>
      <ol className="dd-steps" aria-label="Шаги записи">
        {["Услуга", "Мастер", "День", "Время"].map((s, i) => (
          <li key={s} data-i={i}>
            <button type="button" className="dd-step" disabled={i > 0}>
              <i>{i + 1}</i>
              <span className="dd-step-v">{s}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="dd-pane" role="group" aria-label="Выберите услугу">
        {BOOK.services.map((s) => (
          <button type="button" className="dd-opt" key={s.v}>
            {s.v}
            <span>{s.t}</span>
          </button>
        ))}
      </div>
      <p className="dd-done" aria-live="polite" />
      <Again />
    </div>
  );
}

/* ── доставка: заказ словами доходит до кухни и возвращается статусами ── */
function chatData() {
  const c = CASE_PAGES.find((x) => x.slug === "drovyanaya");
  if (!c) throw new Error("нет разбора drovyanaya в lib/cases.ts");
  const phrase = c.answer.match(/Фраза «([^»]+)»/)?.[1];
  const st = c.done.find((d) => /живым статусом/.test(d))?.match(/«([^»]+)»/)?.[1];
  const kitchen = (c.shots ?? []).find((s) => /kitchen/.test(s.src));
  if (!phrase || !st || !kitchen) throw new Error("в разборе drovyanaya поменялись фраза заказа, статусы или кадр кухни");
  const statuses = st.split(/\s+—\s+/).map((x) => x.charAt(0).toUpperCase() + x.slice(1));
  return { phrase: phrase.charAt(0).toUpperCase() + phrase.slice(1), statuses, kitchen };
}
function ChatDemo() {
  const { phrase, statuses, kitchen } = chatData();
  return (
    <div className="dd-chatw" data-phrase={phrase} data-st={statuses.join("|")}>
      <div className="dd-chat">
        <p className="dd-chat-h">
          <b>Дровяная</b>бот заказа
        </p>
        <div className="dd-msgs" aria-live="polite">
          <p className="dd-m dd-m--me dd-m--static">{phrase}</p>
          <div className="dd-m dd-m--bot dd-m--check dd-m--static">
            <b>Черновик заказа</b>
            <span>Пепперони, большая × 2, без лука</span>
            <span>Кола</span>
            <span>Доставка к 19:00, Ленина 5</span>
          </div>
          {statuses.map((s) => (
            <p className="dd-m dd-m--bot dd-m--st dd-m--static" key={s}>
              {s}
            </p>
          ))}
        </div>
        <p className="dd-input" aria-hidden="true">
          <span className="dd-typed" />
          <i className="dd-caret" />
        </p>
      </div>
      <figure className="dd-kitchen">
        <span className="dd-kimg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={kitchen.alt} loading="lazy" decoding="async" src={`${kitchen.src}-564.webp`} width={564} height={353} />
        </span>
        <figcaption>{kitchen.caption}</figcaption>
      </figure>
      <Again />
    </div>
  );
}

/* ── ремонт: тянем угол комнаты, раскладка плитки пересчитывается ── */
function TileDemo() {
  return (
    <div className="dd-tile">
      <div className="dd-plan">
        <div className="dd-floor">
          <span className="dd-cut dd-cut-r" />
          <span className="dd-cut dd-cut-b" />
          <span className="dd-dim dd-dim-w" />
          <span className="dd-dim dd-dim-h" />
          <button type="button" className="dd-handle" aria-label="Размер комнаты: тяните угол или стрелками" />
        </div>
      </div>
      <div className="dd-chips" role="radiogroup" aria-label="Плитка" data-g="tile">
        <span className="dd-chl">Плитка, см</span>
        {["30×30", "30×60", "60×60"].map((t, i) => (
          <button type="button" role="radio" aria-checked={i === 1} className="dd-chip" data-v={t} key={t}>
            {t}
          </button>
        ))}
      </div>
      <dl className="dd-calc" aria-live="polite">
        <div>
          <dt>Площадь</dt>
          <dd data-o="area">8,0 м²</dd>
        </div>
        <div>
          <dt>По площади</dt>
          <dd data-o="naive">45 шт</dd>
        </div>
        <div>
          <dt>По раскладке</dt>
          <dd data-o="real">
            <b>55 шт</b>
          </dd>
        </div>
      </dl>
      <p className="dd-done" data-o="note">
        40 целых и 15 с подрезкой: края комнаты не делятся на плитку ровно
      </p>
    </div>
  );
}

/* ── мебель: галерея проектов с фильтром, кадр раскрывается на всю рамку ── */
const GAL = [
  { n: 1, t: "kitchen", cap: "Кухня, графит и мрамор" },
  { n: 2, t: "case", cap: "Шкаф-пенал под технику" },
  { n: 3, t: "kitchen", cap: "Кухня с барной стойкой" },
  { n: 4, t: "kitchen", cap: "Кухня, серый и бежевый" },
  { n: 5, t: "case", cap: "Навесной шкаф" },
];
function GalleryDemo() {
  return (
    <div className="dd-gal">
      <div className="dd-chips" role="radiogroup" aria-label="Тип проекта" data-g="gal">
        {[
          ["all", "Все"],
          ["kitchen", "Кухни"],
          ["case", "Шкафы"],
        ].map(([v, t], i) => (
          <button type="button" role="radio" aria-checked={i === 0} className="dd-chip" data-v={v} key={v}>
            {t}
          </button>
        ))}
      </div>
      <div className="dd-gw">
      <ul className="dd-grid">
        {GAL.map((g) => (
          <li key={g.n} data-t={g.t}>
            <button type="button" className="dd-th" aria-label={`Открыть: ${g.cap}`} data-cap={g.cap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" loading="lazy" decoding="async" src={`/img/v4/dlya/mebel-${g.n}.webp`} width={480} height={602} />
            </button>
          </li>
        ))}
        <li data-t="more">
          <a className="dd-th dd-th--more" href="https://kompkm.ru/" target="_blank" rel="noopener">
            Все проекты
            <span>
              kompkm.ru
              <Out />
            </span>
          </a>
        </li>
      </ul>
      <div className="dd-big" hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" decoding="async" width={480} height={602} />
        <p className="dd-big-cap" />
        <button type="button" className="dd-big-x" aria-label="Закрыть кадр">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
          </svg>
        </button>
      </div>
      </div>
      <p className="dd-done">Кадры проектов с kompkm.ru, мебельной фабрики из работ</p>
    </div>
  );
}

/* ── одежда: обхват груди подбирает размер, подсказка "маломерит" ── */
/** российский размер одежды это половина обхвата груди в сантиметрах */
const SIZES = [
  ["XS", 42],
  ["S", 44],
  ["M", 46],
  ["L", 48],
  ["XL", 50],
  ["XXL", 52],
] as const;
function SizeDemo() {
  return (
    <div className="dd-size">
      <div className="dd-tee-w" aria-hidden="true">
        <svg className="dd-tee" viewBox="0 0 200 200">
          <path
            d="M70 22c8 10 52 10 60 0l40 16 22 38-26 14-12-18v112H46V72L34 90 8 76l22-38z"
            fill="#fff"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M70 22c6 14 54 14 60 0" fill="none" stroke="currentColor" strokeWidth="2" />
          <path className="dd-girth" d="M48 96h104" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 4" />
          <path className="dd-len" d="M176 26v158" stroke="currentColor" strokeWidth="1.5" strokeOpacity=".45" />
        </svg>
        <span className="dd-tee-tag" />
      </div>
      <label className="dd-range">
        <span>
          Обхват груди
          <output>92 см</output>
        </span>
        <input type="range" min={80} max={106} step={1} defaultValue={92} />
      </label>
      <div className="dd-chips dd-chips--size" role="radiogroup" aria-label="Размер" data-g="size">
        {SIZES.map(([l, r]) => (
          <button type="button" role="radio" aria-checked={r === 46} className="dd-chip" data-v={r} key={l}>
            <b>{r}</b>
            {l}
          </button>
        ))}
      </div>
      <label className="dd-check">
        <input type="checkbox" />
        Модель маломерит
      </label>
      <p className="dd-done" aria-live="polite">
        92 см: размер 46 (M). Российский размер это половина обхвата груди
      </p>
    </div>
  );
}

const BODY: Record<Kind, () => React.ReactNode> = {
  file: FileDemo,
  route: RouteDemo,
  table: TableDemo,
  measure: MeasureDemo,
  book: BookDemo,
  chat: ChatDemo,
  tile: TileDemo,
  gallery: GalleryDemo,
  size: SizeDemo,
};

/** рамка механики в языке карточек карусели: подпись пункта, сцена, мелкая строка источника */
export function NicheDemo({ ind }: { ind: IndustryPage }) {
  const d = demoSpec(ind);
  const B = BODY[d.k];
  return (
    <figure className={`dd dd--${d.k}`} data-k={d.k} aria-labelledby="dd-t">
      <figcaption className="dd-cap">
        <span>Как это выглядит</span>
        <b id="dd-t">{d.title}</b>
      </figcaption>
      <div className="dd-stage">
        <B />
      </div>
    </figure>
  );
}
