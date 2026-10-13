"use client";

/* Островки общих частей: React рисует разметку на сервере, а здесь после гидрации на неё вешается
   тот же ванильный код, что в статике. Каждый возвращает очистку: обработчики, кадры, наблюдатели. */
import { useEffect } from "react";
import { runHashHold, runHeader, runMenu, runTongue } from "./chrome.run";
import { runFooter } from "./footer.run";

/** запускает код на элементе по селектору, один раз на монтирование */
export function useRun(selector: string, run: (el: HTMLElement) => () => void) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    return run(el);
  }, [selector, run]);
}

/**
 * код секции ниже первого экрана запускается, только когда до неё остаётся полтора экрана:
 * её замеры и наблюдатели не попадают в первую загрузку страницы. До запуска секция уже стоит
 * в разметке с сервера, и до её появления в кадре код успевает всё подготовить. Возвращает очистку
 */
export function runNear(el: HTMLElement, run: (el: HTMLElement) => () => void, margin = "150% 0px"): () => void {
  if (!("IntersectionObserver" in window)) return run(el);
  let off: (() => void) | null = null;
  const io = new IntersectionObserver(
    (es) => {
      if (off || !es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      off = run(el);
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    if (off) off();
  };
}

/** useRun для секции ниже первого экрана: запуск на подходе (runNear) */
export function useRunNear(selector: string, run: (el: HTMLElement) => () => void, margin = "150% 0px") {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    return runNear(el, run, margin);
  }, [selector, run, margin]);
}

export function HeaderIsland() {
  useRun("header.top", runHeader);
  useRun("header.top", runMenu);
  useRun("header.top", runHashHold);
  return null;
}

export function FooterIsland() {
  useRunNear("#footer", runFooter);
  return null;
}

export function TongueIsland({ after, until }: { after: string; until: string }) {
  useEffect(() => {
    const dock = document.getElementById("dock");
    if (!dock) return;
    return runTongue(dock, after, until);
  }, [after, until]);
  return null;
}
