/**
 * Механики услуг: по одной на страницу, в левой колонке блока "Что входит" (на телефоне полосой перед списком).
 * Разметка с сервера показывает финальный кадр: без скрипта и при prefers-reduced-motion всё понятно и так.
 * Поведение в demos.run.js. Картинки только настоящие: первые экраны работ услуги и кадры из разборов.
 */
import type { ServicePage } from "@/lib/services";
import { PRICES } from "@/lib/home";
import { PROJECTS_TOTAL, WP_SITES, hostOf, plural } from "@/lib/content";
import { Out } from "./bits";
import type { CaseCard } from "./data";
import { IMG } from "../Figure";
import { ILL, KITCHEN_COLS, KITCHEN_ORDERS, ORDER_PHRASE, ORDER_STATUSES, drovaShot, obj } from "./scenes";
import { ArtImg } from "./Art";
import "./demos.css";

const NB = " ";
type P = { s: ServicePage; cards: CaseCard[] };

/** первый экран работы на десктопе: /img/prev/<slug>-400|.webp, 760x471 */
const Prev = ({ slug, alt = "", sizes = "(max-width: 699px) 92vw, 420px" }: { slug: string; alt?: string; sizes?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    alt={alt}
    loading="lazy"
    decoding="async"
    src={`/img/prev/${slug}-400.webp`}
    srcSet={`/img/prev/${slug}-400.webp 400w, /img/prev/${slug}.webp 760w`}
    sizes={sizes}
    width={760}
    height={471}
  />
);

/** мобильный первый экран из карусели: /img/v4/<card>-240|400.webp */
const Mob = ({ card, sizes = "160px", alt = "" }: { card: string; sizes?: string; alt?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    alt={alt}
    loading="lazy"
    decoding="async"
    src={`${IMG}${card}-240.webp`}
    srcSet={`${IMG}${card}-240.webp 240w, ${IMG}${card}-400.webp 400w`}
    sizes={sizes}
    width={240}
    height={519}
  />
);

const Check = () => (
  <svg className="u-ck" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M3 8.5l3.2 3L13 4.5" />
  </svg>
);

/** рамка механики: карточка как в карусели, подпись и кнопка повтора под ней */
function Frame({
  kind,
  title,
  cap,
  re,
  children,
  className = "",
}: {
  kind: string;
  title: string;
  cap?: React.ReactNode;
  re?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={`u-demo u-demo--${kind} ${className}`} data-demo={kind} aria-label={title}>
      <div className="u-demo-box">{children}</div>
      {(cap || re) && (
        <figcaption className="u-demo-cap">
          {cap && <span className="u-demo-txt">{cap}</span>}
          {re && (
            <button type="button" className="u-demo-re" data-re>
              {re}
            </button>
          )}
        </figcaption>
      )}
    </figure>
  );
}

const SiteLink = ({ c }: { c: CaseCard }) => (
  <a href={c.href} target="_blank" rel="noopener">
    {c.host}
    <Out />
  </a>
);

/* ── чиню чужое: сломанная страница собирается по пунктам ── */
const FIX = [
  { x: "-9%", y: "14%", r: "-3deg" },
  { x: "7%", y: "-22%", r: "2deg" },
  { x: "-4%", y: "38%", r: "1.5deg" },
  { x: "11%", y: "6%", r: "-2.5deg" },
  { x: "-12%", y: "-30%", r: "3deg" },
  { x: "5%", y: "-8%", r: "-1deg" },
];
function Fix({ cards }: P) {
  const c = cards[0];
  return (
    <Frame kind="fix" title={`Сломанная страница ${c.host} собирается обратно`} cap={<>Настоящий сайт из работ: <SiteLink c={c} /></>} re="Сломать и починить">
      <div className="u-fix">
        {FIX.map((f, i) => (
          <span className="u-fix-s" key={i} style={{ "--i": i, "--x": f.x, "--y": f.y, "--r": f.r } as React.CSSProperties}>
            <Prev slug={c.slug} />
          </span>
        ))}
      </div>
    </Frame>
  );
}

/* ── ускоряю: две загрузки рядом, без выдуманных секунд ── */
function Speed() {
  const row = PRICES.find((p) => p.slug === "uskorit-sayt");
  if (!row) throw new Error("нет строки uskorit-sayt в PRICES lib/home.ts");
  const host = hostOf(row.site);
  const scr = (bad: boolean) => (
    <span className={`u-sp-ph ${bad ? "u-sp-bad" : "u-sp-good"}`}>
      <span className="u-sp-scr">
        <i className="u-sp-sk" aria-hidden="true">
          <i />
          <i />
          <i />
        </i>
        {bad && <i className="u-sp-ban" aria-hidden="true" />}
        <Mob card={row.img} sizes="150px" />
      </span>
      <span className="u-sp-t">{bad ? "так бывает" : "так должно быть"}</span>
    </span>
  );
  return (
    <Frame
      kind="speed"
      title="Одна и та же страница: загрузка рывками со скачком вёрстки и ровная загрузка"
      cap={
        <span className="u-sp-lh">
          <svg viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="30" cy="30" r="26" />
            <circle className="u-sp-ring" cx="30" cy="30" r="26" pathLength="100" />
          </svg>
          <b>100</b>
          <span>
            {row.cap.replace(/^Lighthouse 100 /, "Lighthouse ")} ·{" "}
            <a href={row.site} target="_blank" rel="noopener">
              {host}
              <Out />
            </a>
          </span>
        </span>
      }
      re="Обновить обе"
    >
      <div className="u-sp">
        {scr(true)}
        {scr(false)}
      </div>
    </Frame>
  );
}

/* ── техническое SEO: схема выдачи, сниппет поднимается по пунктам ── */
const SERP_STEPS = ["индексация", "скорость", "разметка", "дубли"];
function Serp() {
  return (
    <Frame kind="serp" title="Схема поисковой выдачи: ваш сайт поднимается после каждой правки" cap="Схема, не обещание позиций" re="Сначала">
      <div className="u-serp">
        <p className="u-serp-q" aria-hidden="true">
          <i />
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
        </p>
        <ol className="u-serp-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <li className={`u-sn${i === 4 ? " u-sn--you" : ""}`} key={i} data-base={i} style={{ "--pos": i } as React.CSSProperties}>
              {i === 4 ? (
                <>
                  <b>ваш сайт</b>
                  <span className="u-sn-url">
                    <i />
                    <span className="u-sn-stars" aria-hidden="true">
                      ★★★★★
                    </span>
                  </span>
                  <span className="u-sn-faq">
                    <i>цена</i>
                    <i>сроки</i>
                    <i>адрес</i>
                  </span>
                </>
              ) : (
                <>
                  <i className="u-sn-h" style={{ width: `${[72, 58, 80, 64, 0, 70][i]}%` }} />
                  <i className="u-sn-u" />
                  <i className="u-sn-l" />
                </>
              )}
            </li>
          ))}
        </ol>
        <ul className="u-serp-steps">
          {SERP_STEPS.map((x) => (
            <li key={x}>
              <Check />
              {x}
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

/* ── бот: переписка печатается сама ── */
const cap1 = (s: string) => s[0].toUpperCase() + s.slice(1);
export function ChatFeed({ mini = false }: { mini?: boolean }) {
  if (mini)
    return (
      <span className="u-mchat" aria-hidden="true">
        <i className="me" />
        <i className="bot" />
        <i className="bot" />
        <i className="bot s" />
        <i className="bot s" />
      </span>
    );
  return (
    <div className="u-chat-feed">
      <p className="u-msg u-msg--me" data-type={cap1(ORDER_PHRASE)}>
        <span className="u-msg-t">{cap1(ORDER_PHRASE)}</span>
      </p>
      <p className="u-msg u-msg--dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </p>
      <div className="u-msg u-msg--bot u-rc">
        <span>
          Пепперони большая <b>×{NB}2</b>
        </span>
        <span className="u-rc-n">без лука</span>
        <span>
          Кола <b>×{NB}1</b>
        </span>
        <span className="u-rc-n">к 19:00 · {ORDER_PHRASE.match(/на (.+)$/)?.[1] ?? ""}</span>
      </div>
      {ORDER_STATUSES.map((st, i) => (
        <p className="u-msg u-msg--bot u-msg--st" key={st}>
          {i === 0 ? `Заказ ${st}` : cap1(st)}
        </p>
      ))}
    </div>
  );
}
function Chat() {
  return (
    <Frame
      kind="chat"
      title="Переписка с ботом: заказ словами, чек и статусы"
      cap={
        <>
          Фраза и статусы из живого демо{" "}
          <a href="https://drova.lstmind.ru/" target="_blank" rel="noopener">
            drova.lstmind.ru
            <Out />
          </a>
        </>
      }
      re="Ещё раз"
    >
      <div className="u-chat">
        <p className="u-chat-hd">
          <b>Дровяная</b>
          <span>бот в Telegram</span>
        </p>
        <ChatFeed />
      </div>
    </Frame>
  );
}

/* ── админка: доска заказов, карточки переезжают сами и по тапу ── */
export function Kanban({ mini = false }: { mini?: boolean }) {
  const cols = KITCHEN_COLS;
  return (
    <div className={`u-kb${mini ? " u-kb--mini" : ""}`} data-kb={mini ? "auto" : "tap"} style={{ "--cols": cols.length } as React.CSSProperties}>
      {cols.map((c, i) => (
        <div className="u-kb-col" key={c}>
          <p className="u-kb-h">{c}</p>
          <ul>
            {KITCHEN_ORDERS.map((o, j) =>
              j === i ? (
                <li className="u-kb-card" key={o}>
                  {mini ? (
                    <i />
                  ) : (
                    <button type="button" aria-label={`Заказ ${o}: передвинуть дальше`}>
                      <b>{o}</b>
                      <i />
                      <i />
                    </button>
                  )}
                </li>
              ) : null,
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
function Board() {
  return (
    <Frame kind="kanban" title="Доска заказов: статусы двигаются сами, тап по карточке двигает её дальше" cap="Колонки и номера с панели кухни Дровяной. Нажмите на заказ.">
      <Kanban />
    </Frame>
  );
}

/* ── магазин: путь посылки от каталога до письма ── */
const SHOP = ["Каталог", "Фильтр", "Корзина", "Оплата", "Письмо"];
function Shop({ cards }: P) {
  const c = cards[0];
  const box = obj("o-box", 414);
  return (
    <Frame kind="shop" title="Путь заказа в магазине: каталог, фильтр, корзина, оплата, письмо" cap={<>Каталог: <SiteLink c={c} /></>}>
      <div className="u-shop">
        <div className="u-shop-scr">
          <span className="u-shop-cart" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 3h3l2 10h9l2-7H6" />
              <circle cx="8" cy="17" r="1.3" />
              <circle cx="15" cy="17" r="1.3" />
            </svg>
            <b>1</b>
          </span>
          <div className="u-shop-v" data-v="0">
            <Prev slug={c.slug} />
          </div>
          <div className="u-shop-v u-shop-f" data-v="1" aria-hidden="true">
            <p>
              <i className="on" />
              <i />
              <i className="on" />
            </p>
            <ul>
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className={[1, 4, 6].includes(i) ? "out" : ""} />
              ))}
            </ul>
          </div>
          <div className="u-shop-v u-shop-c" data-v="2" aria-hidden="true">
            <p>
              <i className="pic" />
              <span>
                <i />
                <i className="s" />
              </span>
              <b>1</b>
            </p>
            <i className="btn" />
          </div>
          <div className="u-shop-v u-shop-p" data-v="3" aria-hidden="true">
            <i />
            <i />
            <span>
              <i />
              <i />
            </span>
            <i className="btn" />
          </div>
          <div className="u-shop-v u-shop-m" data-v="4" aria-hidden="true">
            <span className="env">
              <i />
            </span>
            <span className="ln">
              <i />
              <i />
              <i className="s" />
            </span>
          </div>
        </div>
        <div className="u-shop-line">
          <span className="u-shop-track" aria-hidden="true">
            <span className="u-shop-box">
              <ArtImg art={box} sizes="44px" />
            </span>
          </span>
          <ol>
            {SHOP.map((x, i) => (
              <li key={x}>
                <button type="button" data-st={i}>
                  <i />
                  {x}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Frame>
  );
}

/* ── вёрстка: слои макета ложатся в живую страницу ── */
function Layers({ cards }: P) {
  const c = cards[0];
  return (
    <Frame kind="layers" title={`Слои макета складываются в страницу ${c.host}`} cap={<>Сверху настоящий экран: <SiteLink c={c} /></>} re="Разобрать">
      <div className="u-lay">
        <div className="u-lay-st">
          <span className="u-lay-l u-lay-grid" style={{ "--z": 0 } as React.CSSProperties} aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <i key={i} />
            ))}
          </span>
          <span className="u-lay-l u-lay-blk" style={{ "--z": 1 } as React.CSSProperties} aria-hidden="true">
            <i className="hd" />
            <i className="a" />
            <i className="b" />
          </span>
          <span className="u-lay-l u-lay-txt" style={{ "--z": 2 } as React.CSSProperties} aria-hidden="true">
            <i className="h" />
            <i className="h s" />
            <i />
            <i />
            <i className="s" />
          </span>
          <span className="u-lay-l u-lay-btn" style={{ "--z": 3 } as React.CSSProperties} aria-hidden="true">
            <i className="pic" />
            <i className="b1" />
            <i className="b2" />
          </span>
          <span className="u-lay-l u-lay-shot" style={{ "--z": 4 } as React.CSSProperties}>
            <Prev slug={c.slug} />
          </span>
        </div>
      </div>
    </Frame>
  );
}

/* ── переезд: коробка едет со старого сервера на новый, сайт всё время открыт ── */
const MOVE = ["копия", "база", "SSL", "почта", "редиректы", "проверка"];
function Move() {
  return (
    <Frame kind="move" title="Переезд сайта со старого сервера на новый без простоя" re="Ещё раз">
      <div className="u-mv">
        <p className="u-mv-up">
          <i aria-hidden="true" />
          сайт открывается
        </p>
        <div className="u-mv-row">
          <span className="u-mv-srv">
            <ArtImg art={obj("o-server-old", 330)} sizes="96px" alt="Старый сервер" />
          </span>
          <span className="u-mv-line" aria-hidden="true">
            <span className="u-mv-box">
              <ArtImg art={obj("o-box", 414)} sizes="60px" />
            </span>
          </span>
          <span className="u-mv-srv u-mv-new">
            <ArtImg art={obj("o-server-new", 328)} sizes="96px" alt="Новый сервер" />
            <i className="u-mv-led" aria-hidden="true" />
          </span>
        </div>
        <ul className="u-mv-ck">
          {MOVE.map((x) => (
            <li key={x}>
              <Check />
              {x}
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

/* ── интеграции: заказ бежит по связке узлов ── */
const NODES = ["Сайт", "Оплата", "CRM", "Доставка"];
function Flow() {
  return (
    <Frame kind="flow" title="Заказ проходит путь: сайт, оплата, CRM, доставка" re="Оформить заказ">
      <div className="u-fl">
        <svg className="u-fl-lines" viewBox="0 0 300 180" preserveAspectRatio="none" aria-hidden="true">
          <path d="M60 40H240V140H60" pathLength="100" />
          <path className="u-fl-run" d="M60 40H240V140H60" pathLength="100" />
        </svg>
        {NODES.map((n, i) => (
          <span className="u-fl-n" key={n} data-n={i}>
            {n}
          </span>
        ))}
        <i className="u-fl-dot" aria-hidden="true" />
        <p className="u-fl-st" aria-live="polite">
          тестовый заказ прошёл весь путь
        </p>
      </div>
    </Frame>
  );
}

/* ── обмен с 1С: из 1С на сайт товары, цены, остатки и картинки, обратно заказы ──
   подписи под краями честно делят работу: сторону 1С делает 1С-программист заказчика, сторону сайта я */
const SYNC: { k: string; back?: boolean }[] = [{ k: "товары" }, { k: "цены" }, { k: "остатки" }, { k: "картинки" }, { k: "заказы", back: true }];
function Sync() {
  return (
    <Frame
      kind="sync"
      title="Схема обмена: товары, цены, остатки и картинки из 1С на сайт, заказы с сайта в 1С. Сторону 1С делает ваш 1С-программист, сторону сайта я"
      cap="Схема: главной остаётся 1С, сайт получает из неё всё сам"
      re="Запустить обмен ещё раз"
    >
      <div className="u-sy">
        <p className="u-sy-end u-sy-a">
          <b>1С</b>
          <span>ваш 1С-программист</span>
        </p>
        <ul className="u-sy-l">
          {SYNC.map((x) => (
            <li key={x.k} className={x.back ? "back" : undefined}>
              <span className="u-sy-p">
                <Check />
                {x.k}
              </span>
            </li>
          ))}
        </ul>
        <p className="u-sy-end u-sy-b">
          <b>Сайт</b>
          <span>делаю я</span>
        </p>
        <p className="u-sy-st">по расписанию, ошибки в{NB}журнал</p>
      </div>
    </Frame>
  );
}

/* ── парсеры: команда, и таблица заполняется сама ── */
const ROWS = [
  [62, 30, 18],
  [48, 26, 22],
  [70, 34, 14],
  [54, 28, 20],
  [66, 22, 16],
  [44, 30, 24],
  [58, 26, 18],
  [72, 32, 12],
  [50, 24, 22],
  [64, 28, 16],
];
function Parse() {
  return (
    <Frame kind="parse" title="Скрипт собирает данные в таблицу вместо человека" cap="Руками это часы копирования" re="Запустить ещё раз">
      <div className="u-pr">
        <p className="u-pr-term">
          <span className="u-pr-cmd" data-type="собрать цены и остатки поставщика">
            собрать цены и остатки поставщика
          </span>
          <i className="u-caret" aria-hidden="true" />
        </p>
        <div className="u-pr-tab" aria-hidden="true">
          <p className="u-pr-h">
            <span>товар</span>
            <span>цена</span>
            <span>остаток</span>
          </p>
          {ROWS.map((r, i) => (
            <p className="u-pr-r" key={i}>
              {r.map((w, j) => (
                <span key={j}>
                  <i style={{ width: `${w + 20}%` }} />
                </span>
              ))}
            </p>
          ))}
        </div>
        <p className="u-pr-n">
          строк в таблице: <b>{ROWS.length}</b>
        </p>
      </div>
    </Frame>
  );
}

/* ── переделка: адреса стоят, страницы под ними меняются ── */
const TREE = [
  { a: "/", b: "" },
  { a: "/uslugi", b: "" },
  { a: "/kontakty", b: "" },
  { a: "/blog", b: "/stati" },
];
function Tree({ cards }: P) {
  const c = cards[0];
  return (
    <Frame kind="tree" title="Новый сайт на старых адресах: страницы меняются, адреса остаются" cap={<>Адреса и позиции остаются. Новый вид: <SiteLink c={c} /></>} re="Ещё раз">
      <ul className="u-tr">
        {TREE.map((t, i) => (
          <li className={`u-tr-n${i === 0 ? " u-tr-root" : ""}`} key={t.a}>
            <span className="u-tr-th">
              <span className="u-tr-old" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="u-tr-new">{i === 0 ? <Prev slug={c.slug} sizes="140px" /> : <i aria-hidden="true" />}</span>
            </span>
            <span className="u-tr-a">
              <span className={t.b ? "u-tr-from" : undefined}>{t.a}</span>
              {t.b && (
                <span className="u-tr-301">
                  <em>301</em>
                  {t.b}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/* ── поддержка: месяц сеткой, работа падает по расписанию ── */
const DAY = (d: number) => {
  const x: string[] = ["copy"];
  if (d % 7 === 0) x.push("upd");
  if ([3, 9, 16, 22, 26].includes(d)) x.push("fix");
  if (d === 30) x.push("rep");
  return x;
};
const ICON: Record<string, React.ReactNode> = {
  copy: <i className="u-mo-copy" />,
  upd: (
    <svg className="u-mo-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 5.5A5 5 0 1 0 13.5 10M13 2v3.5H9.5" />
    </svg>
  ),
  fix: (
    <svg className="u-mo-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 13l1-3.5 6.5-6.5 2.5 2.5L6.5 12z" />
    </svg>
  ),
  rep: (
    <svg className="u-mo-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 2h6l3 3v9H4zM6.5 8.5h4M6.5 11h4" />
    </svg>
  ),
};
function Month() {
  return (
    <Frame
      kind="month"
      title="Месяц поддержки: копия каждый день, обновления на копии раз в неделю, правки по запросу, отчёт в конце"
      re="Новый месяц"
      cap={
        <span className="u-mo-leg">
          <span>{ICON.copy}копия</span>
          <span>{ICON.upd}обновление</span>
          <span>{ICON.fix}правка</span>
          <span>{ICON.rep}отчёт</span>
        </span>
      }
    >
      <ol className="u-mo">
        {Array.from({ length: 30 }).map((_, i) => (
          <li key={i} style={{ "--i": i } as React.CSSProperties}>
            <span className="u-mo-d">{i + 1}</span>
            <span className="u-mo-x">
              {DAY(i + 1).map((k) => (
                <span key={k}>{ICON[k]}</span>
              ))}
            </span>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

/* ── под ключ: страница собирается по пунктам, в конце сжимается в телефон ── */
const BUILD = ["структура", "макет", "вёрстка", "формы", "запуск", "телефон"];
function Build({ cards }: P) {
  const c = cards[0];
  return (
    <Frame kind="build" title={`Сайт собирается по шагам до запуска на ${c.host}`} cap={<>В конце настоящий сайт: <SiteLink c={c} /></>} re="Собрать заново">
      <div className="u-bd">
        <div className="u-bd-win">
          <p className="u-bd-bar">
            <i />
            <i />
            <i />
            <span className="u-bd-url" data-url={c.host}>
              {c.host}
            </span>
          </p>
          <div className="u-bd-page">
            <span className="u-bd-sk" aria-hidden="true">
              <i className="hd" />
              <i className="h1" />
              <i className="h2" />
              <i className="pic" />
              <i className="a" />
              <i className="b" />
            </span>
            <span className="u-bd-shot u-bd-d">
              <Prev slug={c.slug} />
            </span>
            <span className="u-bd-shot u-bd-m">
              <Mob card={c.card} sizes="120px" />
            </span>
            <span className="u-bd-form" aria-hidden="true">
              <i />
              <b>Заявка ушла</b>
            </span>
          </div>
        </div>
        <ol className="u-steps-mini">
          {BUILD.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
      </div>
    </Frame>
  );
}

/* ── визитка: веер визиток из работ ── */
function Fan({ cards }: P) {
  const cs = cards.slice(0, 3);
  return (
    <Frame kind="fan" title="Визитки из работ веером" cap={<>Визитки из работ, нажмите на любую: <span className="u-fan-host">{cs[0].host}</span></>}>
      <div className="u-fan">
        {cs.map((c, i) => (
          <button type="button" className="u-fan-c" key={c.slug} style={{ "--i": i } as React.CSSProperties} data-host={c.host} aria-label={`${c.title}, ${c.host}`}>
            <Mob card={c.card} sizes="150px" />
          </button>
        ))}
      </div>
    </Frame>
  );
}

/* ── лендинг: одна линия от первого экрана до заявки ── */
function Path({ s }: P) {
  const parts = (s.includes[0].split(":")[1] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  if (parts.length < 3) throw new Error("у лендинга первый пункт includes должен перечислять части через двоеточие");
  return (
    <Frame kind="path" title={`Лендинг: ${parts.join(", ")}`} cap="Один путь до заявки, без лишних развилок" re="Сначала">
      <div className="u-pt">
        <div className="u-pt-page">
          {parts.map((p, i) => (
            <span className={`u-pt-s${i === parts.length - 1 ? " u-pt-form" : ""}`} key={p}>
              <b>{p}</b>
              {i === parts.length - 1 ? (
                <>
                  <i className="fld" />
                  <i className="fld" />
                  <i className="btn">Оставить заявку</i>
                </>
              ) : (
                <>
                  <i />
                  <i className="s" />
                </>
              )}
            </span>
          ))}
        </div>
        <svg className="u-pt-line" viewBox="0 0 20 200" preserveAspectRatio="none" aria-hidden="true">
          <path d="M10 0V200" pathLength="100" />
        </svg>
      </div>
    </Frame>
  );
}

/* ── под рекламу: клик по объявлению доходит до заявки с меткой ──
   схема без выдуманных цифр: utm_source=yandex и utm_medium=cpc это обычные метки Директа, остальное полосками */
const AD_GOALS = ["заявка", "звонок", "мессенджер"];
function Ads() {
  return (
    <Frame kind="ads" title="Схема: объявление, посадочная страница, цели в Метрике и заявка с меткой рекламы" cap="Схема: клик по объявлению доходит до заявки вместе с меткой" re="Ещё раз">
      <div className="u-ad">
        <div className="u-ad-s u-ad-ad" data-s="0">
          <span className="u-ad-k">Объявление</span>
          <i className="h" />
          <i className="u" />
          <i />
        </div>
        <div className="u-ad-s u-ad-pg" data-s="1">
          <span className="u-ad-k">Посадочная</span>
          <i className="h" />
          <i className="s" />
          <b className="btn">Оставить заявку</b>
        </div>
        <div className="u-ad-s u-ad-gl" data-s="2">
          <span className="u-ad-k">Цели в Метрике</span>
          <ul>
            {AD_GOALS.map((g) => (
              <li key={g}>
                <Check />
                {g}
              </li>
            ))}
          </ul>
        </div>
        <div className="u-ad-s u-ad-msg" data-s="3">
          <span className="u-ad-k">Заявка в Telegram</span>
          <dl>
            <div>
              <dt>источник</dt>
              <dd>yandex{NB}/{NB}cpc</dd>
            </div>
            <div>
              <dt>кампания</dt>
              <dd>
                <i />
              </dd>
            </div>
            <div>
              <dt>страница</dt>
              <dd>
                <i className="s" />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Frame>
  );
}

/* ── корпоративный: дерево разделов прорастает от главной ── */
/** разделы из пунктов "Что входит": каждый должен там упоминаться, иначе сборка остановится */
const CORP = ["Услуги", "Объекты", "Документы", "Новости", "Вакансии", "Контакты"];
function Corp({ s, cards }: P) {
  const c = cards[0];
  const all = s.includes.join(" ").toLowerCase();
  const secs = CORP.filter((x) => all.includes(x.toLowerCase().slice(0, 5)));
  if (secs.length !== CORP.length) throw new Error(`разделы корпоративного сайта не совпали с includes: ${secs.join(", ")}`);
  return (
    <Frame kind="corp" title="Разделы корпоративного сайта от главной" cap={<>Главная: <SiteLink c={c} /></>} re="Ещё раз">
      <div className="u-cp">
        <span className="u-cp-root">
          <span className="u-cp-th">
            <Prev slug={c.slug} sizes="200px" />
          </span>
          <b>Главная</b>
        </span>
        <ul className="u-cp-ns">
          {secs.map((x, i) => (
            <li key={x} style={{ "--i": i } as React.CSSProperties}>
              <i aria-hidden="true">
                <i />
                <i />
              </i>
              {x}
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

/* ── каталог: фильтры и заявка вместо корзины ── */
const CAT_F = ["размер", "материал", "в наличии"];
const CAT_SETS = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  [0, 2, 3, 5, 7],
  [1, 2, 4, 5, 8],
  [0, 3, 4, 6, 8],
];
function Catalog() {
  return (
    <Frame kind="catalog" title="Витрина каталога: фильтры и заявка на расчёт прямо с плитки" cap="Нажмите фильтр или заявку на плитке">
      <div className="u-ct" data-sets={JSON.stringify(CAT_SETS)}>
        <p className="u-ct-f">
          {CAT_F.map((f, i) => (
            <button type="button" key={f} data-f={i + 1} aria-pressed="false">
              {f}
            </button>
          ))}
          <span className="u-ct-env" aria-live="polite">
            <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <rect x="1.5" y="1.5" width="17" height="13" rx="2" />
              <path d="M2 3l8 6 8-6" />
            </svg>
            заявок: <b>0</b>
          </span>
        </p>
        <ul className="u-ct-g">
          {Array.from({ length: 9 }).map((_, i) => (
            <li key={i} data-t={i}>
              <i className={`u-ct-pic u-ct-pic${i % 3}`} aria-hidden="true" />
              <i className="u-ct-l" aria-hidden="true" />
              <button type="button" aria-label={`Заявка на расчёт, позиция ${i + 1}`}>
                заявка
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

/* ── языки: переключатель на настоящем сайте ── */
export const LANGS = [
  { k: "ru", path: "/ru/", lang: "ru-RU" },
  { k: "et", path: "/", lang: "et" },
  { k: "en", path: "/en/", lang: "en-US" },
];
function Lang() {
  return (
    <Frame
      kind="lang"
      title="Переключатель языков на сайте sealtsiia.ee"
      cap={
        <>
          Сайт мувинговой компании, три языка:{" "}
          <a href="https://sealtsiia.ee/ru/" target="_blank" rel="noopener">
            sealtsiia.ee
            <Out />
          </a>
        </>
      }
    >
      <div className="u-lg">
        <p className="u-lg-bar">
          <span className="u-lg-url">
            sealtsiia.ee<b>{LANGS[0].path}</b>
          </span>
        </p>
        <div className="u-lg-scr">
          {LANGS.map((l, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={l.k}
              data-l={l.k}
              className={i === 0 ? "on" : undefined}
              alt={i === 0 ? "Первый экран sealtsiia.ee" : ""}
              loading="lazy"
              decoding="async"
              src={`/img/v4/uslugi/seal-${l.k}-400.webp`}
              srcSet={`/img/v4/uslugi/seal-${l.k}-400.webp 400w, /img/v4/uslugi/seal-${l.k}-780.webp 780w`}
              sizes="200px"
              width={400}
              height={559}
            />
          ))}
        </div>
        <p className="u-lg-sw" role="group" aria-label="Язык версии">
          {LANGS.map((l, i) => (
            <button type="button" key={l.k} data-l={l.k} data-path={l.path} data-lang={l.lang} aria-pressed={i === 0}>
              {l.k.toUpperCase()}
            </button>
          ))}
        </p>
        <p className="u-lg-code">
          <code>
            &lt;html lang=&quot;<b>{LANGS[0].lang}</b>&quot;&gt;
          </code>
        </p>
      </div>
    </Frame>
  );
}

/* ── WordPress: живые сайты на нём из работ, переключатель "сайты / магазины", каждый открывается ── */
const Bag = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M3 5.5h10l-.8 8H3.8zM5.8 5.5V4.3a2.2 2.2 0 0 1 4.4 0v1.2" />
  </svg>
);
function Wp() {
  const n = WP_SITES.length;
  const woo = WP_SITES.filter((x) => x.woo).length;
  const tabs = [
    { k: "all", label: "все", n },
    { k: "wp", label: "сайты", n: n - woo },
    { k: "woo", label: "магазины WooCommerce", n: woo },
  ];
  const of = `${PROJECTS_TOTAL}${NB}${plural(PROJECTS_TOTAL, ["живого сайта", "живых сайтов", "живых сайтов"])}`;
  return (
    <Frame
      kind="wp"
      title={`Живые сайты на WordPress и WooCommerce из работ: ${n}`}
      cap={
        <>
          {n} из {of} в{NB}работах на WordPress. Нажмите на адрес, сайт откроется
        </>
      }
    >
      <div className="u-wp">
        <p className="u-wp-f" role="group" aria-label="Какие сайты показать">
          {tabs.map((t, i) => (
            <button type="button" key={t.k} data-f={t.k} aria-pressed={i === 0}>
              {t.label}
              <b>{t.n}</b>
            </button>
          ))}
        </p>
        <ul className="u-wp-l">
          {WP_SITES.map((x) => (
            <li key={x.host} data-k={x.woo ? "woo" : "wp"}>
              <a href={x.href} target="_blank" rel="noopener" title={`${x.title}, ${x.engine.replace(/ · /g, ", ")}`}>
                {x.woo && <Bag />}
                {x.host}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

const DEMOS: Record<string, (p: P) => React.ReactElement> = {
  "pochinit-sayt": Fix,
  "uskorit-sayt": Speed,
  "podgotovka-k-reklame": Ads,
  "tehnicheskoe-seo": Serp,
  "telegram-bot": Chat,
  "admin-panel-i-crm": Board,
  "internet-magazin": Shop,
  "sayt-na-wordpress": Wp,
  "verstka-po-figma": Layers,
  "perenos-sayta": Move,
  integracii: Flow,
  "integraciya-s-1s": Sync,
  "parsing-i-avtomatizaciya": Parse,
  "pererabotka-sayta": Tree,
  "podderzhka-sayta": Month,
  "sayt-pod-klyuch": Build,
  "sayt-vizitka": Fan,
  lending: Path,
  "korporativnyy-sayt": Corp,
  "sayt-katalog": Catalog,
  "mnogoyazychnyy-sayt": Lang,
};

/** механика услуги для левой колонки "Что входит" */
export function Demo({ s, cards }: P) {
  const D = DEMOS[s.slug];
  if (!D) throw new Error(`нет механики для услуги ${s.slug} в components/v4/uslugi/Demos.tsx`);
  return <D s={s} cards={cards} />;
}

/** кадр из разбора Дровяной в рамке карточки: для бота страница заказа, для админки админка и кухня */
export function CaseShots({ names }: { names: ("status" | "admin" | "kitchen")[] }) {
  return (
    <div className="u-shots">
      {names.map((n) => {
        const sh = drovaShot(n);
        return (
          <figure className="u-demo u-demo--shot" key={n}>
            <a className="u-demo-box" href="/works/drovyanaya">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={sh.alt}
                loading="lazy"
                decoding="async"
                src={`${sh.src}-564.webp`}
                srcSet={`${sh.src}-564.webp 564w, ${sh.src}.webp 1128w`}
                sizes="(max-width: 699px) 92vw, 420px"
                width={sh.w}
                height={sh.h}
              />
            </a>
            <figcaption className="u-demo-cap">
              <span className="u-demo-txt">{sh.caption}</span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

export { ILL };
