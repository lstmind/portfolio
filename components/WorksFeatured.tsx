"use client";

import { useEffect, useRef, useState } from "react";
import { WORKS, plural } from "@/lib/content";
import { CASE_PAGES } from "@/lib/cases";

/** сколько карточек показываем сразу — остальные по кнопке, чтобы страница не растягивалась */
const PREVIEW = 6;

/**
 * Избранные работы с ховер-проездом.
 * Ленты — статичные jpg БЕЗ next/image-оптимизатора (файлы уже сжаты при подготовке),
 * предзагружаются в фоне сразу после простоя страницы и проявляются только готовыми —
 * белых кадров при проезде не бывает.
 */
export function WorksFeatured() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [all, setAll] = useState(false);
  const shown = all ? WORKS : WORKS.slice(0, PREVIEW);
  const rest = WORKS.length - shown.length;

  useEffect(() => {
    // 1) пометить готовые ленты (включая закэшированные до гидрации)
    const imgs = rootRef.current?.querySelectorAll<HTMLImageElement>("img.tall");
    imgs?.forEach((im) => {
      const mark = () => im.classList.add("ready");
      if (im.complete && im.naturalWidth > 0) mark();
      else im.addEventListener("load", mark, { once: true });
    });
    // 2) фоновая предзагрузка лент — ТОЛЬКО десктоп и не-экономные сети;
    // мобиле хватает ленивой загрузки видимых карточек (бережём LCP и трафик)
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = conn?.saveData || /2g/.test(conn?.effectiveType || "");
    if (matchMedia("(pointer: fine)").matches && !slow) {
      const warm = () => WORKS.forEach((w) => { new window.Image().src = w.imgTall.replace(/\.jpg$/, ".webp"); });
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(warm, { timeout: 2500 });
      else setTimeout(warm, 1200);
    }
    // 3) тач-устройства: ховера нет — лента едет сама, пока карточка на экране
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (matchMedia("(pointer: coarse)").matches && !reduce && imgs?.length) {
      imgs.forEach((im) => im.classList.add("auto"));
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            const im = (e.target as HTMLElement).querySelector("img.tall");
            im?.classList.toggle("play", e.isIntersecting);
          }),
        { threshold: 0.45 }
      );
      rootRef.current?.querySelectorAll(".shot").forEach((s) => io.observe(s));
      return () => io.disconnect();
    }
  }, [all]);

  return (
    <div className="works reveal" ref={rootRef}>
      {shown.map((w) => (
        <a
          className="work"
          href={`/works/${CASE_PAGES.find((c) => c.href === w.href)?.slug ?? ""}`}
          data-cursor
          key={w.href}
        >
          <div className="shot">
            <span className="tag mono">
              <i />
              {w.tag}
            </span>
            <picture>
              <source
                type="image/webp"
                srcSet={`${w.imgTall.replace(/\.jpg$/, "")}-400.webp 400w, ${w.imgTall.replace(/\.jpg$/, "")}.webp ${w.imgTallW ?? 760}w`}
                sizes={`(max-width:920px) 100vw, ${w.imgTallW ?? 560}px`}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="tall"
                src={w.imgTall}
                alt={w.alt}
                width={w.imgTallW ?? 760}
                height={w.imgTallH}
                loading="lazy"
                decoding="async"
              />
            </picture>
            <span className="openbadge mono">Разбор проекта ↗</span>
          </div>
          <div className="body">
            <div className="top">
              <h3>{w.title}</h3>
              <span className="yr mono">{w.kind}</span>
            </div>
            <p>{w.text}</p>
            <div className="stk mono">
              {w.stack.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </a>
      ))}
      {rest > 0 && (
        <button className="widx-more mono" onClick={() => setAll(true)} data-cursor>
          Показать ещё {rest} {plural(rest, ["работу", "работы", "работ"])} ↓
        </button>
      )}
    </div>
  );
}
