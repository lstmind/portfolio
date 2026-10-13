"use client";

/* Островки раздела работ: React рисует разметку на сервере, после гидрации на неё вешается ванильный код
   из works.run.ts. React витрину не перерисовывает, код сам всё убирает при размонтировании. */
import { useRun } from "../islands";
import { runHub, runCase } from "./works.run";

export function HubIsland() {
  useRun(".w-hub", runHub);
  return null;
}

export function CaseIsland() {
  useRun(".w-case", runCase);
  return null;
}
