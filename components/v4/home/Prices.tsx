import { PRICES } from "@/lib/home";
import { IMG } from "../Figure";
import { PricesIsland } from "./islands";
import "./prices.css";

const Out = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);

/** прайс-вывеска: крупное слово, цена на той же линии, у правого края серая карточка живого сайта */
export function Prices() {
  return (
    <section className="s-prices" id="prices" aria-labelledby="prices-title">
      <header className="prices-head">
        <h2 id="prices-title">Что беру и почём</h2>
        <p>Самозанятый: договор, акт и чек</p>
      </header>

      <ol className="prices-list">
        {PRICES.map((r) => (
          <li className="prices-row" key={r.slug}>
            <a className="prices-link" href={r.href}>
              <span className="prices-txt">
                <span className="prices-word" data-w={r.word}>
                  {r.word}
                </span>
                <span className="prices-cost">
                  <span className="prices-num">
                    <i>{r.price.pre}</i>
                    {r.price.unit ? (
                      <span>
                        {r.price.value}
                        <u>{r.price.unit}</u>
                      </span>
                    ) : (
                      r.price.value
                    )}
                    <Out />
                  </span>
                  <span className="prices-note">{r.note}</span>
                </span>
              </span>
              <span className="prices-mini" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" loading="lazy" decoding="async" src={`${IMG}${r.img}-240.webp`} width={240} height={519} />
              </span>
            </a>
            <span className="prices-slot" aria-hidden="true">
              <span className="prices-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  loading="lazy"
                  decoding="async"
                  src={`${IMG}${r.img}-240.webp`}
                  srcSet={`${IMG}${r.img}-240.webp 240w, ${IMG}${r.img}-400.webp 400w`}
                  sizes="150px"
                  width={240}
                  height={519}
                />
                <span className="prices-cap">
                  {r.name}
                  <span>{r.cap}</span>
                </span>
              </span>
            </span>
          </li>
        ))}
      </ol>

      <a className="prices-more" href="/uslugi">
        Остальное и чего я не делаю
        <Out />
      </a>
      <PricesIsland />
    </section>
  );
}
