import type { ServicePage } from "@/lib/services";
import { IMG } from "../Figure";
import { firstCase, splitPrice, wordFit, wordOf } from "./data";
import { Out } from "./bits";
import { signArt } from "./scenes";
import "@/components/v4/home/prices.css";

/**
 * Прайс-вывеска главной (components/v4/home/Prices.tsx) с той же разметкой и тем же кодом поведения:
 * крупное слово, цена на той же линии, у правого края серая карточка живого сайта.
 * Здесь строками идут услуги из lib/services.ts. size="s": слова мельче, для блока "другие услуги".
 */
export function Sign({
  id,
  title,
  side,
  services,
  size,
  headingLevel = 2,
}: {
  id: string;
  title: string;
  side?: string;
  services: ServicePage[];
  size?: "s";
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  // кегль слов один на всю вывеску: по самому длинному слову, чтобы колонка цен не уехала за край
  const gn = Math.max(...services.map((s) => wordFit(wordOf(s.slug)).d));
  return (
    <section
      className={`s-prices u-sign${size ? " u-sign--s" : ""}`}
      id={id}
      aria-labelledby={`${id}-t`}
      style={{ "--gn": gn } as React.CSSProperties}
    >
      <header className="prices-head">
        <H id={`${id}-t`}>{title}</H>
        {side && <p>{side}</p>}
      </header>
      <ol className="prices-list">
        {services.map((s) => {
          const p = splitPrice(s.price.value);
          const c = firstCase(s);
          const word = wordOf(s.slug);
          const a = signArt(s.slug);
          return (
            <li className="prices-row" key={s.slug} data-fig={JSON.stringify({ src: a.src, srcSet: a.srcSet, w: a.w })}>
              <a className="prices-link" href={`/uslugi/${s.slug}`}>
                <span className="prices-txt">
                  <span className="prices-word" data-w={word} style={{ "--n": Math.max(5, ...word.split(" ").map((w) => w.length)) } as React.CSSProperties}>
                    {word}
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
                      <b className="u-sign-h1">{s.h1}</b>
                      <span className="u-sign-term">
                        {s.term.label.toLowerCase()} {s.term.value}
                      </span>
                      {s.short}
                    </span>
                  </span>
                </span>
                <span className="prices-mini" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" loading="lazy" decoding="async" src={`${IMG}${c.card}-240.webp`} width={240} height={519} />
                </span>
              </a>
              <span className="prices-slot" aria-hidden="true">
                <span className="prices-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    loading="lazy"
                    decoding="async"
                    src={`${IMG}${c.card}-240.webp`}
                    srcSet={`${IMG}${c.card}-240.webp 240w, ${IMG}${c.card}-400.webp 400w`}
                    sizes="150px"
                    width={240}
                    height={519}
                  />
                  <span className="prices-cap">
                    {c.title}
                    <span>{c.host}</span>
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
