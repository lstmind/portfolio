import { SITE } from "@/lib/content";
import { tgHref } from "@/lib/cta";
import { LeadForm } from "@/components/v4/cta/LeadForm";
import { OnePhrase } from "@/components/v4/cta/Strip";
import { tie } from "@/components/v4/typo";
import { splitPrice, wordFit, type SiteCard } from "./data";
import "@/components/v4/home/prices.css";
import { SceneCrop, sceneOf, sceneSrc, sceneSrcSet } from "./scene";

/** стрелка наружу, как у Telegram в шапке */
export const Out = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);

/** стрелка вправо: переход внутри сайта */
export const Go = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M2.5 8h11M9 3.5L13.5 8 9 12.5" />
  </svg>
);

/** хлебные крошки: видимая часть пути; полный путь с текущей страницей лежит в BreadcrumbList */
export function Crumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav className="dl-crumbs" aria-label="Хлебные крошки">
      <ol>
        {items.map((c) => (
          <li key={c.href}>
            <a href={c.href}>{c.name}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Крупное слово Fira 900 капсом: буквы встают на барабане, как слова героя и прайса.
 * Кегль подбирается под ширину колонки по числу знаков (--n на десктопе, --nm на телефоне).
 * Текст заголовка: само слово по буквам, без дубля (капс даёт CSS), читалке слово целиком в aria-label.
 */
export function Word({
  text,
  as: Tag = "p",
  id,
  className,
  start = 0,
}: {
  text: string;
  as?: "p" | "h2";
  id?: string;
  className?: string;
  /** с какой буквы по счёту начинать задержку: чтобы слово шло следом за строкой над ним */
  start?: number;
}) {
  const fit = wordFit(text);
  let k = start;
  return (
    <Tag
      className={`dl-word${className ? ` ${className}` : ""}`}
      id={id}
      style={{ "--n": fit.d, "--nm": fit.m } as React.CSSProperties}
      aria-hidden={Tag === "p" ? true : undefined}
      aria-label={Tag === "p" ? undefined : text}
    >
      <span className="dl-word-in">
        {text
          .split(" ")
          .map((w, wi) => (
            <span className="dl-wd" key={wi}>
              {wi > 0 && " "}
              <span className="dl-wd-in">
                {[...w].map((ch, i) => (
                  <span className="dl-ch" style={{ "--i": k++ } as React.CSSProperties} key={i}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          ))}
      </span>
    </Tag>
  );
}

/** красная кнопка Telegram язычком, как у героя главной; text: первое сообщение */
export function TgButton({ text, className = "" }: { text?: string; className?: string }) {
  const href = tgHref(text);
  return (
    <a className={`dl-tg ${className}`} href={href} target="_blank" rel="noopener">
      Написать в Telegram
      <Out />
    </a>
  );
}

/**
 * Веер карточек живых сайтов ниши в первом экране: как дальние карточки карусели героя,
 * серые в покое, цвет и подпись при наведении или фокусе. Первая работа ниши стоит в середине, впереди.
 */
export function Fan({ sites, label }: { sites: SiteCard[]; label: string }) {
  const s = sites.slice(0, 3);
  // порядок слева направо: вторая, первая, третья; первая впереди
  const order = s.length === 3 ? [s[1], s[0], s[2]] : s;
  const mid = (order.length - 1) / 2;
  return (
    <ul className="dl-fan" data-k={order.length} aria-label={label}>
      {order.map((c, j) => (
        <li
          className={`dl-fc${c === s[0] ? " dl-fc--main" : ""}`}
          key={c.host}
          style={{ "--j": j - mid, "--a": Math.abs(j - mid), "--z": c === s[0] ? 3 : 2 - Math.abs(j - mid) } as React.CSSProperties}
        >
          <a href={c.href} target="_blank" rel="noopener" aria-label={`${c.title}, ${c.host}`}>
            <span className="dl-fc-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                decoding="async"
                fetchPriority={c === s[0] ? "high" : undefined}
                src={`${c.img}-240.webp`}
                srcSet={`${c.img}-240.webp 240w, ${c.img}-400.webp 400w`}
                sizes="(max-width: 699px) 84px, 220px"
                width={240}
                height={519}
              />
            </span>
            <span className="dl-fc-cap">
              {c.title}
              <span>
                {c.host}
                <Out />
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** работы ниши карточками, как в карусели героя: серые в покое, цвет при наведении, в фокусе и у середины экрана на телефоне */
export function SiteCards({ sites }: { sites: SiteCard[] }) {
  return (
    <ul className="dl-cards">
      {sites.map((c) => (
        <li className="dl-card" key={c.host}>
          <a className="dl-card-img" href={c.href} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              loading="lazy"
              decoding="async"
              src={`${c.img}-240.webp`}
              srcSet={`${c.img}-240.webp 240w, ${c.img}-400.webp 400w`}
              sizes="(max-width: 699px) 58vw, 220px"
              width={240}
              height={519}
            />
          </a>
          <div className="dl-card-txt">
          <p className="dl-card-name">
            <a href={c.href} target="_blank" rel="noopener">
              {c.title}
              <Out />
            </a>
          </p>
          <p className="dl-card-host">{c.host}</p>
          <p className="dl-card-note">{c.note}</p>
          {c.caseSlug && (
            <p className="dl-card-case">
              <a href={`/works/${c.caseSlug}`}>
                Разбор проекта
                <Go />
              </a>
            </p>
          )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export type SignRow = {
  href: string;
  word: string;
  price: string;
  /** первая строка подписи жирным */
  title: string;
  /** вторая строка: срок */
  term: string;
  note: string;
  img: string;
  cap: string;
  host: string;
  /** slug ниши: строка получает сцену персонажа (хаб: смена позы на десктопе, кроп вместо карточки на телефоне) */
  scene?: string;
};

/**
 * Прайс-вывеска главной (components/v4/home/Prices.tsx) с той же разметкой и тем же кодом поведения:
 * крупное слово, цена на той же линии, у правого края серая карточка живого сайта.
 */
export function Sign({
  id,
  title,
  side,
  rows,
  size,
  intro,
  aside,
}: {
  id: string;
  title: string;
  side?: string;
  rows: SignRow[];
  size?: "s";
  /** абзац между шапкой и строками */
  intro?: React.ReactNode;
  /** картинка слева от абзаца, только на телефоне */
  aside?: React.ReactNode;
}) {
  // кегль слов один на всю вывеску: по самому длинному слову, чтобы колонка цен не уехала за край
  const gn = Math.max(...rows.map((r) => wordFit(r.word).d));
  return (
    <section
      className={`s-prices dl-sign${size ? " dl-sign--s" : ""}`}
      id={id}
      aria-labelledby={`${id}-t`}
      style={{ "--gn": gn } as React.CSSProperties}
    >
      <header className="prices-head">
        <h2 id={`${id}-t`}>{title}</h2>
        {side && <p>{side}</p>}
      </header>
      {intro &&
        (aside ? (
          <div className="dl-sign-introw">
            <figure className="dl-sign-aside" aria-hidden="true">
              {aside}
            </figure>
            <p className="dl-sign-intro">{intro}</p>
          </div>
        ) : (
          <p className="dl-sign-intro">{intro}</p>
        ))}
      <ol className="prices-list">
        {rows.map((r) => {
          const p = splitPrice(r.price);
          const sc = r.scene ? sceneOf(r.scene) : null;
          const scAttrs = sc
            ? { "data-sc-src": sceneSrc(sc), "data-sc-set": sceneSrcSet(sc), "data-sc-w": sc.w, "data-sc-ax": sc.ax }
            : {};
          return (
            <li className="prices-row" key={r.href} {...scAttrs}>
              <a className="prices-link" href={r.href}>
                <span className="prices-txt">
                  <span className="prices-word" data-w={r.word} style={{ "--n": wordFit(r.word).m } as React.CSSProperties}>
                    {r.word}
                  </span>
                  <span className="prices-cost">
                    <span className="prices-num">
                      {p.pre && <i>{p.pre}</i>}
                      {p.unit ? (
                        <span>
                          {p.value}
                          <u>{p.unit}</u>
                        </span>
                      ) : (
                        p.value
                      )}
                      <Out />
                    </span>
                    <span className="prices-note">
                      <b className="dl-sign-h">{r.title}</b>
                      <span className="dl-sign-term">{r.term}</span>
                      {r.note}
                    </span>
                  </span>
                </span>
                {r.scene ? (
                  <SceneCrop slug={r.scene} className="prices-mini dl-mini-scene" h={132} />
                ) : (
                  <span className="prices-mini" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" loading="lazy" decoding="async" src={`${r.img}-240.webp`} width={240} height={519} />
                  </span>
                )}
              </a>
              <span className="prices-slot" aria-hidden="true">
                <span className="prices-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    loading="lazy"
                    decoding="async"
                    src={`${r.img}-240.webp`}
                    srcSet={`${r.img}-240.webp 240w, ${r.img}-400.webp 400w`}
                    sizes="150px"
                    width={240}
                    height={519}
                  />
                  <span className="prices-cap">
                    {r.cap}
                    <span>{r.host}</span>
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** вопросы аккордеоном: details работает без скрипта, текст ответа в разметке и для поиска */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <ul className="dl-qs">
      {items.map((f) => (
        <li key={f.q}>
          <details className="dl-q">
            <summary>
              <h3>{f.q}</h3>
              <i className="dl-x" aria-hidden="true" />
            </summary>
            <div className="dl-a">
              <p>{f.a}</p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

/** блок потока: подпись слева (на десктопе липнет), содержимое справа */
export function Block({
  id,
  label,
  heading = true,
  children,
  aside,
  className,
}: {
  id: string;
  label: string;
  heading?: boolean;
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  const L = heading ? "h2" : "p";
  return (
    <section className={`dl-block${className ? ` ${className}` : ""}`} id={id} aria-labelledby={heading ? `${id}-t` : undefined}>
      <div className="dl-side">
        <L className="dl-label" id={heading ? `${id}-t` : undefined}>
          {label}
        </L>
        {aside}
      </div>
      <div className="dl-body">{children}</div>
    </section>
  );
}

/**
 * финал страницы: крупный вопрос, одна строка, кнопка и почта; под линейкой "хватит одной фразы..."
 * и свёрнутая форма для тех, у кого нет Telegram
 */
export function FinalCta({ word, text, msg }: { word: string; text: string; msg?: string }) {
  return (
    <section className="dl-final" id="dl-final" aria-labelledby="dl-final-t">
      <div className="dl-final-l">
        <Word as="h2" text={word} id="dl-final-t" />
      </div>
      <div className="dl-final-r">
        <p className="dl-final-p">{tie(text)}</p>
        <div className="dl-final-act">
          <TgButton text={msg} />
          <a className="dl-final-mail" href={`mailto:${SITE.email}`}>
            или на почту {SITE.email}
          </a>
        </div>
      </div>
      <div className="dl-final-sub">
        <OnePhrase />
        <LeadForm mode="contact" place="final" />
      </div>
    </section>
  );
}

