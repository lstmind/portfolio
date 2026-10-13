import { SITE } from "@/lib/content";
import { HeaderIsland } from "./islands";
import { NAV_META, NAV_NICHES, NAV_SERVICES } from "./nav.data";
import "./header.css";

const Out = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);

const Chev = () => (
  <svg className="top-chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M2.5 4.5L6 8l3.5-3.5" />
  </svg>
);

const Go = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M3 8h9.5M8.5 4l4 4-4 4" />
  </svg>
);

const Burger = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 5.5h14M2 12.5h14" />
  </svg>
);

const Cross = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3.5 3.5l11 11M14.5 3.5l-11 11" />
  </svg>
);

/**
 * Логотип: слово и красный блок-курсор высотой со строчные, как в строке, где сейчас печатают.
 * Тот же знак, что во вкладке и на иконках (design-concepts/v4/brand, направление A).
 */
function Logo() {
  return (
    <a className="logo" href="/" aria-label={`${SITE.name}, на главную`}>
      {SITE.name}
      <i className="logo-cur" aria-hidden="true" />
    </a>
  );
}

/** цена строкой меню: "от" мельче, число жирно, единица следом */
function Price({ p }: { p: { pre: string; value: string; unit: string } }) {
  return (
    <span className="np-price">
      {p.pre && <i>{p.pre}</i>}
      {p.value}
      {p.unit}
    </span>
  );
}

/**
 * Шапка одна на весь сайт: логотип, разделы, Telegram.
 * Услуги и Ниши раскрывают панель (наведение с задержкой, клик, Enter), Работы и Цены ведут сразу.
 * На телефоне разделы прячутся в кнопку "Меню": полноэкранный лист с крупными словами и пилюлями.
 * inner: страница не главная (цены тогда ведут на прайс хаба услуг, а не на якорь главной).
 * current: адрес раздела, в котором сейчас человек, пункт получает aria-current.
 */
export function Header({ inner = false, current }: { inner?: boolean; current?: string }) {
  const prices = inner ? "/uslugi#u-new" : "#prices";
  // раздел, внутри которого человек: "true", а не "page" (на /uslugi/lending ссылка на хаб не ведёт на эту же страницу).
  // точное совпадение с адресом chrome.run.js поднимает до "page"
  const cur = (href: string) => (current === href ? ("true" as const) : undefined);

  return (
    <header className="top">
      <Logo />
      <div className="top-r">
        <nav className="top-nav" aria-label="Разделы">
          <button type="button" className="top-tr" aria-expanded="false" aria-controls="np-uslugi" aria-current={cur("/uslugi")}>
            Услуги
            <Chev />
          </button>
          <div className="np" id="np-uslugi" hidden>
            <div className="np-in">
              <div className="np-cols">
                {NAV_SERVICES.map((g) => (
                  <section className="np-col" key={g.title} aria-label={g.title}>
                    <p className="np-h">
                      {g.title}
                      <span>{g.side}</span>
                    </p>
                    <ul>
                      {g.items.map((s) => (
                        <li key={s.href}>
                          <a className="np-row" href={s.href}>
                            <span className="np-name">{s.label}</span>
                            <Price p={s.price} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <div className="np-foot">
                <a className="np-all" href="/uslugi">
                  Все услуги и цены
                  <Go />
                </a>
                <span>{NAV_META.rate}, по проекту фикс-смета</span>
              </div>
            </div>
          </div>

          <a href="/works" aria-current={cur("/works")}>
            Работы
          </a>

          <button type="button" className="top-tr" aria-expanded="false" aria-controls="np-dlya" aria-current={cur("/dlya")}>
            Ниши
            <Chev />
          </button>
          <div className="np np--dlya" id="np-dlya" hidden>
            <div className="np-in">
              <p className="np-h">
                Сайты для
                <span>
                  {NAV_META.niches}, {NAV_META.nicheSites}
                </span>
              </p>
              <ul className="np-grid">
                {NAV_NICHES.map((n) => (
                  <li key={n.href}>
                    <a className="np-niche" href={n.href}>
                      <span className="np-card" aria-hidden="true">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" loading="lazy" decoding="async" src={`${n.img}-240.webp`} width={240} height={519} />
                      </span>
                      <span className="np-txt">
                        <span className="np-word">{n.word}</span>
                        <span className="np-meta">
                          <span>{n.sites}</span> · <span>{n.price}</span>
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="np-foot">
                <a className="np-all" href="/dlya">
                  Все ниши
                  <Go />
                </a>
                <a className="np-alt" href="/dlya#dl-any">
                  Вашей ниши нет в списке?
                </a>
              </div>
            </div>
          </div>

          <a href={prices}>Цены</a>
        </nav>

        <button type="button" className="top-menu" aria-expanded="false" aria-controls="ns" aria-haspopup="dialog">
          Меню
          <Burger />
        </button>

        <a className="tg" href={SITE.telegram} target="_blank" rel="noopener">
          Telegram
          <Out />
        </a>
      </div>

      {/* лист меню на телефоне: свой верх с логотипом и крестиком на месте шапки */}
      <div className="ns" id="ns" role="dialog" aria-modal="true" aria-label="Меню" tabIndex={-1} hidden>
        <div className="ns-bar">
          <Logo />
          <button type="button" className="ns-x">
            Закрыть
            <Cross />
          </button>
        </div>
        <div className="ns-body">
          <ul className="ns-big">
            <li>
              <a href="/uslugi" aria-current={cur("/uslugi")}>
                <span className="ns-w">Услуги</span>
                <span className="ns-m">{NAV_META.services}</span>
              </a>
            </li>
            <li>
              <a href="/works" aria-current={cur("/works")}>
                <span className="ns-w">Работы</span>
                <span className="ns-m">{NAV_META.works}</span>
              </a>
            </li>
            <li>
              <a href="/dlya" aria-current={cur("/dlya")}>
                <span className="ns-w">Ниши</span>
                <span className="ns-m">{NAV_META.niches}</span>
              </a>
            </li>
            <li>
              <a href={prices}>
                <span className="ns-w">Цены</span>
                <span className="ns-m">{NAV_META.prices}</span>
              </a>
            </li>
          </ul>

          <section className="ns-sec" aria-label="Ниши">
            <div className="ns-grp">
              <p className="ns-h">Сайты для</p>
              <ul className="ns-pills">
                {NAV_NICHES.map((n) => (
                  <li key={n.href}>
                    <a href={n.href}>
                      {n.nav}
                      <b aria-hidden="true">{n.n}</b>
                      <span className="sr">, {n.sites}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="ns-sec" aria-label="Услуги">
            {NAV_SERVICES.map((g) => (
              <div className="ns-grp" key={g.title}>
                <p className="ns-h">{g.title}</p>
                <ul className="ns-pills">
                  {g.items.map((s) => (
                    <li key={s.href}>
                      <a href={s.href}>{s.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
        <div className="ns-foot">
          <a className="ns-tg" href={SITE.telegram} target="_blank" rel="noopener">
            Написать в Telegram
            <Out />
          </a>
        </div>
      </div>

      <HeaderIsland />
    </header>
  );
}
