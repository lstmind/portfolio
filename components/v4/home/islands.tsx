"use client";

/* Островки секций главной: разметка с сервера, поведение из ванильного кода статики (*.run.js).
   React секции не перерисовывает: код меняет DOM сам и всё за собой убирает при размонтировании. */
import { useEffect } from "react";
import { useRun } from "../islands";
import { runWorks } from "./works.run";
import { runPrices } from "./prices.run";
import { runProcess } from "./process.run";
import { runFinal } from "./final.run";
import { runReviews } from "./reviews.run";

type Hero = HTMLElement & { __v4run?: (() => void) | null };
type Win = Window & { __v4hero?: (el: HTMLElement) => () => void };

/**
 * Герой запускается сам, ещё до гидрации: его скрипт лежит в разметке (см. Hero.tsx) и кладёт очистку в __v4run.
 * Здесь островок забирает этот запуск, а при повторном монтировании (переход по сайту, строгий режим в разработке)
 * запускает код заново: функцией, которую оставил скрипт, или самим скриптом из разметки.
 */
export function HeroIsland() {
  useEffect(() => {
    const hero = document.getElementById("hero") as Hero | null;
    if (!hero) return;
    if (!hero.__v4run) {
      const w = window as Win;
      if (w.__v4hero) hero.__v4run = w.__v4hero(hero);
      else {
        const s = hero.querySelector("script");
        if (s) {
          const n = document.createElement("script");
          n.textContent = s.textContent;
          s.replaceWith(n);
        }
      }
    }
    const destroy = hero.__v4run;
    hero.__v4run = null;
    return () => destroy?.();
  }, []);
  return null;
}

export function WorksIsland() {
  useRun("#works", runWorks);
  return null;
}
export function PricesIsland() {
  useRun("#prices", runPrices);
  return null;
}
export function ReviewsIsland() {
  useRun("#reviews", runReviews);
  return null;
}
export function ProcessIsland() {
  useRun("#process", runProcess);
  return null;
}
export function FinalIsland() {
  useRun("#final", runFinal);
  return null;
}
