"use client";

/* Островки раздела услуг: разметка с сервера, поведение ванильным кодом, всё убирается при размонтировании. */
import { useEffect } from "react";
import { runNear, useRun, useRunNear } from "../islands";
import { runPrices } from "../home/prices.run";
import { runHero, runCards, runWords, runNiches, runSignFigs, runStrike } from "./uslugi.run";
import { runDemos } from "./demos.run";

/** экран ноутбука в первом экране */
export function HeroIsland() {
  useRun("#u-hero", runHero);
  return null;
}

/** крупные слова ниже первого экрана */
export function WordsIsland() {
  useRun(".u-page", runWords);
  return null;
}

/** карточки работ на телефоне */
export function CardsIsland() {
  useRunNear("#u-works", runCards);
  return null;
}

/** все прайс-вывески страницы: у каждой своя раскладка колонок и своя активная строка */
export function SignsIsland() {
  useEffect(() => {
    const roots = [...document.querySelectorAll<HTMLElement>(".u-sign")];
    // каждая вывеска запускается на подходе: на длинной странице их несколько, и замеры колонок не нужны при загрузке
    const offs = roots.map((r) =>
      runNear(r, (el) => {
        const a = runPrices(el) as () => void;
        const b = runSignFigs(el) as () => void;
        return () => {
          a();
          b();
        };
      }),
    );
    return () => offs.forEach((f) => f());
  }, []);
  return null;
}

/** механики услуг и доска в экране планшета */
export function DemosIsland() {
  useRun(".u-page", runDemos);
  return null;
}

/** строки ниш: цвет у середины экрана на телефоне */
export function NichesIsland() {
  useRunNear("#u-niches", runNiches);
  return null;
}

/** "Не делаю": зачёркивание по входу в кадр */
export function StrikeIsland() {
  useRunNear("#u-no", runStrike);
  return null;
}
