import { SITE, PROJECTS_TOTAL, plural } from "@/lib/content";
import { FOOTER_NICHES } from "@/lib/home";
import { PROFI_URL } from "@/lib/reviews";
import { Figure } from "./Figure";
import { FooterIsland } from "./islands";
import "./footer.css";

const Out = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);

/** подвал: связь, разделы, ниши; вордмарк lstmind во всю ширину, на ствол буквы d сел персонаж */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="s-footer" id="footer">
      <div className="footer-in">
        <nav className="footer-nav" aria-label="Подвал">
          <div>
            <p className="footer-h">Связь</p>
            <ul>
              <li>
                <a className="footer-a footer-tg" href={SITE.telegram} target="_blank" rel="noopener">
                  Telegram <small>{SITE.telegramHandle}</small>
                  <Out />
                </a>
              </li>
              <li>
                <a className="footer-a" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </li>
              <li>
                <a className="footer-a" href={SITE.github} target="_blank" rel="noopener">
                  GitHub
                  <Out />
                </a>
              </li>
              <li>
                <a className="footer-a" href={SITE.kwork} target="_blank" rel="noopener">
                  Kwork <small>отзывы</small>
                  <Out />
                </a>
              </li>
              <li>
                <a className="footer-a" href={PROFI_URL} target="_blank" rel="noopener">
                  Профи <small>отзывы</small>
                  <Out />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="footer-h">Сайт</p>
            <ul>
              <li>
                <a className="footer-a" href="/works">
                  Все {PROJECTS_TOTAL} {plural(PROJECTS_TOTAL, ["сайт", "сайта", "сайтов"])}
                </a>
              </li>
              <li>
                <a className="footer-a" href="/uslugi">
                  Услуги и цены
                </a>
              </li>
            </ul>
          </div>
          <div>
            <a className="footer-h" href="/dlya">
              Сайты для
              <Out />
            </a>
            <ul className="footer-niches">
              {FOOTER_NICHES.map((n) => (
                <li key={n.href}>
                  <a className="footer-a" href={n.href}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="footer-mark">
          <p className="footer-word" role="img" aria-label={SITE.name}>
            <span className="footer-l1" aria-hidden="true">
              lst
            </span>
            <span className="footer-l2" aria-hidden="true">
              mind
              <Figure
                pose="j8"
                className="footer-fig"
                id="footer-fig"
                sizes="(max-width: 699px) calc(27.7vw - 9px), calc(14.7vw - 11px)"
              />
            </span>
          </p>
        </div>

        <div className="footer-base">
          <span>
            © {year} {SITE.person}, {SITE.name}
          </span>
          <span className="footer-own">Самозанятый: договор, акт и чек</span>
          <a href={`${SITE.github}/portfolio`} target="_blank" rel="noopener">
            Этот сайт тоже собрал я, код открыт ↗
          </a>
          <a href="#" id="footer-up">
            Наверх ↑
          </a>
        </div>
      </div>
      <FooterIsland />
    </footer>
  );
}
