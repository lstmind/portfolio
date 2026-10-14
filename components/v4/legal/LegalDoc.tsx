import { Fragment, type ReactNode } from "react";
import { SITE } from "@/lib/content";
import { OWNER, LEGAL_DATE } from "@/lib/legal";
import { tie } from "../typo";
import { IMG } from "../Figure";
import type { Block, Doc } from "./docs";
import { LegalIsland } from "./islands";
import "./legal.css";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** строка с [текстом](ссылкой): текст склеивается tie(), внешние ссылки в новой вкладке */
function rich(s: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of s.matchAll(LINK)) {
    if (m.index > last) out.push(tie(s.slice(last, m.index)));
    const href = m[2];
    const ext = /^https?:/.test(href);
    out.push(
      <a key={m.index} href={href} {...(ext ? { target: "_blank", rel: "noopener" } : {})}>
        {tie(m[1])}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(tie(s.slice(last)));
  return out.map((x, i) => <Fragment key={i}>{x}</Fragment>);
}

function Body({ b }: { b: Block }) {
  if ("p" in b) return <p>{rich(b.p)}</p>;
  if ("h3" in b) return <h3 id={b.id}>{tie(b.h3)}</h3>;
  if ("ul" in b)
    return (
      <ul>
        {b.ul.map((li) => (
          <li key={li}>{rich(li)}</li>
        ))}
      </ul>
    );
  return (
    <dl className="lg-dl">
      {b.dl.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{rich(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

const n2 = (i: number) => String(i + 1).padStart(2, "0");

function Toc({ doc }: { doc: Doc }) {
  return (
    <ol>
      {doc.sections.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`}>
            <span>{n2(i)}</span>
            {tie(s.title)}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Документ (политика, согласие) в языке сайта: крошки, малый h1, огромное слово, строка реквизитов;
 * дальше оглавление слева (липкое) и колонка чтения 60-70 знаков, сверху карточка "коротко".
 * На телефоне оглавление сворачивается в details под карточкой. Внизу персонаж с вопросом рядом с текстом, не поверх.
 */
export function LegalDoc({ doc, path }: { doc: Doc; path: string }) {
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
      { "@type": "ListItem", position: 2, name: doc.h1, item: `${SITE.url}${path}` },
    ],
  };
  return (
    <main id="main" className="lg-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <section className="lg-head">
        <nav className="lg-crumbs" aria-label="Хлебные крошки">
          <ol>
            <li>
              <a href="/">Главная</a>
            </li>
          </ol>
        </nav>
        <h1 className="lg-h1">{doc.h1}</h1>
        <p className="lg-big" aria-hidden="true">
          {doc.word}
        </p>
        <dl className="lg-meta">
          <div>
            <dt>Редакция</dt>
            <dd>от {tie(LEGAL_DATE)}</dd>
          </div>
          <div>
            <dt>Оператор</dt>
            <dd>{OWNER.fullName}</dd>
          </div>
          <div>
            <dt>Вопросы</dt>
            <dd>
              <a href={`mailto:${OWNER.email}`}>{OWNER.email}</a>
            </dd>
          </div>
        </dl>
      </section>

      <div className="lg-grid">
        <aside className="lg-toc" aria-label="Содержание">
          <p className="lg-cap">Содержание</p>
          <Toc doc={doc} />
          <p className="lg-soft">
            <a href={doc.soft.href}>{doc.soft.label}</a>
          </p>
        </aside>

        <article className="lg-doc">
          <section className="lg-short" aria-labelledby="lg-short-h">
            <h2 id="lg-short-h">Коротко</h2>
            <ul>
              {doc.short.map((s) => (
                <li key={s}>{tie(s)}</li>
              ))}
            </ul>
          </section>

          <details className="lg-mtoc">
            <summary>
              Содержание <small>{tie(`${doc.sections.length} ${doc.sections.length < 5 ? "раздела" : "разделов"}`)}</small>
            </summary>
            <Toc doc={doc} />
            <p className="lg-soft">
              <a href={doc.soft.href}>{doc.soft.label}</a>
            </p>
          </details>

          <p className="lg-intro">{rich(doc.intro)}</p>

          {doc.sections.map((s, i) => (
            <Fragment key={s.id}>
              <h2 id={s.id}>
                <span>{n2(i)}</span>
                {tie(s.title)}
              </h2>
              {s.blocks.map((b, j) => (
                <Body b={b} key={j} />
              ))}
            </Fragment>
          ))}

          <div className="lg-ask" id="lg-ask">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}about/about-phone-560.webp`}
              srcSet={`${IMG}about/about-phone-560.webp 228w, ${IMG}about/about-phone-780.webp 317w`}
              sizes="(max-width: 699px) 80px, 110px"
              width={228}
              height={560}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div>
              <p className="lg-ask-h">Есть вопрос?</p>
              <p>
                Пишите на <a href={`mailto:${OWNER.email}`}>{OWNER.email}</a>
                {tie(". Отвечу в течение 10 рабочих дней.")}
              </p>
            </div>
          </div>
        </article>
      </div>
      <LegalIsland />
    </main>
  );
}
