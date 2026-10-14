import { PROJECTS_TOTAL } from "@/lib/content";
import { liveSitesWord } from "@/lib/home";
import { SITES, CATS, PLATFORMS, CAT_SHORT } from "./data";
import { Crumbs, Cta, Drum, Ill, Out, Next } from "./parts";
import { HubIsland } from "./islands";
import "./works.css";
import "./works-ill.css";

const OWN = "Свои проекты";
/** сколько карточек видно до кнопки "показать все": две строки на десктопе, шесть на телефоне */
const FIRST = 12;
/** сколько первых карточек грузить сразу и сколько из них с высоким приоритетом (первая строка на телефоне, там LCP) */
const EAGER = 6;
const URGENT = 2;

/* Фильтр, кнопка "показать все" и обрезка сетки до первых 12 приходят уже в разметке: без этого после гидрации
   фильтр вставал над сеткой и сдвигал карточки (CLS), а 24 лишние карточки успевали попасть в первую раскладку.
   Без скрипта всё как раньше: фильтра и кнопки нет, видны все карточки. */
const NOSCRIPT = "<style>.w-hub .w-filters,.w-hub .w-more{display:none}html .w-hub.is-cut .w-site[data-more]{display:flex}</style>";

/**
 * Витрина: все живые сайты карточками, как в карусели героя (серые в покое, цвет при наведении, в фокусе
 * или посреди экрана на телефоне). Фильтр по типу и движку. Ниже тот же список строками: что на каждом сайте.
 */
export function Hub() {
  const total = PROJECTS_TOTAL;
  const [w1, w2] = liveSitesWord(total).split(" ");
  const nCat = (c: string) => SITES.filter((s) => s.cat === c).length;
  const nOwn = SITES.filter((s) => s.own).length;
  const nPf = (p: string) => SITES.filter((s) => s.platform === p).length;
  const nCases = SITES.filter((s) => s.caseSlug).length;

  return (
    <main id="main" className="w-hub is-cut">
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT }} />
      <header className="w-hub__head">
        <Crumbs items={[{ name: "Главная", href: "/" }, { name: "Работы" }]} />
        <div className="w-hub__title">
          <Drum text="Работы" className="w-big" />
          <p className="w-hub__total">
            <b>{total}</b>
            <span>
              {w1} {w2},
              <br />
              каждый открывается
            </span>
          </p>
        </div>
        <p className="w-hub__lead">
          Магазины, сайты компаний, каталоги и свои демо. Каждый можно открыть и потыкать руками, у {nCases} есть разбор проекта.
        </p>

        <div className="w-filters">
          <div className="w-filter" role="group" aria-label="Тип сайта" data-dim="cat">
            <button type="button" aria-pressed="true" data-v="">
              Все <i>{total}</i>
            </button>
            {CATS.map((c) => (
              <button type="button" aria-pressed="false" data-v={c} key={c}>
                {c} <i>{nCat(c)}</i>
              </button>
            ))}
            <button type="button" aria-pressed="false" data-v={OWN}>
              {OWN} <i>{nOwn}</i>
            </button>
          </div>
          <div className="w-filter w-filter--pf" role="group" aria-label="Движок" data-dim="pf">
            <span className="w-filter__lab" aria-hidden="true">
              движок
            </span>
            <button type="button" aria-pressed="true" data-v="">
              Любой
            </button>
            {PLATFORMS.map((p) => (
              <button type="button" aria-pressed="false" data-v={p} key={p}>
                {p} <i>{nPf(p)}</i>
              </button>
            ))}
          </div>
          <p className="w-filters__found" aria-live="polite" />
        </div>
      </header>

      <section className="w-grid-wrap" aria-labelledby="w-grid-h">
        <h2 className="sr" id="w-grid-h">
          Все живые сайты
        </h2>
        <ul className="w-grid" id="w-grid">
          {SITES.map((s, k) => {
            const main = s.caseSlug ? `/works/${s.caseSlug}` : s.href;
            const ext = !s.caseSlug;
            return (
              <li
                className="w-site"
                key={s.host}
                style={
                  {
                    "--len": Math.max(...s.title.split(" ").map((w) => w.length)),
                  } as React.CSSProperties
                }
                data-site=""
                data-cat={s.cat}
                data-pf={s.platform}
                data-own={s.own ? OWN : ""}
                data-more={k >= FIRST ? "" : undefined}
              >
                <a className="w-card" href={main} {...(ext ? { target: "_blank", rel: "noopener" } : {})} tabIndex={-1} aria-hidden="true">
                  <span className="w-card__screen">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${s.img}-240.webp`}
                      srcSet={`${s.img}-240.webp 240w, ${s.img}-400.webp 400w`}
                      sizes="(max-width: 699px) 46vw, (max-width: 1099px) 30vw, 220px"
                      width={240}
                      height={519}
                      // ссылка-картинка скрыта от читалки (дубль подписи), alt для поиска по картинкам
                      alt={`${s.title}, ${s.host}: мобильная версия сайта`}
                      loading={k < EAGER ? "eager" : "lazy"}
                      fetchPriority={k < URGENT ? "high" : undefined}
                      decoding="async"
                      draggable={false}
                    />
                  </span>
                  <span className="w-card__fog" />
                  <span className="w-card__pill">
                    {s.caseSlug ? "разбор" : s.host}
                    {s.caseSlug ? <Next /> : <Out />}
                  </span>
                </a>
                <h3 className="w-site__name">
                  <a href={main} {...(ext ? { target: "_blank", rel: "noopener" } : {})}>
                    {s.title}
                    {ext && <span className="sr">, открыть сайт в новой вкладке</span>}
                  </a>
                </h3>
                <p className="w-site__meta">
                  {CAT_SHORT[s.cat] ?? s.cat} · {s.engine}
                  {s.own && <em> · свой</em>}
                </p>
                <p className="w-site__links">
                  {s.caseSlug ? (
                    <>
                      <a href={`/works/${s.caseSlug}`} className="w-site__case">
                        разбор
                        <Next />
                      </a>
                      <a href={s.href} target="_blank" rel="noopener" className="w-site__host">
                        {s.host}
                        <Out />
                      </a>
                    </>
                  ) : (
                    <a href={s.href} target="_blank" rel="noopener" className="w-site__host">
                      {s.host}
                      <Out />
                    </a>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="w-more">
          <button type="button" className="w-more__btn" aria-controls="w-grid">
            Показать все {total}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <path d="M8 2.5v10M4 8.5l4 4 4-4" />
            </svg>
          </button>
        </p>
        <p className="w-empty" hidden>
          Такого сочетания нет.{" "}
          <button type="button" className="w-empty__reset">
            Показать все
          </button>
        </p>
      </section>

      <section className="w-list" aria-labelledby="w-list-h">
        <div className="w-list__head">
          <h2 className="w-mid" id="w-list-h">
            Списком
          </h2>
          <p className="w-list__sub">Что сделано на каждом сайте и на чём он собран.</p>
        </div>
        {/* папка с работами: на десктопе стоит слева и едет вместе со списком, на телефоне справа от слова */}
        <div className="w-list__fig">
          <Ill pose="h-papka" sizes="(max-width: 1099px) 130px, 230px" />
        </div>
        <ol className="w-rows">
          {SITES.map((s, k) => (
            <li className="w-row" key={s.host} data-site="" data-cat={s.cat} data-pf={s.platform} data-own={s.own ? OWN : ""} data-img={s.img}>
              <span className="w-row__n" aria-hidden="true">
                {String(k + 1).padStart(2, "0")}
              </span>
              <span className="w-card w-row__thumb" aria-hidden="true">
                <span className="w-card__screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${s.img}-240.webp`} width={240} height={519} alt="" loading="lazy" decoding="async" draggable={false} />
                </span>
                <span className="w-card__fog" />
              </span>
              <div className="w-row__main">
                <h3 className="w-row__name">{s.caseSlug ? <a href={`/works/${s.caseSlug}`}>{s.title}</a> : s.title}</h3>
                <p className="w-row__note">{s.note}</p>
              </div>
              <p className="w-row__side">
                <span className="w-row__eng">{s.engine}</span>
                <a href={s.href} target="_blank" rel="noopener">
                  {s.host}
                  <Out />
                </a>
                {s.caseSlug && (
                  <a href={`/works/${s.caseSlug}`} className="w-row__case">
                    разбор
                    <Next />
                  </a>
                )}
              </p>
            </li>
          ))}
        </ol>
        <p className="w-list__more">
          Цены и сроки по каждой услуге в <a href="/uslugi">услугах</a>, сайты под конкретный бизнес в <a href="/dlya">разделе ниш</a>.
        </p>
        {/* превью за курсором: одно на весь список, только при настоящей мыши */}
        <div className="w-peek" aria-hidden="true">
          <span className="w-card is-live">
            <span className="w-card__screen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" width={240} height={519} decoding="async" draggable={false} />
            </span>
          </span>
        </div>
      </section>

      <Cta title="Хочу такой же" text="Скажите, какой из проектов ближе к вашей задаче: прикину смету и срок по аналогии. Отвечаю в течение часа." />
      <HubIsland />
    </main>
  );
}
