"use client";

import { useEffect, useRef, useState } from "react";
import { WORKS, plural, shotSrcSet, SHOT_W } from "@/lib/content";
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
    const cleanups: (() => void)[] = [];
    // 1) пометить готовые ленты (включая закэшированные до гидрации)
    const imgs = rootRef.current?.querySelectorAll<HTMLImageElement>("img.tall");
    imgs?.forEach((im) => {
      const mark = () => im.classList.add("ready");
      if (im.complete && im.naturalWidth > 0) mark();
      else im.addEventListener("load", mark, { once: true });
    });
    // 2) ленты греем по подходу к экрану, а не все разом. Раньше на десктопе
    // сразу качались все одиннадцать — 2.2 МБ, из которых человек видел одну-две.
    // Теперь карточка тянет свою ленту, когда до неё остаётся экран прокрутки,
    // и ещё раз — при наведении, если почему-то не успела.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = conn?.saveData || /2g/.test(conn?.effectiveType || "");
    const warmed = new Set<string>();
    const px = devicePixelRatio > 1.5 ? "-1128.webp" : "-760.webp";
    const warmOne = (el: Element) => {
      const src = el.querySelector<HTMLImageElement>("img.tall")?.getAttribute("src");
      if (!src || warmed.has(src)) return;
      warmed.add(src);
      new window.Image().src = src.replace(/\.jpg$/, px);
    };
    if (matchMedia("(pointer: fine)").matches && !slow) {
      const near = new IntersectionObserver(
        (es) => es.forEach((e) => { if (e.isIntersecting) { warmOne(e.target); near.unobserve(e.target); } }),
        { rootMargin: "700px 0px" }
      );
      rootRef.current?.querySelectorAll(".work").forEach((c) => {
        near.observe(c);
        c.addEventListener("pointerenter", () => warmOne(c), { once: true });
      });
      cleanups.push(() => near.disconnect());
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
      cleanups.push(() => io.disconnect());
    }
    return () => cleanups.forEach((f) => f());
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
                srcSet={shotSrcSet(w.imgTall)}
                sizes="(max-width:920px) 100vw, (max-width:1280px) 46vw, 560px"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="tall"
                src={w.imgTall}
                alt={w.alt}
                width={SHOT_W}
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
