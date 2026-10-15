import { SITE } from "@/lib/content";
import { AUDIT, AUDIT_DIAG, ONE_PHRASE, STRIP, auditLink, auditTerms, tgHref, type Audit } from "@/lib/cta";
import { ArtImg } from "../uslugi/Art";
import { ill, pose } from "../uslugi/scenes";
import { tie } from "../typo";
import { LeadForm } from "./LeadForm";
import "./strip.css";

/*
 * Полосы посередине страниц и кнопки аудита. Один язык с финалами: кнопка язычком стоит на линейке,
 * под линейкой мелкая строка и свёрнутая запасная форма. Префикс ct-, стили в strip.css, своих скриптов нет:
 * форму ведёт LeadForm, цели шлёт общий обработчик кликов (components/v4/goals.tsx) по data-audit и data-goal-place.
 */

const Out = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);

/** персонаж у полосы аудита: с лупой; где лупа уже стоит на первом экране (тех. SEO), с телефоном */
const ARTS = {
  loupe: { art: ill("s-seo", 400), alt: "" },
  phone: { art: pose("j4"), alt: "" },
} as const;
export type AuditArt = keyof typeof ARTS;

/**
 * Полоса бесплатного аудита: подпись, крупная фраза, что пришлю и в каком виде, кнопка в Telegram с готовым текстом,
 * под линейкой условия одной строкой и запасная форма "сайт и куда ответить".
 * page: полоса стоит в потоке главной (свои поля по краям), а не внутри раздела с полями.
 */
export function AuditStrip({
  audit = AUDIT,
  place,
  id,
  art = "loupe",
  page = false,
}: {
  audit?: Audit;
  place: string;
  id: string;
  art?: AuditArt | null;
  page?: boolean;
}) {
  const a = art ? ARTS[art] : null;
  return (
    <section
      className={`ct-strip ct-strip--audit${page ? " ct-strip--page" : ""}${a ? " ct-strip--fig" : ""}`}
      id={id}
      aria-labelledby={`${id}-t`}
      data-goal-place={place}
    >
      <div className="ct-main">
        <div className="ct-l">
          <h2 className="ct-label" id={`${id}-t`}>
            {audit.title}
          </h2>
          {a && (
            <figure className="ct-fig" aria-hidden="true">
              <ArtImg art={a.art} sizes="(max-width: 699px) 96px, 150px" />
            </figure>
          )}
        </div>
        <div className="ct-r">
          <p className="ct-word">{audit.word}</p>
          <p className="ct-text">{tie(audit.text)}</p>
          <p className="ct-small">{tie(audit.result)}</p>
          <div className="ct-act">
            <a className="ct-btn ct-btn--ink" {...auditLink(audit)}>
              {audit.button}
              <Out />
            </a>
          </div>
        </div>
      </div>
      <div className="ct-sub">
        <p className="ct-terms">{tie(audit.terms)}</p>
        <LeadForm mode="audit" place={place} diag={audit === AUDIT_DIAG} />
      </div>
    </section>
  );
}

/**
 * Полоса "цена, срок, кнопка" посередине страницы услуги: строка из данных ("Лендинг под рекламу от 40 000 ₽, 3–5 дней"),
 * красная кнопка Telegram с сообщением страницы, под ней мелко "или почта · оставить контакт" (раскрывает форму).
 */
export function PriceStrip({ line, tg, id = "ct-price" }: { line: string; tg: string; id?: string }) {
  return (
    <section className="ct-strip ct-strip--price" id={id} aria-labelledby={`${id}-t`} data-goal-place="strip">
      <div className="ct-main">
        <div className="ct-l">
          <h2 className="ct-label" id={`${id}-t`}>
            {STRIP.label}
          </h2>
        </div>
        <div className="ct-r">
          <p className="ct-price">{tie(line)}</p>
          <div className="ct-act">
            <a className="ct-btn ct-btn--red" href={tgHref(tg)} target="_blank" rel="noopener">
              Написать в Telegram
              <Out />
            </a>
          </div>
        </div>
      </div>
      <div className="ct-sub">
        <LeadForm
          mode="contact"
          place="strip"
          alt={STRIP.alt}
          pre={
            <>
              {STRIP.or} <a href={`mailto:${SITE.email}`}>{STRIP.mail}</a> ·{" "}
            </>
          }
        />
      </div>
    </section>
  );
}

/** вторая кнопка первого экрана: "Прислать сайт на аудит", контуром, красной остаётся Telegram */
export function AuditButton({ audit = AUDIT, className = "" }: { audit?: Audit; className?: string }) {
  return (
    <a className={`ct-btn ct-btn--line ${className}`.trim()} {...auditLink(audit)} data-goal-place="hero">
      {audit.button}
      <Out />
    </a>
  );
}

/**
 * строка под линейкой первого экрана у кнопки аудита: условия и запасная форма.
 * На телефоне кнопка аудита из ряда героя прячется, а здесь встаёт ссылкой под красной кнопкой:
 * первой в кадре остаётся Telegram, аудит идёт вторым действием, а не над ним.
 */
export function AuditSub({ audit = AUDIT, className = "" }: { audit?: Audit; className?: string }) {
  return (
    <div className={`ct-hsub ${className}`.trim()} data-goal-place="hero">
      <p className="ct-hlink">
        <a {...auditLink(audit)}>
          {audit.button}
          <Out />
        </a>
      </p>
      <p className="ct-terms">{tie(auditTerms(audit))}</p>
      <LeadForm mode="audit" place="hero" diag={audit === AUDIT_DIAG} />
    </div>
  );
}

/** строка аудита на нише: "Уже есть сайт? Пришлите ссылку, скажу, что с ним не так." ссылкой в Telegram. place: место для целей */
export function AuditLine({ text, place, className = "" }: { text: string; place: string; className?: string }) {
  return (
    <p className={`ct-line ${className}`.trim()} data-goal-place={place}>
      <a {...auditLink(AUDIT)}>
        {tie(text)}
        <Out />
      </a>
    </p>
  );
}

/** под главной кнопкой финала: "Хватит одной фразы и ссылки, остальное спрошу сам." */
export function OnePhrase({ className = "" }: { className?: string }) {
  return <p className={`ct-one ${className}`.trim()}>{tie(ONE_PHRASE)}</p>;
}
