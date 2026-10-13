"use client";

import { useEffect } from "react";

type Scene = HTMLElement & { __v4run?: (() => void) | null };
type Win = Window & { __v4nf?: (el: HTMLElement) => () => void };

/**
 * Сцена 404 запускается сама, ещё до гидрации (скрипт в разметке NotFound.tsx кладёт очистку в __v4run).
 * Островок забирает этот запуск, а при повторном монтировании (переход по сайту, строгий режим в разработке)
 * запускает код заново: функцией, которую оставил скрипт, или самим скриптом из разметки.
 */
export function NotFoundIsland() {
  useEffect(() => {
    const nf = document.querySelector<Scene>("main.nf");
    if (!nf) return;
    if (!nf.__v4run) {
      const w = window as Win;
      if (w.__v4nf) nf.__v4run = w.__v4nf(nf);
      else {
        const s = nf.querySelector("script");
        if (s) {
          const n = document.createElement("script");
          n.textContent = s.textContent;
          s.replaceWith(n);
        }
      }
    }
    const destroy = nf.__v4run;
    nf.__v4run = null;
    return () => destroy?.();
  }, []);
  return null;
}
