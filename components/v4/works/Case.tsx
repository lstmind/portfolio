import { REPLY } from "@/lib/content";
import { tgText } from "@/lib/cta";
import { serviceBySlug } from "@/lib/services";
import { INDUSTRY_PAGES, nichesOfCase } from "@/lib/industries";
import { metaLine, nextCases, shotPoints, type CaseView, type ShotPoint } from "./data";
import { Crumbs, Cta, Drum, Ill, Out, Next } from "./parts";
import { CaseIsland } from "./islands";
import "./works.css";
import "./works-ill.css";

const NB = " ";

/** высота верхнего кадра ленты при ширине 390: чуть больше экрана карточки (390x844) */
const TOP_H = 860;

const pad = (n: number) => String(n).padStart(2, "0");
/** длина самого длинного слова: по ней ужимается кегль, чтобы слово не рвалось посередине */
const longest = (t: string) => Math.max(...t.split(" ").map((w) => w.length));

/** положение рамки на скрине: доли высоты и ширины в CSS-переменные */
const markVars = (p: ShotPoint) =>
  ({
    "--y": p.y,
    "--h": p.h,
    "--x": p.x ?? 0.025,
    "--w": p.w ?? 0.95,
    "--c": p.y + p.h / 2,
  }) as React.CSSProperties;

/** подпись рамки уходит вниз, если рамка у самого верха скрина, и вправо, если рамка узкая у правого края */
const markCls = (p: ShotPoint) => `w-mark${p.y < 0.03 ? " is-top" : ""}${(p.x ?? 0) > 0.5 ? " is-right" : ""}`;

/** прицел: значок у пункта, который можно показать на скрине */
const Aim = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M1.5 5V1.5H5M11 1.5h3.5V5M14.5 11v3.5H11M5 14.5H1.5V11" />
    <circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Разбор: огромное имя сайта, строка тип · движок · чей, прямой ответ. Справа (на телефоне сразу под ответом)
 * карточка с длинным скрином мобильной версии: на десктопе стоит на месте и едет по прокрутке чтения,
 * на телефоне едет сама, пока в кадре. Ниже задача, что сделано и детали крупным чтением, кадры экранов,
 * услуги, следующий разбор.
 */
export function Case({ v }: { v: CaseView }) {
  const { c, site, kind, stack, alt, tall } = v;
  const services = c.services.map((s) => serviceBySlug(s)).filter(Boolean) as NonNullable<ReturnType<typeof serviceBySlug>>[];
  const niches = nichesOfCase(c);
  const [next, ...more] = nextCases(c.slug);
  const dur = Math.round(tall.h / 140);
  const points = shotPoints(c);
  const ptOf = (i: number) => points.findIndex((p) => p.i === i);
  const tallSet = `${tall.base}-390.webp 390w, ${tall.base}-600.webp 600w, ${tall.base}-780.webp 780w`;
  const tallSizes = "(max-width: 699px) 72vw, 380px";
  const topSet = `${tall.base}-top-390.webp 390w, ${tall.base}-top-600.webp 600w, ${tall.base}-top-780.webp 780w`;
  /* сцена со схемой стоит у "Как устроено", а где этого блока нет, у "Что сделано" */
  const schemeAt = c.detail ? "detail" : "done";
  /* лента кропов: после списка, а у длинного списка (больше 8 пунктов) сразу под словом, чтобы на телефоне
     не шло два экрана текста подряд; пункт по тапу всё равно листает ленту к своему кадру */
  const longDone = c.done.length > 8;
  const crops = points.length > 0 && (
    <div className="w-crops" role="group" aria-label="Где это на сайте">
      <ul className="w-crops__list">
        {points.map((p, k) => (
          <li className="w-crop" key={k} id={`w-crop-${k}`} data-pt={k} style={{ ...markVars(p), "--r": tall.h / 390 } as React.CSSProperties}>
            <span className="w-card w-crop__card">
              <span className="w-card__screen">
                <span className="w-crop__roll">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {/* тот же файл, что и лента: адрес ставит works.run.ts вместе с лентой, иначе ленивая
                      загрузка браузера тянет его ещё до отрисовки первого экрана */}
                  <img
                    data-src={`${tall.base}-390.webp`}
                    data-srcset={tallSet}
                    data-sizes={tallSizes}
                    width={390}
                    height={tall.h}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                  <span className="w-mark is-on" />
                </span>
              </span>
              <span className="w-card__fog" />
            </span>
            <span className="w-crop__cap">
              <i>{pad(p.i + 1)}</i>
              {p.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
  const scheme = <Ill pose="h-shema" className="w-how__fig" sizes="(max-width: 699px) 140px, 200px" />;

  return (
    <main id="main" className="w-case">
      <div className="w-case__grid">
        <header className="w-case__head" style={{ "--len": longest(site.title) } as React.CSSProperties}>
          <Crumbs items={[{ name: "Главная", href: "/" }, { name: "Работы", href: "/works" }, { name: site.title }]} />
          <p className="w-case__meta">
            {metaLine(kind, site).map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </p>
          <Drum text={site.title} className="w-case__name w-big" />
        </header>

        <div className="w-case__lead">
          <p className="w-case__answer">{c.answer}</p>
          <p className="w-case__links">
            <a className="w-case__live" href={c.href} target="_blank" rel="noopener">
              {site.host}
              <Out />
            </a>
            {c.repo && (
              <a className="w-case__code" href={c.repo} target="_blank" rel="noopener">
                Код открыт на GitHub
              </a>
            )}
            <span className="w-case__stack">{stack.join(" · ")}</span>
          </p>
        </div>

        <aside className="w-case__aside" aria-label={`Сайт ${site.title} с прокруткой`}>
          <a
            className="w-card w-card--tall"
            href={c.href}
            target="_blank"
            rel="noopener"
            aria-label={`Открыть ${site.host} в новой вкладке`}
            style={
              {
                "--w-dur": `${dur}s`,
                "--w-ratio": `${390 / tall.h}`,
              } as React.CSSProperties
            }
          >
            <span className="w-card__screen">
              {/* лента высотой в весь скрин: место занято сразу (aspect-ratio), первым грузится лёгкий верхний кадр,
                  саму ленту works.run.ts подставляет после загрузки страницы (data-src) */}
              <span
                className="w-card__roll"
                data-src={`${tall.base}-390.webp`}
                data-srcset={tallSet}
                data-sizes={tallSizes}
                data-h={tall.h}
                style={{ aspectRatio: `390 / ${tall.h}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-card__top"
                  src={`${tall.base}-top-390.webp`}
                  srcSet={topSet}
                  sizes={tallSizes}
                  width={390}
                  height={TOP_H}
                  alt={`${alt}: мобильная версия целиком`}
                  decoding="async"
                  fetchPriority="high"
                  draggable={false}
                />
                {points.map((p, k) => (
                  <span className={markCls(p)} data-pt={k} key={k} style={markVars(p)}>
                    <b>{p.label}</b>
                  </span>
                ))}
              </span>
            </span>
            <span className="w-card__fog" />
            <span className="w-card__pill" aria-hidden="true">
              {site.host}
              <Out />
            </span>
          </a>
        </aside>

        <div className="w-case__body">
          <section className="w-read" aria-labelledby="w-task">
            <h2 className="w-read__h" id="w-task">
              Задача
            </h2>
            {c.task.map((t) => (
              <p className="w-read__p" key={t}>
                {t}
              </p>
            ))}
          </section>

          <section className="w-read" aria-labelledby="w-done">
            <div className={schemeAt === "done" ? "w-how" : undefined}>
              <h2 className="w-read__h" id="w-done">
                Что сделано
              </h2>
              {schemeAt === "done" && scheme}
            </div>
            {longDone && crops}
            <ol className={`w-done${points.length ? " has-pts" : ""}`}>
              {c.done.map((d, i) => {
                const k = ptOf(i);
                return k < 0 ? (
                  <li key={d}>
                    <span aria-hidden="true">{pad(i + 1)}</span>
                    {d}
                  </li>
                ) : (
                  <li key={d} className="has-pt" data-pt={k}>
                    <button type="button" className="w-done__t" aria-controls={`w-crop-${k}`}>
                      <span aria-hidden="true">{pad(i + 1)}</span>
                      <span>
                        {d}
                        <em className="w-done__aim">
                          <Aim />
                          на скрине
                        </em>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {!longDone && crops}
          </section>

          {c.detail && (
            <section className="w-read" aria-labelledby="w-detail">
              <div className="w-how">
                <h2 className="w-read__h" id="w-detail">
                  Как устроено
                </h2>
                {scheme}
              </div>
              {c.detail.map((d) => (
                <p className="w-read__p" key={d}>
                  {d}
                </p>
              ))}
            </section>
          )}

          <p className="w-case__open">
            <a href={c.href} target="_blank" rel="noopener">
              Открыть сайт
              <Out />
            </a>
            <span>{site.host} открывается и работает прямо сейчас</span>
          </p>
        </div>
      </div>

      {c.shots && c.shots.length > 0 && (
        <section className="w-shots" aria-labelledby="w-shots-h">
          <h2 className="w-mid" id="w-shots-h">
            Внутри
          </h2>
          <p className="w-shots__sub">Экраны за паролем и то, что не видно с первого взгляда.</p>
          <div className="w-shots__list">
            {c.shots.map((sh) => (
              <figure className="w-shot" key={sh.src}>
                <span className="w-shot__frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${sh.src}.webp`}
                    srcSet={`${sh.src}-564.webp 564w, ${sh.src}.webp ${sh.w}w`}
                    sizes="(max-width: 899px) calc(100vw - 32px), 50vw"
                    alt={sh.alt}
                    width={sh.w}
                    height={sh.h}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <figcaption>{sh.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="w-svc" aria-labelledby="w-svc-h">
          <h2 className="w-svc__h" id="w-svc-h">
            Услуги в этом проекте
          </h2>
          <ul className="w-svc__list">
            {services.map((s) => (
              <li key={s.slug}>
                <a href={`/uslugi/${s.slug}`}>
                  <b>{s.h1}</b>
                  <span className="w-svc__short">{s.short}</span>
                  <span className="w-svc__price">
                    {s.price.value}
                    <Next />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ниша проекта; у кого своей ниши на сайте нет (керамика), ссылка на все ниши, чтобы ветка не обрывалась */}
      <section className="w-svc w-svc--niche" aria-labelledby="w-niche-h">
        <h2 className="w-svc__h" id="w-niche-h">
          {niches.length > 0 ? "Сайты для этой ниши" : "Сайты по нишам"}
        </h2>
        <ul className="w-svc__list">
          {niches.length > 0 ? (
            niches.map((i) => (
              <li key={i.slug}>
                <a href={`/dlya/${i.slug}`}>
                  <b>{i.h1}</b>
                  <span className="w-svc__short">{i.short}</span>
                  <span className="w-svc__price">
                    {i.price.value}
                    <Next />
                  </span>
                </a>
              </li>
            ))
          ) : (
            <li>
              <a href="/dlya">
                <b>Сайты для бизнеса по нишам</b>
                <span className="w-svc__short">Своей страницы у этой ниши нет. Есть {INDUSTRY_PAGES.length}{NB}других: что в них важно, цены и сроки</span>
                <span className="w-svc__price">
                  все ниши
                  <Next />
                </span>
              </a>
            </li>
          )}
        </ul>
      </section>

      {next && (
        <section className="w-next" aria-labelledby="w-next-h">
          <p className="w-next__lab" id="w-next-h">
            Следующий разбор
          </p>
          <a className="w-next__go" href={`/works/${next.c.slug}`}>
            <span className="w-next__text" style={{ "--len": longest(next.site.title) } as React.CSSProperties}>
              <span className="w-next__name w-big">{next.site.title}</span>
              <span className="w-next__meta">
                {metaLine(next.kind, next.site).join(" · ")}
                <Next />
              </span>
            </span>
            <Ill pose="h-priglashaet" className="w-next__fig" sizes="120px" />
            <span className="w-card w-next__card" aria-hidden="true">
              <span className="w-card__screen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${next.site.img}-240.webp`}
                  srcSet={`${next.site.img}-240.webp 240w, ${next.site.img}-400.webp 400w`}
                  sizes="(max-width: 699px) 34vw, 220px"
                  width={240}
                  height={519}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="w-card__fog" />
            </span>
          </a>
          <p className="w-next__more">
            {more.map((m) => (
              <a href={`/works/${m.c.slug}`} key={m.c.slug}>
                {m.site.title}
              </a>
            ))}
            <a className="w-next__all" href="/works">
              Все работы
              <Next />
            </a>
          </p>
        </section>
      )}

      <Cta
        title="Нужен такой же?"
        text={`Расскажите задачу: назову срок и вилку цены. Если её лучше решить иначе, скажу об этом сразу. ${REPLY.line}`}
        tg={tgText({ kind: "case", name: v.site.title })}
      />
      <CaseIsland />
    </main>
  );
}
