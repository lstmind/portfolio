"use client";

/* Островки раздела ниш: разметка с сервера, поведение ванильным кодом, всё убирается при размонтировании. */
import { useEffect } from "react";
import { runNear, useRun, useRunNear } from "../islands";
import { runPrices } from "../home/prices.run";
import { runCards, runCenter, runFan, runHubPose, runWords } from "./dlya.run";
import { runDemo } from "./demo.run";

/** веер сайтов в первом экране: на телефоне карточки по очереди получают цвет */
export function FanIsland() {
  useRun(".dl-hero .dl-fan", runFan);
  return null;
}

/** крупные слова ниже первого экрана */
export function WordsIsland() {
  useRun(".dl-page", runWords);
  return null;
}

/** карточки работ на телефоне */
export function CardsIsland() {
  useRunNear("#dl-works", runCards);
  return null;
}

/** все прайс-вывески страницы: у каждой своя раскладка колонок и своя активная строка */
export function SignsIsland() {
  useEffect(() => {
    const roots = [...document.querySelectorAll<HTMLElement>(".dl-sign")];
    // каждая вывеска запускается на подходе: замеры колонок не нужны при загрузке страницы
    const offs = roots.map((r) => runNear(r, (el) => runPrices(el) as () => void));
    return () => offs.forEach((f) => f());
  }, []);
  return null;
}

/** мини-механика ниши */
export function DemoIsland() {
  useRun(".dd[data-k]", runDemo);
  return null;
}

/** хаб: смена позы персонажа первого экрана при наведении на строку вывески */
export function HubPoseIsland() {
  useRun(".dl-hero--hub .dl-hero-fig", runHubPose);
  return null;
}

/** другие ниши: строка у середины экрана получает цвет кропа на телефоне */
export function OthersIsland() {
  useRunNear("#dl-others .dl-niches", runCenter);
  return null;
}
