// Яндекс Метрика: id счётчика + отправка целей
export const YM_ID = 110355016;

type YmFn = (id: number, action: string, goal: string) => void;

/** Цель в Метрику (тихо игнорируется, если счётчик не загрузился/заблокирован) */
export function ymGoal(goal: string) {
  const ym = (window as Window & { ym?: YmFn }).ym;
  try {
    ym?.(YM_ID, "reachGoal", goal);
  } catch {
    /* блокировщик — не наша проблема */
  }
}
