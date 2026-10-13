import { PROJECTS_TOTAL } from "@/lib/content";
import { WORKS_FEATURED, WORKS_REST, liveSitesWord } from "@/lib/home";
import { IMG } from "../Figure";
import { WorksIsland } from "./islands";
import "./works.css";

const pad = (n: number) => String(n).padStart(2, "0");

const Out = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);
const Next = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M2.5 8h10M8.5 4l4 4-4 4" />
  </svg>
);

/** сайты: на десктопе сцена закреплена и сайты идут барабаном, на телефоне лента карточек; ниже строка остальных адресов */
export function Works() {
  const total = PROJECTS_TOTAL;
  const restFrom = WORKS_FEATURED.length + 1;
  const [l1, l2] = liveSitesWord(total).split(" ");
  return (
    <section className="s-works" id="works" aria-labelledby="works-h">
      <h2 className="s-works__sr" id="works-h">
        Сайты, которые я сделал
      </h2>
      <div className="s-works__track">
        <div className="s-works__stage">
          <ol className="s-works__list">
            {WORKS_FEATURED.map((w, i) => (
              <li className="s-works__item" key={w.href}>
                <div className="s-works__text">
                  <div className="s-works__head">
                    <p className="s-works__num">
                      <b>{pad(i + 1)}</b> / {total}
                    </p>
                    <h3 className="s-works__name">
                      <a href={`/works/${w.case}`} aria-label={`${w.name}, разбор работы`}>
                        {w.name}
                      </a>
                    </h3>
                  </div>
                  <div className="s-works__body">
                    <p className="s-works__meta">{w.meta}</p>
                    <p className="s-works__line">{w.line}</p>
                    <p className="s-works__links">
                      <a className="s-works__host" href={w.href} target="_blank" rel="noopener">
                        {w.host}
                        <Out />
                      </a>
                      <a className="s-works__case" href={`/works/${w.case}`}>
                        разбор
                        <Next />
                      </a>
                    </p>
                  </div>
                </div>
                <a
                  className="s-works__card"
                  href={w.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Открыть сайт ${w.host}, в новой вкладке`}
                  style={{ "--works-dur": `${w.dur}s` } as React.CSSProperties}
                >
                  <span className="s-works__screen">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      data-src={`${IMG}${w.shot}`}
                      width={390}
                      height={w.shotH}
                      alt={`${w.name}, мобильная версия ${w.what} целиком`}
                      decoding="async"
                      draggable={false}
                    />
                  </span>
                  <span className="s-works__fog" />
                  <span className="s-works__pill" aria-hidden="true">
                    {w.host}
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <p className="s-works__count" aria-hidden="true">
            <b className="s-works__cur">01</b> / {total}
          </p>
          <ol className="s-works__toc" aria-hidden="true">
            {WORKS_FEATURED.map((w, i) => (
              <li key={w.href}>
                <button type="button" tabIndex={-1}>
                  <i>{pad(i + 1)}</i>
                  <span>{w.name}</span>
                </button>
              </li>
            ))}
            <li className="s-works__toc-more">
              <a href="#works-more" tabIndex={-1}>
                <i>
                  {pad(restFrom)}–{total}
                </i>
                остальные сайты
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M8 2.5v10M4 8.5l4 4 4-4" />
                </svg>
              </a>
            </li>
          </ol>
        </div>
      </div>

      <div className="s-works__more" id="works-more">
        <p className="s-works__total">
          <b>{total}</b>
          <span>
            {l1} {l2},
            <br />
            каждый открывается
          </span>
        </p>
        <div className="s-works__cloud">
          <ul className="s-works__hosts" aria-label="Остальные сайты">
            {WORKS_REST.map((s) => (
              <li key={s.host}>
                <a href={s.href} target="_blank" rel="noopener">
                  {s.host}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <a className="s-works__all" href="/works">
          Все работы и разборы
          <Next />
        </a>
      </div>
      <WorksIsland />
    </section>
  );
}
