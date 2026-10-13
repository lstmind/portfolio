import { plural } from "@/lib/content";
import { HOME_REVIEWS, KWORK_URL, PROFI_URL, PROFI_STATS, quoteParts } from "@/lib/reviews";
import { ReviewsIsland } from "./islands";
import "./reviews.css";

const NB = " ";
const pad = (i: number) => String(i + 1).padStart(2, "0");
const reviewsWord = (n: number) => plural(n, ["отзыв", "отзыва", "отзывов"]);

const Star = () => (
  <svg viewBox="0 0 20 20">
    <path fill="currentColor" d="M10 1.6l2.5 5.4 5.9.6-4.4 4 1.2 5.8L10 14.5l-5.2 2.9L6 11.6l-4.4-4 5.9-.6z" />
  </svg>
);
const Out = ({ hidden = false }: { hidden?: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden={hidden || undefined}>
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);

/**
 * отзывы: слева общее число как предмет, под ним две площадки рядом, у каждой свой рейтинг и ссылка;
 * справа одна цитата крупно. kwork: живое число отзывов Kwork (lib/kwork.ts), Профи из снимка lib/reviews.ts.
 */
export function Reviews({ kwork }: { kwork: number }) {
  const profi = PROFI_STATS.count;
  const total = kwork + profi;
  const n = HOME_REVIEWS.length;
  const plats = [
    { href: KWORK_URL, name: "Kwork", rating: "5.0", ratingSr: "5.0", count: kwork },
    { href: PROFI_URL, name: "Профи", rating: PROFI_STATS.rating.replace(".", ","), ratingSr: PROFI_STATS.rating.replace(".", ","), count: profi },
  ];
  return (
    <section className="s-reviews" id="reviews" aria-labelledby="reviews-title">
      <header className="reviews-head">
        <h2 id="reviews-title">Отзывы</h2>
        <p>Слово в слово, с Kwork и Профи</p>
      </header>

      <div className="reviews-body">
        <div className="reviews-score">
          <p className="reviews-num">
            <span className="reviews-sr">
              {total} {reviewsWord(total)} на двух площадках
            </span>
            {String(total)
              .split("")
              .map((d, i) => (
                <span className="reviews-d" aria-hidden="true" key={i}>
                  {d}
                </span>
              ))}
          </p>

          <ul className="reviews-plat">
            {plats.map((p) => (
              <li key={p.name}>
                <a
                  className="reviews-pf"
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${p.name}: рейтинг ${p.ratingSr} из 5, ${p.count} ${reviewsWord(p.count)}, открыть профиль`}
                >
                  <span className="reviews-pf-r" aria-hidden="true">
                    <Star />
                    {p.rating}
                  </span>
                  <span className="reviews-pf-t" aria-hidden="true">
                    {p.count} {reviewsWord(p.count)}{" "}
                    <span className="reviews-nw">
                      на{NB}
                      {p.name}
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
                      </svg>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <ol className="reviews-index" aria-label="Кто оставил отзыв">
            {HOME_REVIEWS.map((r, i) => (
              <li key={i}>
                <button className="reviews-who" type="button" aria-controls={`reviews-${i + 1}`} aria-current={i === 0 ? "true" : "false"}>
                  <i>{pad(i)}</i>
                  {r.author}
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="reviews-stage">
          {/* тексты слово в слово с площадок, орфография клиентов; сокращения целыми предложениями, вырезанная середина отмечена многоточием */}
          <div className="reviews-track" role="region" aria-roledescription="карусель" aria-label="Отзывы клиентов" tabIndex={0}>
            {HOME_REVIEWS.map((r, i) => (
              <figure
                className={i === 0 ? "reviews-card is-on" : "reviews-card"}
                id={`reviews-${i + 1}`}
                data-len={r.len}
                aria-roledescription="слайд"
                aria-label={`${i + 1} из ${n}`}
                key={i}
              >
                <p className="reviews-word" aria-hidden="true">
                  {r.word}
                </p>
                <blockquote>
                  <p className="reviews-q">{quoteParts(r.quote).map((t, j) => (j % 2 ? <mark key={j}>{t}</mark> : t))}</p>
                </blockquote>
                <figcaption>
                  <b>{r.author}</b>
                  <span>{r.label}</span>
                  <a className="reviews-src" href={r.src === "kwork" ? KWORK_URL : PROFI_URL} target="_blank" rel="noopener">
                    {r.src === "kwork" ? "Kwork" : "Профи"}
                    <Out hidden />
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="reviews-nav">
            <p className="reviews-ctr" aria-hidden="true">
              <span className="reviews-ctr-n">
                <span>01</span>
              </span>
              <em>/ {n}</em>
            </p>
            <span className="reviews-ticks" aria-hidden="true">
              {HOME_REVIEWS.map((_, i) => (
                <i className={i === 0 ? "is-on" : undefined} key={i} />
              ))}
            </span>
            <p className="reviews-sr" aria-live="polite" id="reviews-live">
              Отзыв 1 из {n}
            </p>
            <div className="reviews-arrows">
              <button className="reviews-arrow" type="button" data-reviews-step="-1" aria-label="Предыдущий отзыв">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M16 10H4.5M9 5l-5 5 5 5" />
                </svg>
              </button>
              <button className="reviews-arrow" type="button" data-reviews-step="1" aria-label="Следующий отзыв">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 10h11.5M11 5l5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <ReviewsIsland />
    </section>
  );
}
