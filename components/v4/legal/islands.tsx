"use client";

/* Островки документов и плашки cookie: разметка с сервера, поведение ванильным кодом, всё убирается при размонтировании.
   useRun здесь свой, а не из ../islands: плашка есть на каждой странице, и тащить ради неё код шапки и подвала не нужно */
import { useEffect } from "react";
import { runCookie } from "./cookie.run";
import { runLegal } from "./legal.run";

function useRun(selector: string, run: (el: HTMLElement) => () => void) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    return run(el);
  }, [selector, run]);
}

export function CookieIsland() {
  useRun("#ck", runCookie);
  return null;
}

export function LegalIsland() {
  useRun(".lg-page", runLegal);
  return null;
}
