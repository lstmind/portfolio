import { SITE } from "@/lib/content";
import { tgHref } from "@/lib/cta";
import { LeadForm } from "@/components/v4/cta/LeadForm";
import { OnePhrase } from "@/components/v4/cta/Strip";
import { tie } from "@/components/v4/typo";
import { wordFit } from "./data";

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
    <nav className="u-crumbs" aria-label="Хлебные крошки">
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
export function Word({ text, as: Tag = "p", id, className }: { text: string; as?: "p" | "h1" | "h2"; id?: string; className?: string }) {
  const fit = wordFit(text);
  let k = 0;
  return (
    <Tag
      className={`u-word${className ? ` ${className}` : ""}`}
      id={id}
      style={{ "--n": fit.d, "--nm": fit.m } as React.CSSProperties}
      aria-hidden={Tag === "p" ? true : undefined}
      aria-label={Tag === "p" ? undefined : text}
    >
      <span className="u-word-in">
        {text
          .split(" ")
          .map((w, wi) => (
            <span className="u-wd" key={wi}>
              {wi > 0 && " "}
              <span className="u-wd-in">
                {[...w].map((ch, i) => (
                  <span className="u-ch" style={{ "--i": k++ } as React.CSSProperties} key={i}>
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

/** красная кнопка Telegram, как у героя главной; text: первое сообщение */
export function TgButton({ text, className = "" }: { text?: string; className?: string }) {
  const href = tgHref(text);
  return (
    <a className={`u-tg ${className}`} href={href} target="_blank" rel="noopener">
      Написать в Telegram
      <Out />
    </a>
  );
}

/**
 * финал страницы: крупный вопрос, одна строка, кнопка и почта; под линейкой "хватит одной фразы..."
 * и свёрнутая форма для тех, у кого нет Telegram
 */
export function FinalCta({ word, text, msg }: { word: string; text: string; msg?: string }) {
  return (
    <section className="u-final" id="u-final" aria-labelledby="u-final-t">
      <div className="u-final-l">
        <Word as="h2" text={word} id="u-final-t" />
      </div>
      <div className="u-final-r">
        <p className="u-final-p">{tie(text)}</p>
        <div className="u-final-act">
          <TgButton text={msg} />
          <a className="u-final-mail" href={`mailto:${SITE.email}`}>
            или на почту {SITE.email}
          </a>
        </div>
      </div>
      <div className="u-final-sub">
        <OnePhrase />
        <LeadForm mode="contact" place="final" />
      </div>
    </section>
  );
}

/** вопросы аккордеоном: details работает без скрипта, текст ответа в разметке и для поиска */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <ul className="u-qs">
      {items.map((f) => (
        <li key={f.q}>
          <details className="u-q">
            <summary>
              <h3>{f.q}</h3>
              <i className="u-x" aria-hidden="true" />
            </summary>
            <div className="u-a">
              <p>{f.a}</p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

/**
 * блок страницы: подпись слева, содержимое справа; на телефоне подпись сверху.
 * aside: визуал в левой колонке под подписью, липнет, пока виден блок; на телефоне полосой между подписью и текстом.
 */
export function Block({
  id,
  label,
  children,
  className = "",
  aside,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
  aside?: React.ReactNode;
}) {
  return (
    <section className={`u-block${aside ? " u-block--aside" : ""} ${className}`} id={id} aria-labelledby={`${id}-t`}>
      <div className="u-side">
        <h2 className="u-label" id={`${id}-t`}>
          {label}
        </h2>
        {aside && <div className="u-aside">{aside}</div>}
      </div>
      <div className="u-body">{children}</div>
    </section>
  );
}
