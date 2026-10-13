// Яндекс Метрика: id счётчика + отправка целей
export const YM_ID = 110355016;

export type GoalParams = Record<string, string | number>;
type YmFn = ((...args: unknown[]) => void) & { a?: unknown[] };
type Win = Window & { ym?: YmFn } & Record<string, unknown>;

/* Счётчик подключается лениво (app/layout.tsx): заглушка ym с очередью появляется после гидрации,
   сам tag.js приезжает по первому касанию или через 12 с. Поэтому цель может прийти:
   1) до заглушки: держим её здесь и отдаём, как только ym появится;
   2) до tag.js: заглушка копит очередь, tag.js её разберёт;
   3) по клику на ссылку, которая уводит на другую страницу этой же вкладки, пока tag.js не приехал:
      очередь заглушки умрёт вместе со страницей, поэтому цель кладём в sessionStorage и отправляем на следующей. */
const KEY = "ym_pending";
const wait: [string, GoalParams | undefined][] = [];
let timer = 0;

const w = () => window as unknown as Win;
/** tag.js загружен и счётчик создан: после этого он сам успевает отправить цель перед уходом со страницы */
const ready = () => typeof window !== "undefined" && !!w()[`yaCounter${YM_ID}`];

function send(goal: string, params?: GoalParams) {
  try {
    w().ym?.(YM_ID, "reachGoal", goal, params);
  } catch {
    /* блокировщик или сбой счётчика не должны ломать клик */
  }
}

function flush() {
  timer = 0;
  if (typeof w().ym !== "function") {
    timer = window.setTimeout(flush, 400);
    return;
  }
  wait.splice(0).forEach(([g, p]) => send(g, p));
}

/** Цель в Метрику. Не падает и не теряется, если счётчик ещё не загрузился; тихо пропадает, если его режет блокировщик. */
export function ymGoal(goal: string, params?: GoalParams, opts?: { leaving?: boolean }) {
  if (typeof window === "undefined") return;
  if (opts?.leaving && !ready()) {
    try {
      const list = JSON.parse(sessionStorage.getItem(KEY) || "[]") as unknown[];
      list.push([goal, params]);
      sessionStorage.setItem(KEY, JSON.stringify(list.slice(-20)));
      return;
    } catch {
      /* хранилище недоступно: отправляем как обычно */
    }
  }
  if (typeof w().ym === "function") {
    send(goal, params);
    return;
  }
  wait.push([goal, params]);
  if (!timer) timer = window.setTimeout(flush, 400);
}

/** Цели, отложенные на прошлой странице (ушли по ссылке раньше, чем приехал tag.js). Вызывать один раз при загрузке. */
export function ymFlushPending() {
  let list: [string, GoalParams | undefined][] = [];
  try {
    list = JSON.parse(sessionStorage.getItem(KEY) || "[]");
    sessionStorage.removeItem(KEY);
  } catch {
    return;
  }
  if (Array.isArray(list)) list.forEach((x) => Array.isArray(x) && typeof x[0] === "string" && ymGoal(x[0], x[1]));
}

/** Цель один раз за визит (вкладку): второе и следующие срабатывания молчат. */
export function ymGoalOnce(goal: string, params?: GoalParams) {
  const k = `ym_once_${goal}`;
  try {
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
  } catch {
    const m = w() as Record<string, unknown>;
    if (m[k]) return;
    m[k] = 1;
  }
  ymGoal(goal, params);
}
