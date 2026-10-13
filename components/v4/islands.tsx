"use client";

/* Островки общих частей: React рисует разметку на сервере, а здесь после гидрации на неё вешается
   тот же ванильный код, что в статике. Каждый возвращает очистку: обработчики, кадры, наблюдатели. */
import { useEffect } from "react";
import { runHeader, runTongue } from "./chrome.run";
import { runFooter } from "./footer.run";

/** запускает код на элементе по селектору, один раз на монтирование */
export function useRun(selector: string, run: (el: HTMLElement) => () => void) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    return run(el);
  }, [selector, run]);
}

export function HeaderIsland() {
  useRun("header.top", runHeader);
  return null;
}

export function FooterIsland() {
  useRun("#footer", runFooter);
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
