import { SITE } from "@/lib/content";
import { HeaderIsland } from "./islands";
import "./header.css";

const NAV = [
  { href: "/uslugi", label: "Услуги" },
  { href: "/works", label: "Работы" },
  { href: "/dlya", label: "Ниши" },
];

const Out = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);

/**
 * Шапка: логотип и Telegram. На внутренних страницах (inner) между ними три раздела.
 * current: адрес раздела, в котором сейчас человек, ссылка получает aria-current.
 */
export function Header({ inner = false, current }: { inner?: boolean; current?: string }) {
  const tg = (
    <a className="tg" href={SITE.telegram} target="_blank" rel="noopener">
      Telegram
      <Out />
    </a>
  );
  return (
    <header className="top">
      <a className="logo" href="/" aria-label={`${SITE.name}, на главную`}>
        {SITE.name}
      </a>
      {inner ? (
        <div className="top-r">
          <nav className="top-nav" aria-label="Разделы">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} aria-current={current === n.href ? "page" : undefined}>
                {n.label}
              </a>
            ))}
          </nav>
          {tg}
        </div>
      ) : (
        tg
      )}
      <HeaderIsland />
    </header>
  );
}
