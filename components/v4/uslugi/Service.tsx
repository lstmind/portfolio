import type { ServicePage } from "@/lib/services";
import type { IndustryPage } from "@/lib/industries";
import { PROCESS_STEPS, liveSitesWord } from "@/lib/home";
import { PROJECTS_TOTAL, plural } from "@/lib/content";
import { AUDIT_DIAG, auditLink, tgText, type Audit } from "@/lib/cta";
import { AuditButton, AuditSub } from "../cta/Strip";
import { KWORK_STATS, PROFI_STATS } from "@/lib/reviews";
import { Figure, IMG } from "../Figure";
import { Block, Crumbs, Go, Out, TgButton, Word } from "./bits";
import { splitPrice, splitTerm, wordOf, type CaseCard, type WorkCard } from "./data";
import { ADMIN_SCREEN, BOT_HOLE, BOT_SCREEN, ill, nicheCrop, sceneOf, type PickedReview } from "./scenes";
import { ArtImg } from "./Art";
import { ChatFeed, Kanban, LANGS } from "./Demos";
import { tie } from "../typo";

/** высота фигуры первого экрана как у позы 6: ширина в srcset по ширине холста */
const HERO_SIZES = (w: number) => `(max-width: 699px) ${Math.round((112 * w) / 400)}px, min(${((30 * w) / 400).toFixed(1)}vh, ${Math.round((300 * w) / 400)}px)`;
const screenBox = (b: { l: number; t: number; w: number; h: number }) =>
  ({ left: `${b.l}%`, top: `${b.t}%`, width: `${b.w}%`, height: `${b.h}%` }) as React.CSSProperties;

/**
 * Поза 6 показывает ноутбук экраном к вам, на экране едет живой сайт из работ услуги.
 * У типов сайтов это первый экран, у остальных услуг стоит рядом с "Когда это нужно".
 * lang: на экране первый экран sealtsiia.ee, язык меняет переключатель в механике.
 */
export function ShotFigure({ shot, lang = false, eager = false }: { shot: CaseCard; lang?: boolean; eager?: boolean }) {
  const host = lang ? "sealtsiia.ee" : shot.host;
  const href = lang ? "https://sealtsiia.ee/ru/" : shot.href;
  return (
    <figure className={eager ? "u-hero-fig" : "u-shot-fig"}>
      <span className="u-fig-box">
        <Figure
          pose="j6"
          alt="Алексей показывает ноутбук экраном к вам"
          sizes={eager ? "(max-width: 699px) 128px, min(30vh, 300px)" : "(max-width: 699px) 130px, 240px"}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
        />
        <a className={`u-screen${lang ? " u-screen--lang" : ""}`} href={href} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true">
          {lang ? (
            LANGS.map((l, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={l.k}
                data-l={l.k}
                className={i === 0 ? "on" : undefined}
                alt=""
                decoding="async"
                loading={eager ? "eager" : "lazy"}
                src={`/img/v4/uslugi/seal-${l.k}-d-400.webp`}
                width={400}
                height={214}
              />
            ))
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" width={400} height={shot.tallH} decoding="async" loading={eager ? "eager" : "lazy"} src={`/img/tall/${shot.tall}-400.webp`} />
          )}
        </a>
      </span>
      <figcaption>
        <a className="u-cap" href={href} target="_blank" rel="noopener">
          <span>на экране</span>
          <b>{host}</b>
          <Out />
        </a>
      </figcaption>
    </figure>
  );
}

const NB = " ";

/** "Пишу со страницы ..." первым сообщением: сразу видно, с какой услуги пришли */
export const tgMsg = (h1: string) => tgText({ kind: "service", name: h1 });

/**
 * Первый экран услуги: крупное слово, название услуги (h1), цена и срок вывеской, одна строка ответа, кнопка.
 * Справа персонаж показывает ноутбук, на экране едет живой сайт из работ этой услуги.
 * audit: на услугах с бесплатным аудитом вторая кнопка "Прислать сайт на аудит" (контуром, красной остаётся Telegram),
 * под линейкой первого экрана условия одной строкой и запасная форма.
 */
export function ServiceHero({ s, shot, audit }: { s: ServicePage; shot: CaseCard; audit?: Audit | null }) {
  const scene = sceneOf(s.slug);
  const p = splitPrice(s.price.value);
  const t = splitTerm(s.term.value);
  return (
    <>
      <section className={`u-hero${audit ? " u-hero--audit" : ""}`} id="u-hero" aria-labelledby="u-h1">
        <div className="u-hero-txt">
          <Crumbs
            items={[
              { name: "Главная", href: "/" },
              { name: "Услуги", href: "/uslugi" },
            ]}
          />
          <h1 className="u-kicker" id="u-h1">
            {s.heading ?? s.h1}
          </h1>
          <Word text={wordOf(s.slug)} />

          <dl className="u-facts">
            <div className="u-fact">
              <dt>{s.price.label}</dt>
              <dd>
                <span className="u-num">
                  {p.pre && <i>{p.pre}</i>}
                  <span>
                    {p.value}
                    {p.unit && <u>{p.unit}</u>}
                  </span>
                </span>
                <span className="u-fnote">{tie(s.price.note)}</span>
              </dd>
            </div>
            <div className="u-fact">
              <dt>{s.term.label}</dt>
              <dd>
                <span className="u-num">
                  {t.pre && <i>{t.pre}</i>}
                  <span>{t.value}</span>
                </span>
                <span className="u-fnote">{tie(s.term.note)}</span>
              </dd>
            </div>
          </dl>

          <p className="u-answer">{tie(s.answer)}</p>
          <div className="u-hero-act">
            <TgButton text={tgMsg(s.h1)} className="u-cta" />
            {audit && <AuditButton audit={audit} className="ct-btn--hero" />}
            <span className="u-hero-side">Самозанятый: договор, акт и{NB}чек</span>
          </div>
        </div>

        {scene ? (
          <figure className="u-hero-fig">
            <span className="u-fig-box" style={{ aspectRatio: `${scene.w} / ${scene.h}` }}>
              {s.slug === "telegram-bot" ? (
                <>
                  {/* экран телефона прозрачный: переписка лежит под картинкой, пальцы и рамка остаются сверху */}
                  <span className="u-hole" style={screenBox(BOT_SCREEN)} aria-hidden="true">
                    <ChatFeed mini />
                  </span>
                  <ArtImg art={BOT_HOLE} alt={scene.alt} sizes={HERO_SIZES(400)} loading="eager" fetchPriority="high" className="u-fig-top" />
                </>
              ) : (
                <ArtImg art={scene} alt={scene.alt} sizes={HERO_SIZES(scene.w)} loading="eager" fetchPriority="high" />
              )}
              {s.slug === "admin-panel-i-crm" && (
                <span className="u-tab" style={screenBox(ADMIN_SCREEN)} aria-hidden="true">
                  <Kanban mini />
                </span>
              )}
            </span>
          </figure>
        ) : (
          <ShotFigure shot={shot} lang={s.slug === "mnogoyazychnyy-sayt"} eager />
        )}
      </section>
      {audit && <AuditSub audit={audit} />}
    </>
  );
}

/**
 * работы услуги карточками, как в карусели героя: серые в покое, цвет при наведении, в фокусе и у середины экрана на телефоне.
 * У разбора картинка и имя ведут на /works/<slug>, у живого сайта без разбора на сам сайт
 */
export function CaseCards({ cards }: { cards: WorkCard[] }) {
  return (
    <ul className="u-cards">
      {cards.map((c) => {
        const own = c.slug ? { href: `/works/${c.slug}` } : { href: c.href, target: "_blank", rel: "noopener" };
        return (
          <li className="u-card" key={c.slug ?? c.host}>
            <a className="u-card-img" {...own} tabIndex={-1} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                loading="lazy"
                decoding="async"
                src={`${IMG}${c.card}-240.webp`}
                srcSet={`${IMG}${c.card}-240.webp 240w, ${IMG}${c.card}-400.webp 400w`}
                sizes="(max-width: 699px) 62vw, 240px"
                width={240}
                height={519}
              />
            </a>
            <p className="u-card-name">
              <a {...own}>
                {c.title}
                <span className="sr">{c.slug ? ", разбор проекта" : `, сайт ${c.host}`}</span>
              </a>
            </p>
            <p className="u-card-kind">{c.kind}</p>
            <p className="u-card-links">
              {/* у сайта без разбора имя уже ведёт на сайт: адрес второй раз в порядок Tab не ставим */}
              <a href={c.href} target="_blank" rel="noopener" {...(c.slug ? {} : { tabIndex: -1, "aria-hidden": true })}>
                {c.host}
                <Out />
              </a>
            </p>
          </li>
        );
      })}
    </ul>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * как идёт работа: четыре шага главной компактно, крупным словом и строкой.
 * children: оплата и гарантия (Pay) сразу под шагами: страх "возьмёт деньги и пропадёт" снимается там, где речь о смете
 */
export function Steps({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <ol className="u-steps">
        {PROCESS_STEPS.map((st, i) => (
          <li className="u-step" key={st.word}>
            <Figure pose={st.pose} alt="" sizes="(max-width: 699px) 40px, 52px" className="u-step-fig" />
            <span className="u-step-n">{pad(i + 1)}</span>
            <h3 className="u-step-w">{st.word}</h3>
            <p>{st.line}</p>
          </li>
        ))}
      </ol>
      {children}
      <p className="u-more">
        <a href="/#process">
          Каждый шаг подробно
          <Go />
        </a>
      </p>
    </>
  );
}

/** крупная цифра из lib: сколько живых сайтов в работах */
export function BigCount() {
  return (
    <a className="u-count" href="/works">
      <b>{PROJECTS_TOTAL}</b>
      <span>
        {liveSitesWord()} в{NB}работах, каждый открывается
        <Go />
      </span>
    </a>
  );
}

/** отзыв как есть, с тем, что клиент заказывал, и ссылкой на площадку */
export function Quote({ r }: { r: PickedReview }) {
  return (
    <figure className={`u-rev${r.text.length > 240 ? " u-rev--long" : ""}`}>
      <blockquote>
        <p>{r.text}</p>
      </blockquote>
      <figcaption>
        <b>{r.author}</b>
        <span>{r.what}</span>
        <a href={r.url} target="_blank" rel="noopener">
          {r.src}
          <Out />
        </a>
      </figcaption>
    </figure>
  );
}

const INVITE = ill("h-priglashaet", 476);

/**
 * Ниши: у строки поясной кроп сцены этой ниши, серый в покое и цветной под мышью или у середины экрана.
 * Слева на десктопе персонаж приглашающе показывает ладонью на список.
 */
export function Niches({ niches, intro, id = "u-niches" }: { niches: IndustryPage[]; intro?: string; id?: string }) {
  return (
    <Block
      id={id}
      label="Под вашу нишу"
      className="u-nb"
      aside={
        <figure className="u-inv" aria-hidden="true">
          <ArtImg art={INVITE} sizes="(max-width: 699px) 1px, 200px" />
        </figure>
      }
    >
      {intro && <p className="u-intro">{intro}</p>}
      <ul className="u-niches">
        {niches.map((n) => {
          const c = nicheCrop(n.slug);
          return (
            <li key={n.slug}>
              <a href={`/dlya/${n.slug}`}>
                <span className="u-nc" aria-hidden="true">
                  <ArtImg art={c.art} sizes="110px" style={c.style} />
                </span>
                <span className="u-nt">
                  <b>{n.h1}</b>
                  <span>{n.short}</span>
                </span>
                <i>{n.price.value}</i>
              </a>
            </li>
          );
        })}
      </ul>
    </Block>
  );
}

/** короткий отзыв крупно: разрез между текстовыми блоками */
export function ShortQuote({ r }: { r: PickedReview }) {
  return (
    <figure className="u-sq">
      <blockquote>
        <p>{r.text}</p>
      </blockquote>
      <figcaption>
        <b>{r.author}</b>
        <a href={r.url} target="_blank" rel="noopener">
          {r.src}
          <Out />
        </a>
      </figcaption>
    </figure>
  );
}

/** рейтинг площадки, с которой отзыв: крупной цифрой рядом с цитатой */
export function Rating({ src }: { src: PickedReview["src"] }) {
  const kw = src === "Kwork";
  const n = kw ? KWORK_STATS.positive + KWORK_STATS.negative : PROFI_STATS.count;
  return (
    <p className="u-count u-count--rate">
      <b>{kw ? `${KWORK_STATS.positive}/${n}` : PROFI_STATS.rating.replace(".", ",")}</b>
      <span>
        {kw
          ? `положительных отзывов на${NB}Kwork`
          : `рейтинг на${NB}Профи, ${n}${NB}${plural(n, ["отзыв", "отзыва", "отзывов"])}`}
      </span>
    </p>
  );
}

/**
 * Частый случай внутри услуги своим блоком (на починке: "сайт заражён или взломан").
 * Справа строка крупно, признаки пилюлями и шаги работы той же линейкой с номерами, что "Что входит".
 * Слева вместо рисунка цена и срок: рядом с "Когда это нужно" уже стоит персонаж, второй подряд читался бы повтором.
 */
export function Focus({ f }: { f: NonNullable<ServicePage["focus"]> }) {
  const p = splitPrice(f.price.value);
  const t = splitTerm(f.term.value);
  return (
    <Block
      id={f.id}
      label={f.label}
      className="u-focus"
      aside={
        <div className="u-fc-side">
          <dl className="u-fc-facts">
            <div className="u-fact">
              <dt>Цена</dt>
              <dd>
                <span className="u-num">
                  {p.pre && <i>{p.pre}</i>}
                  <span>
                    {p.value}
                    {p.unit && <u>{p.unit}</u>}
                  </span>
                </span>
                <span className="u-fnote">{tie(f.price.note)}</span>
              </dd>
            </div>
            <div className="u-fact">
              <dt>Срок</dt>
              <dd>
                <span className="u-num">
                  {t.pre && <i>{t.pre}</i>}
                  <span>{t.value}</span>
                </span>
                <span className="u-fnote">{tie(f.term.note)}</span>
              </dd>
            </div>
          </dl>
          <p className="u-more" data-goal-place="focus">
            <a {...auditLink(AUDIT_DIAG)}>
              {AUDIT_DIAG.button}
              <Out />
            </a>
          </p>
        </div>
      }
    >
      <p className="u-fc-lead">{tie(f.lead)}</p>
      <h3 className="u-fc-h">Признаки</h3>
      <ul className="u-fc-signs">
        {f.signs.map((x) => (
          <li key={x}>{tie(x)}</li>
        ))}
      </ul>
      <h3 className="u-fc-h">Что делаю</h3>
      <ol className="u-inc">
        {f.does.map((x) => (
          <li key={x}>{tie(x)}</li>
        ))}
      </ol>
    </Block>
  );
}
