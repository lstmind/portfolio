"use client";

/* Островки раздела услуг: разметка с сервера, поведение ванильным кодом, всё убирается при размонтировании. */
import { useEffect } from "react";
import { useRun } from "../islands";
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
  useRun("#u-works", runCards);
  return null;
}

/** все прайс-вывески страницы: у каждой своя раскладка колонок и своя активная строка */
export function SignsIsland() {
  useEffect(() => {
    const roots = [...document.querySelectorAll<HTMLElement>(".u-sign")];
    const offs = roots.flatMap((r) => [runPrices(r) as () => void, runSignFigs(r) as () => void]);
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
  useRun("#u-niches", runNiches);
  return null;
}

/** "Не делаю": зачёркивание по входу в кадр */
export function StrikeIsland() {
  useRun("#u-no", runStrike);
  return null;
}
