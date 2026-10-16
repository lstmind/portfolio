import { HOURS, REPLY, SITE, PROJECTS_ALL, PROJECTS_ALL_LABEL, PROJECTS_ALL_NOTE, PROJECTS_TOTAL, PAY, PAY_HOURLY, plural } from "@/lib/content";
import { RATE, rub } from "@/lib/home";
import { KWORK_STATS, PROFI_STATS, PROFI_URL } from "@/lib/reviews";
import { ONE_PHRASE, tgLink } from "@/lib/cta";
import { tie } from "../typo";
import { IMG } from "../Figure";
import { CAN, EDU, FRAMES, INSURED, PERSON, SINCE, STACK_ALL, STACK_DRUM, frameSrc, frameSrcSet, yearsNow, yearsWord } from "./data";
import { AboutIsland } from "./islands";
import "./about.css";

const NB = " ";

/** стрелка наружу, как у Telegram в шапке */
const Out = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);

/** стрелка вправо: переход внутри сайта */
const Go = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M2.5 8h11M9 3.5L13.5 8 9 12.5" />
  </svg>
);

const CopyIco = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <rect x="5" y="5" width="8" height="8" rx="1.5" />
    <path d="M3 10.5V4a1 1 0 0 1 1-1h6.5" />
  </svg>
);

/** первое сообщение в Telegram: сразу видно, откуда пришли */
const tgHref = tgLink({ kind: "page", name: "Обо мне" });

/** строка из данных оплаты с заглавной и точкой: "Без сюрпризов" берёт ту же формулировку, что услуги и FAQ */
const sentence = (s: string) => (s.charAt(0).toUpperCase() + s.slice(1)).replace(/; (.)/g, (_, c: string) => `. ${c.toUpperCase()}`) + ".";

/**
 * Крупное слово Fira 900 капсом, буквы встают на барабане (как слова героя и прайса).
 * --n: число знаков, по нему кегль подгоняется под ширину колонки. Заголовку читалка отдаёт слово целиком.
 */
function Big({ text, as: Tag = "p", id, className = "" }: { text: string; as?: "p" | "h2"; id?: string; className?: string }) {
  let k = 0;
  const letters = (
    <span className="ab-big-in" aria-hidden="true">
      {text.split(" ").map((w, wi) => (
        <span className="ab-wd" key={wi}>
          {wi > 0 && " "}
          <span className="ab-wd-in">
            {[...w].map((ch, i) => (
              <span className="ab-ch" style={{ "--i": k++ } as React.CSSProperties} key={i}>
                {ch}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
  const n = Math.max(...text.split(" ").map((w) => w.length), 4);
  return (
    <Tag className={`ab-big ${className}`} id={id} style={{ "--n": n } as React.CSSProperties} aria-hidden={Tag === "p" ? true : undefined}>
      {Tag !== "p" && <span className="sr">{text}</span>}
      {letters}
    </Tag>
  );
}

/** кадр персонажа: стоит подошвами на линейке (--sole: поле под подошвами в долях высоты холста) */
function Frame({
  id,
  alt = "",
  sizes,
  eager = false,
  className = "",
}: {
  id: keyof typeof FRAMES;
  alt?: string;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  const f = FRAMES[id];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`ab-frame ${className}`}
      alt={alt}
      width={f.w}
      height={f.h}
      src={frameSrc(id)}
      srcSet={frameSrcSet(id)}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      style={{ "--sole": `${(((f.h - f.sole) / f.h) * 100).toFixed(2)}%` } as React.CSSProperties}
    />
  );
}

/** кнопка "скопировать": без скрипта просто текст рядом с ссылкой, со скриптом кладёт значение в буфер */
function Copy({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  return (
    <button type="button" className={`ab-copy ${className}`} data-copy={value} aria-label={label}>
      <span className="ab-copy-t">Скопировать</span>
      <CopyIco />
    </button>
  );
}

/** "4.92" → "4,92" */
const comma = (s: string) => s.replace(".", ",");

export function About({ kwork }: { kwork: number }) {
  const years = yearsNow();
  const kworkRate = KWORK_STATS.negative === 0 ? "5,0" : null;
  const kworkReviews = `${kwork}${NB}${plural(kwork, ["отзыв", "отзыва", "отзывов"])}`;
  const profiReviews = `${PROFI_STATS.count}${NB}${plural(PROFI_STATS.count, ["отзыв", "отзыва", "отзывов"])}`;
  const live = `${PROJECTS_TOTAL}${NB}${plural(PROJECTS_TOTAL, ["живой сайт", "живых сайта", "живых сайтов"])}`;

  return (
    <>
      {/* 1. первый экран: крошки, h1 строкой, крупное имя, две пары фактов, лид, язычок на линейке; справа за столом */}
      <section className="ab-hero" id="ab-hero" aria-labelledby="ab-h1" data-goal-place="about-hero">
        <div className="ab-hero-txt">
          <nav className="ab-crumbs" aria-label="Хлебные крошки">
            <ol>
              <li>
                <a href="/">Главная</a>
              </li>
            </ol>
          </nav>
          <h1 className="ab-kicker" id="ab-h1">
            {PERSON.name}, <span className="ab-nw">веб-разработчик</span> на{NB}фрилансе
          </h1>
          <Big text={PERSON.given} className="ab-big--hero" />
          <dl className="ab-pairs">
            <div className="ab-pair">
              <dt>Делаю сайты</dt>
              <dd>
                <b>с{NB}{SINCE} года</b>
                <span>{tie(`${yearsWord(years)}: сайты, интернет-магазины, боты, доработка чужих сайтов`)}</span>
              </dd>
            </div>
            <div className="ab-pair">
              <dt>Где</dt>
              <dd>
                <b>
                  Москва<i> · </i>Чехов
                </b>
                <span>{tie("работаю удалённо, заказчики по всей России")}</span>
              </dd>
            </div>
          </dl>
          <p className="ab-lead">
            {tie(
              "Менеджеров нет: вы говорите с тем, кто пишет код, и за результат отвечаю я. Сначала разбираюсь в задаче, потом называю цену, и она не растёт.",
            )}
          </p>
          <div className="ab-hero-act">
            <a className="ab-tg" href={tgHref} target="_blank" rel="noopener">
              Написать в Telegram
              <Out />
            </a>
            <span className="ab-hero-side">Самозанятый: договор, акт и{NB}чек</span>
          </div>
        </div>
        <figure className="ab-hero-fig">
          <span className="ab-fig-box" style={{ aspectRatio: `${FRAMES.desk.w} / ${FRAMES.desk.h}` }}>
            <span className="ab-tilt" aria-hidden="true">
              отвечаю сам
              <br />
              {REPLY.within}
              <br />
              {HOURS.short}
            </span>
            <Frame
              id="desk"
              alt="Алексей за столом с ноутбуком и кружкой кофе, рисунок"
              sizes={`(max-width: 699px) 40vw, min(${((720 * FRAMES.desk.w) / FRAMES.desk.h).toFixed(0)}px, calc((100vh - 190px) * ${(FRAMES.desk.w / FRAMES.desk.h).toFixed(3)}))`}
              eager
            />
          </span>
        </figure>
      </section>

      {/* 2. цифры: стопка сайтов в руках, общий опыт крупно, рейтинги площадок и страховка */}
      <section className="ab-num" id="ab-num" aria-labelledby="ab-num-t">
        <h2 className="sr" id="ab-num-t">
          Цифры
        </h2>
        <figure className="ab-num-fig" data-rv="fig">
          <Frame id="stack" sizes="(max-width: 699px) 36vw, min(26vw, 360px)" alt="Алексей держит высокую стопку распечатанных сайтов, рисунок" />
        </figure>
        <div className="ab-num-r">
          <div className="ab-n">
            <Big text={PROJECTS_ALL} className="ab-big--n" />
            <div className="ab-n-side">
              <p>
                <span className="sr">{PROJECTS_ALL} </span>
                {tie(PROJECTS_ALL_LABEL)},{" "}
                <span className="ab-n-note">{PROJECTS_ALL_NOTE.replace(/ (?=\S+$)/, NB)}</span>
              </p>
              <a className="ab-pill" href="/works">
                Все {live}
                <Go />
              </a>
            </div>
          </div>
          <ul className="ab-cells">
            {kworkRate && (
              <li className="ab-cell" data-rv="">
                <b>
                  {kworkRate}
                  <small>★</small>
                </b>
                <p>
                  {kworkReviews} на{" "}
                  <a href={SITE.kwork} target="_blank" rel="noopener">
                    Kwork
                  </a>
                  , все положительные
                </p>
              </li>
            )}
            <li className="ab-cell" data-rv="">
              <b>
                {comma(PROFI_STATS.rating)}
                <small>★</small>
              </b>
              <p>
                {profiReviews} на{" "}
                <a href={PROFI_URL} target="_blank" rel="noopener">
                  Профи
                </a>
                , паспорт проверен
              </p>
            </li>
            <li className="ab-cell" data-rv="">
              <b>
                {rub(INSURED)}
                <small>₽</small>
              </b>
              <p>{tie("на столько застрахована работа через Профи")}</p>
            </li>
          </ul>
        </div>
      </section>

      {/* 3. что получается лучше всего: строки как прайс главной, у каждой карточка живого сайта */}
      <section className="ab-can" id="umeyu" aria-labelledby="ab-can-t">
        <div className="ab-sec-h">
          <h2 id="ab-can-t">Что получается лучше всего</h2>
          <a href="/uslugi">
            Все услуги и цены
            <Go />
          </a>
        </div>
        <ul className="ab-can-list">
          {CAN.map((c) => (
            <li key={c.word} data-rv="">
              <a className="ab-crow" href={c.href}>
                <Big text={c.word} className="ab-big--row" />
                <span className="ab-crow-t">
                  <span className="sr">{c.word}. </span>
                  {tie(c.text)}
                  <em>
                    например {c.site.title}: {c.eg}
                  </em>
                </span>
                <span className="ab-card" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    loading="lazy"
                    decoding="async"
                    src={`${IMG}${c.img}-240.webp`}
                    srcSet={`${IMG}${c.img}-240.webp 240w, ${IMG}${c.img}-400.webp 400w`}
                    sizes="(max-width: 699px) 104px, 150px"
                    width={240}
                    height={519}
                  />
                </span>
                <span className="ab-crow-go">
                  <Out />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. как работаю: пять правил */}
      <section className="ab-how" id="ab-how" aria-labelledby="ab-how-t">
        <div className="ab-how-l">
          <Big as="h2" text="Без сюрпризов" id="ab-how-t" className="ab-big--how" />
          <p>{tie("Пять правил, по которым работаю с каждым заказчиком.")}</p>
        </div>
        <ol className="ab-steps">
          <li data-rv="">
            <span>01</span>
            <div>
              Сначала разбираюсь в{NB}задаче
              <em>{tie("Предлагаю минимальный рабочий вариант, без лишних работ.")}</em>
            </div>
          </li>
          <li data-rv="">
            <span>02</span>
            <div>
              Цену называю заранее и{NB}целиком
              <em>{tie(`По проекту фикс-смета, час работы ${RATE.replace("/час", "")}.`)}</em>
            </div>
          </li>
          <li data-rv="">
            <span>03</span>
            <div>
              Оплата {PAY.scheme.v}
              <em>{tie(`${sentence(PAY.scheme.note)} Часовые задачи ${PAY_HOURLY.v}: ${PAY_HOURLY.note.replace(/; /g, ", ")}.`)}</em>
            </div>
          </li>
          <li data-rv="">
            <span>04</span>
            <div>
              Самозанятый: договор и{NB}чек
              <em>{tie(PAY.waysLine)}</em>
            </div>
          </li>
          <li data-rv="">
            <span>05</span>
            <div>
              Две недели гарантии
              <em>{tie(sentence(PAY.guarantee.note))}</em>
            </div>
          </li>
        </ol>
      </section>

      {/* 5. стек: барабан "Пишу на ...", весь стек пилюлями, учёба на листе */}
      <section className="ab-stk" id="ab-stk" aria-labelledby="ab-stk-t">
        <h2 className="ab-drum" id="ab-stk-t">
          <span className="sr">Пишу на WordPress, 1С-Битриксе, Laravel, Next.js и не только</span>
          <span className="ab-drum-in" aria-hidden="true">
            <span className="ab-drum-a">Пишу на</span>
            <span className="ab-win" data-words={JSON.stringify(STACK_DRUM)}>
              <span className="ab-dw ab-dw--up">{STACK_DRUM[STACK_DRUM.length - 1]}</span>
              <span className="ab-dw ab-dw--on">{STACK_DRUM[0]}</span>
              <span className="ab-dw ab-dw--dn">{STACK_DRUM[1]}</span>
            </span>
          </span>
        </h2>
        <div className="ab-stk-grid">
          <div>
            <p className="ab-cap">Весь стек</p>
            <ul className="ab-pills">
              {STACK_ALL.map((s) => (
                <li key={s} data-rv="">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="ab-edu" data-rv="">
            <p className="ab-cap">Учился</p>
            <b>{EDU.short}</b>
            <p>{tie(EDU.text)}</p>
            <p>{tie("Поэтому в дизайне разбираюсь: простой рисую сам, а сильный с нуля делаем в паре с дизайнером. Вёрстка, код и запуск на мне.")}</p>
          </div>
        </div>
      </section>

      {/* 6. связь: Telegram главный и красный, остальное списком; рядом с телефоном в руке */}
      <section className="ab-con" id="svyaz" aria-labelledby="ab-con-t" data-goal-place="about-contacts">
        <figure className="ab-con-fig" data-rv="fig">
          <Frame id="phone" sizes="(max-width: 699px) 34vw, min(24vw, 330px)" alt="Алексей показывает телефон с перепиской, рисунок" />
        </figure>
        <div className="ab-con-r">
          <Big as="h2" text="Напишите" id="ab-con-t" className="ab-big--con" />
          <a className="ab-tgbig" href={tgHref} target="_blank" rel="noopener">
            <span>
              Telegram <small>{SITE.telegramHandle}</small>
            </span>
            <Out />
          </a>
          <p className="ab-tg-note">
            {tie(`Быстрее всего здесь. ${ONE_PHRASE}`)} <span className="ab-tg-hours">{tie(REPLY.line)}</span>
          </p>
          <ul className="ab-list">
            <li>
              <a className="ab-li" href={`tel:${PERSON.tel}`}>
                <span className="ab-k">Телефон</span>
                <span className="ab-v">
                  {PERSON.phone.replace(/ /g, NB)}
                  <small>если удобнее голосом</small>
                </span>
                <span className="ab-act">
                  <span>Позвонить</span>
                  <Out />
                </span>
              </a>
            </li>
            <li className="ab-li ab-li--mail">
              <span className="ab-k">Почта</span>
              <a className="ab-v" href={`mailto:${SITE.email}`}>
                {SITE.email}
                <small>для ТЗ, файлов и{NB}договора</small>
              </a>
              <Copy value={SITE.email} label={`Скопировать почту ${SITE.email}`} className="ab-act" />
            </li>
            <li>
              <a className="ab-li" href={SITE.kwork} target="_blank" rel="noopener">
                <span className="ab-k">Kwork</span>
                <span className="ab-v">
                  lstmind
                  <small>
                    {kworkRate ? `${kworkRate} · ` : ""}
                    {kworkReviews}, оплата через биржу
                  </small>
                </span>
                <span className="ab-act">
                  <span>Отзывы</span>
                  <Out />
                </span>
              </a>
            </li>
            <li>
              <a className="ab-li" href={PROFI_URL} target="_blank" rel="noopener">
                <span className="ab-k">Профи</span>
                <span className="ab-v">
                  {PERSON.name}
                  <small>
                    {comma(PROFI_STATS.rating)} · {profiReviews}, работа застрахована
                  </small>
                </span>
                <span className="ab-act">
                  <span>Отзывы</span>
                  <Out />
                </span>
              </a>
            </li>
            <li>
              <a className="ab-li" href={SITE.github} target="_blank" rel="noopener">
                <span className="ab-k">GitHub</span>
                <span className="ab-v">
                  lstmind
                  <small>код этого сайта открыт</small>
                </span>
                <span className="ab-act">
                  <span>Код</span>
                  <Out />
                </span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* 7. реквизиты: чек с перфорацией */}
      <section className="ab-req" id="rekvizity" aria-labelledby="ab-req-t">
        <div className="ab-req-l">
          <Big as="h2" text="Реквизиты" id="ab-req-t" className="ab-big--req" />
          <p>{tie('Для договора и чека. Чек приходит из приложения "Мой налог" сразу после оплаты.')}</p>
          <p>{tie(`Образец договора лежит здесь же, ${PAY.doc.note}.`)}</p>
        </div>
        <div className="ab-check" data-rv="">
          <p className="ab-cap">Исполнитель</p>
          <dl>
            <dt>ФИО</dt>
            <dd>
              <b>{PERSON.full}</b>
            </dd>
            <dt>Статус</dt>
            <dd>{tie("самозанятый, налог на профессиональный доход")}</dd>
            <dt>ИНН</dt>
            <dd>
              <b>{PERSON.inn}</b>
              <Copy value={PERSON.inn} label={`Скопировать ИНН ${PERSON.inn}`} className="ab-copy--inn" />
            </dd>
            <dt>Город</dt>
            <dd>{PERSON.city}</dd>
            <dt>Запросы по данным</dt>
            <dd>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </dd>
          </dl>
          <div className="ab-check-links">
            <a href={PAY.doc.href} target="_blank" rel="noopener" type="application/pdf">
              {PAY.doc.label}
            </a>
            <a href="/politika">Политика обработки данных</a>
            <a href="/soglasie">Согласие на обработку данных</a>
          </div>
        </div>
      </section>

      <p className="ab-live" aria-live="polite" />
      <AboutIsland />
    </>
  );
}
