"use client";

/* Островок короткой формы: разметка с сервера (LeadForm.tsx), поведение ванильным кодом (lead.run.js). */
import { useRun } from "../islands";
import { runLead } from "./lead.run";

/** форма с этим id: у каждой формы на странице свой островок */
export function LeadIsland({ id }: { id: string }) {
  useRun(`#${id}`, runLead);
  return null;
}
