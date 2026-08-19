import { SITE, STATUS } from "@/lib/content";

/** Шапка внутренних страниц: тот же язык, что на главной, но все ссылки ведут на неё. */
export function PageHeader() {
  return (
    <header className="doc-hdr">
      <nav>
        <a className="logo" href="/">
          <span className="sq" />
          {SITE.name}
        </a>
        <div className="nav-r">
          <a className="l" href="/#services">
            Услуги
          </a>
          <a className="l" href="/#works">
            Работы
          </a>
          <a className="l" href="/#calc">
            Цена
          </a>
          <a
            className="nav-tg"
            href={SITE.telegram}
            target="_blank"
            rel="noopener noreferrer"
          >
            [ Telegram ↗ ]
          </a>
        </div>
      </nav>
    </header>
  );
}

/** Хлебные крошки: видимые человеку и размеченные для поисковика (разметка — в самой странице). */
export function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav className="doc-crumbs mono" aria-label="Хлебные крошки">
      {items.map((it, i) => (
        <span key={it.name}>
          {it.href ? <a href={it.href}>{it.name}</a> : <span aria-current="page">{it.name}</span>}
          {i < items.length - 1 && <i aria-hidden="true">/</i>}
        </span>
      ))}
    </nav>
  );
}

/** Блок связи в конце внутренней страницы — дальше человеку идти некуда, кроме как написать. */
export function PageCta({ title, text }: { title: string; text: string }) {
  return (
    <section className="doc-cta">
      <div className="doc-wrap">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="doc-cta-row">
          <a className="magnet" href={SITE.telegram} target="_blank" rel="noopener noreferrer">
            <span className="lab">Написать в Telegram →</span>
          </a>
          <a className="ghost" href="/#contact">
            Оставить заявку на сайте <span className="ar">↘</span>
          </a>
        </div>
        <p className="doc-status mono">{STATUS}</p>
      </div>
    </section>
  );
}

export function PageFooter() {
  return (
    <footer className="doc-ftr">
      <div className="doc-wrap">
        <div className="doc-ftr-row">
          <a href="/">{SITE.name} — Алексей, веб-разработчик</a>
          <span className="mono">Москва и вся Россия удалённо</span>
          <span className="mono">
            <a href={SITE.telegram} target="_blank" rel="noopener noreferrer">
              {SITE.telegramHandle}
            </a>
            {" · "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
