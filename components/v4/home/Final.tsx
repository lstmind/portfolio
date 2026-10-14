import { SITE, CALC } from "@/lib/content";
import { FAQ_HOME } from "@/lib/home";
import { IMG } from "../Figure";
import { FinalIsland } from "./islands";
import "./final.css";

/** состояние калькулятора при загрузке: лендинг, стандартный, обычный срок */
const START = { type: "land", scale: "m", urg: "n" } as const;

function startCalc() {
  const idx = 1;
  const p = CALC.prices[START.type][idx];
  const term = CALC.terms[START.type][idx];
  const type = CALC.types.find((t) => t.k === START.type)!.msg;
  const sum = `≈ ${p[0]}–${p[1]} тыс ₽`;
  // то же первое сообщение, что соберёт скрипт: на сервере, чтобы пузырь не был пустым до гидрации
  const msg = [`Здравствуйте! Калькулятор на сайте: ${type}, ${CALC.scales[idx].label.toLowerCase()}. Вышло `, sum, `, срок ${term}. Хочу обсудить задачу.`];
  return { low: p[0], high: p[1], term, hint: CALC.hints[START.type][idx], msg };
}

const Out = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);

/** финал: "СКОЛЬКО?" и ответ цифрой, выбор задачи, фигура на язычке Telegram, превью первого сообщения, вопросы */
export function Final() {
  const r = startCalc();
  const calcData = {
    types: CALC.types.map((t) => [t.k, t.label, t.msg]),
    scales: CALC.scales.map((s) => [s.k, s.label]),
    hints: CALC.hints,
    prices: CALC.prices,
    terms: CALC.terms,
    termsUrgent: CALC.termsUrgent,
    start: START,
    telegram: SITE.telegram,
    email: SITE.email,
    img: IMG,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_HOME.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <section className="s-final" id="final" aria-labelledby="final-title" data-calc={JSON.stringify(calcData)}>
      <div className="final-stage">
        <div className="final-calc">
          <h2 className="final-h" id="final-title">
            Сколько?
          </h2>
          <div className="final-res" aria-live="polite" aria-atomic="true">
            <p className="final-ans">
              <span className="final-num" id="final-num">
                <span className="sr" id="final-sr">{`примерно ${r.low}–${r.high} тысяч рублей`}</span>
                <span className="final-approx" aria-hidden="true">
                  ≈
                </span>
                <span aria-hidden="true" id="final-digits">
                  {`${r.low}–${r.high}`}
                </span>
              </span>
              <span className="final-unit" aria-hidden="true">
                тыс ₽
              </span>
            </p>
            <p className="final-term">
              срок <span id="final-term">{r.term}</span>
            </p>
          </div>

          <div className="final-pick">
            <div className="final-g" role="group" aria-labelledby="final-l-type">
              <p className="final-gl" id="final-l-type">
                Что нужно
              </p>
              <div className="final-chips" data-final-k="type">
                {CALC.types.map((t) => (
                  <button className="final-chip" type="button" data-v={t.k} aria-pressed={t.k === START.type} key={t.k}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="final-g" role="group" aria-labelledby="final-l-scale">
              <p className="final-gl" id="final-l-scale">
                Масштаб
              </p>
              <div className="final-chips" data-final-k="scale">
                {CALC.scales.map((s) => (
                  <button className="final-chip" type="button" data-v={s.k} aria-pressed={s.k === START.scale} key={s.k}>
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="final-hint" id="final-hint">
                {r.hint}
              </p>
            </div>
            <label className="final-urg">
              <input type="checkbox" role="switch" id="final-urg" />
              <span className="final-sw" aria-hidden="true" />
              Срочно <small>+25% к цене</small>
            </label>
          </div>
          <p className="final-note">Ориентир, не оферта. Точную смету назову после разбора задачи, бесплатно.</p>
        </div>

        <div className="final-scene" id="final-scene">
          <p className="final-side-l" aria-hidden="true">
            без менеджера
          </p>
          <p className="final-side-r" aria-hidden="true">
            договор и чек
          </p>
          <div className="final-figs" id="final-figs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="final-me final-on" alt="" width={400} height={984} decoding="async" data-final-pose="3" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="final-me" alt="" width={400} height={984} decoding="async" data-final-pose="2" />
          </div>
          <svg className="final-point" id="final-point" aria-hidden="true" focusable="false">
            <defs>
              <filter id="final-ink" x="-20%" y="-5%" width="140%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves={2} seed={7} />
                <feDisplacementMap in="SourceGraphic" scale={2.4} />
              </filter>
              <mask id="final-pmask" maskUnits="userSpaceOnUse">
                <path className="final-pm" id="final-pmL" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} />
                <path className="final-pm" id="final-pmH" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} />
              </mask>
            </defs>
            <g mask="url(#final-pmask)" filter="url(#final-ink)">
              <path className="final-pr" id="final-rL" />
              <path className="final-pr" id="final-rH" />
              <path className="final-pk" id="final-pL" />
              <path className="final-pk" id="final-pH" />
            </g>
          </svg>
          <a
            className="final-cta"
            id="final-cta"
            href={`${SITE.telegram}?text=${encodeURIComponent(r.msg.join(""))}`}
            target="_blank"
            rel="noopener"
          >
            Написать в Telegram
            <Out />
          </a>
        </div>

        <div className="final-side">
          <div className="final-chat">
            <div className="final-who">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="final-ava"
                src={`${IMG}final-ava-96.webp`}
                srcSet={`${IMG}final-ava-96.webp 96w, ${IMG}final-ava-192.webp 192w`}
                sizes="46px"
                width={46}
                height={46}
                alt={SITE.person}
                loading="lazy"
                decoding="async"
              />
              <div>
                <b>{SITE.person}</b>
                <span>{SITE.telegramHandle} · отвечаю сам</span>
              </div>
            </div>
            <div className="final-body">
              <span className="final-tag">ваше первое сообщение</span>
              <p className="final-msg" id="final-msg">
                {r.msg[0]}
                <b>{r.msg[1]}</b>
                {r.msg[2]}
              </p>
            </div>
            <form className="final-form" id="final-form" hidden noValidate>
              <p className="final-calcline">
                К заявке приложу расчёт: <b id="final-calcline" />
              </p>
              <input className="final-hp" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="final-f">
                <label htmlFor="final-name">Как вас зовут</label>
                <input id="final-name" name="name" type="text" autoComplete="name" placeholder="Имя" required minLength={2} />
              </div>
              <div className="final-f">
                <label htmlFor="final-contact">Как связаться</label>
                <input
                  id="final-contact"
                  name="contact"
                  type="text"
                  autoComplete="off"
                  placeholder="Телефон, почта или @ник"
                  required
                  aria-describedby="final-status"
                />
              </div>
              <div className="final-f">
                <label htmlFor="final-task">Что нужно сделать</label>
                <textarea id="final-task" name="task" rows={3} placeholder="Своими словами. Если сайт уже есть, пришлите ссылку" />
              </div>
              <button className="final-send" type="submit">
                Отправить
              </button>
              <p className="final-status" id="final-status" role="status" />
            </form>
            <div className="final-foot">
              <button className="final-alt" type="button" id="final-alt" aria-expanded="false" aria-controls="final-form">
                Нет Telegram? Оставьте контакт
              </button>
              <span className="final-copied" id="final-copied" aria-live="polite" />
            </div>
          </div>
          <p className="final-links">
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={SITE.github} target="_blank" rel="noopener">
              GitHub <Out />
            </a>
          </p>
        </div>
      </div>

      <div className="final-faq">
        <h2 className="final-faq-h">Пока вы не спросили</h2>
        <ul className="final-qs" id="final-qs">
          {FAQ_HOME.map((f, i) => (
            <li className="final-q" key={f.q}>
              <h3>
                <button className="final-qb" type="button" aria-expanded="false" id={`final-qb${i}`} aria-controls={`final-a${i}`}>
                  <span>{f.q}</span>
                  <i className="final-x" aria-hidden="true" />
                </button>
              </h3>
              <div className="final-a" id={`final-a${i}`} role="region" aria-labelledby={`final-qb${i}`}>
                <div>
                  <p>{f.a}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <FinalIsland />
    </section>
  );
}
