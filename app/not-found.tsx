import Link from "next/link";
import { SITE } from "@/lib/content";

export default function NotFound() {
  return (
    <section className="nf">
      <span className="nf-shot" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/scene/404.webp"
          srcSet="/img/scene/404-720.webp 720w, /img/scene/404.webp 1440w"
          sizes="100vw"
          alt=""
          width={1440}
          height={960}
          loading="eager"
          decoding="async"
        />
      </span>
      <div className="wrap">
        <div className="eyebrow">
          <span className="n">404</span> Страница не найдена
        </div>
        <h1 className="nf-title">
          Тут <span className="acc">пусто.</span>
        </h1>
        <p className="nf-sub">
          Такой страницы нет — или её уже починили. Зато есть сайты, которые работают, и человек,
          который их делает.
        </p>
        <div className="cta-row" style={{ opacity: 1, animation: "none" }}>
          <Link className="magnet" href="/" data-cursor data-magnet>
            <span className="lab">На главную →</span>
          </Link>
          <a className="ghost" href={SITE.telegram} target="_blank" rel="noopener noreferrer" data-cursor>
            написать в Telegram <span className="ar">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
