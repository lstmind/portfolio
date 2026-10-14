"use client";

/* Островки страницы "Обо мне": разметка с сервера, поведение ванильным кодом, всё убирается при размонтировании. */
import { useRun, useRunNear } from "../islands";
import { runCopy, runDrum, runReveal, runRows } from "./about.run";

export function AboutIsland() {
  useRun(".ab-page", runReveal);
  useRun(".ab-page", runCopy);
  useRunNear("#ab-stk", runDrum);
  useRunNear("#umeyu", runRows);
  return null;
}
