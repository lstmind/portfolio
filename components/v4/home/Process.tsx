import { PROCESS_STEPS, PROCESS_SPEC } from "@/lib/home";
import { Figure, IMG } from "../Figure";
import { ProcessIsland } from "./islands";
import { tie } from "../typo";
import "./process.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** как это будет: четыре шага, четыре позы. десктоп: закреплённая сцена; телефон: лента со scroll-snap */
export function Process() {
  const n = PROCESS_STEPS.length;
  return (
    <section className="s-process" id="process" aria-labelledby="process-title">
      <div className="process-stage" id="process-stage">
        <div className="process-head">
          <h2 className="process-label" id="process-title">
            Как это будет
          </h2>
          <p className="process-count" aria-live="polite">
            <button className="process-arr" type="button" id="process-prev" aria-label="Предыдущий шаг" disabled>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="M10 3.5L5.5 8l4.5 4.5" />
              </svg>
            </button>
            <span>
              <span className="process-sr">Шаг </span>
              <b id="process-n">1</b> / {n}
            </span>
            <button className="process-arr" type="button" id="process-next" aria-label="Следующий шаг">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="M6 3.5L10.5 8 6 12.5" />
              </svg>
            </button>
          </p>
        </div>

        <ol className="process-steps" id="process-steps">
          {PROCESS_STEPS.map((s, i) => (
            <li className={i === 0 ? "process-step is-on is-pose" : "process-step"} data-process-i={i} key={s.word}>
              <figure className="process-fig">
                <Figure pose={s.pose} alt={s.alt} sizes="(max-width: 899px) 23vh, 36vh" />
                {s.screen && (
                  <a className="process-screen" href={s.screen.href} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" width={s.screen.w} height={s.screen.h} loading="lazy" decoding="async" src={`${IMG}${s.screen.img}.webp`} />
                  </a>
                )}
              </figure>
              <div className="process-txt">
                <h3 className="process-word">{s.word}</h3>
                <p className="process-line">{s.line}</p>
                {s.note && <p className="process-more process-note">{tie(s.note)}</p>}
                {s.screen && (
                  <p className="process-more">
                    <a
                      className="process-cap"
                      href={s.screen.href}
                      target="_blank"
                      rel="noopener"
                      aria-label={`На экране ${s.screen.href.replace(/^https?:\/\/|\/$/g, "")}, откроется в новой вкладке`}
                    >
                      <span>на экране</span>
                      <b>{s.screen.href.replace(/^https?:\/\/|\/$/g, "")}</b>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                        <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
                      </svg>
                    </a>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="process-floor" id="process-floor">
          {PROCESS_STEPS.map((s, i) => (
            <button
              className="process-seg"
              type="button"
              aria-label={`${pad(i + 1)} ${s.word.toLowerCase()}, шаг ${i + 1} из ${PROCESS_STEPS.length}`}
              style={i === 0 ? ({ "--process-fill": 1 } as React.CSSProperties) : undefined}
              aria-current={i === 0 ? "step" : undefined}
              key={s.word}
            >
              <span>
                {pad(i + 1)} {s.word.toLowerCase()}
              </span>
            </button>
          ))}
        </div>
        <p className="process-spec">
          <span className="process-sp process-sp-l">
            {PROCESS_SPEC.left[0]}
            <i> ·</i>
            <br /> {PROCESS_SPEC.left[1]}
          </span>
          <i> · </i>
          <span className="process-sp process-sp-r">
            {PROCESS_SPEC.right[0]}
            <i> ·</i>
            <br /> {PROCESS_SPEC.right[1]}
          </span>
        </p>
      </div>
      <ProcessIsland />
    </section>
  );
}
