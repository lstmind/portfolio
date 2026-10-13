"use client";

/* Цели Метрики по кликам: один обработчик на document вместо onClick в каждой кнопке.
   Telegram (tg_click и место), живые сайты (site_open), разборы (case_open), кнопка "Меню" (menu_open),
   раскрытие запасной формы в финале главной (form_open).
   Старые имена из прошлого дизайна, чтобы цели в кабинете продолжили считаться:
   calc_cta (кнопка Telegram калькулятора), mobile_cta_tg (нижний язычок на телефоне).
   calc_use и lead_form шлёт сам калькулятор (home/final.run.js), nav_services и nav_niches шапка (chrome.run.js). */
import { useEffect } from "react";
import { ymFlushPending, ymGoal } from "@/lib/metrika";

const TG = /^(t\.me|telegram\.me)$/;
/* внешние ссылки, которые не живые сайты из портфолио: связь и площадки с отзывами */
const NOT_SITE = /(^|\.)(github\.com|kwork\.ru|profi\.ru|yandex\.ru|t\.me|telegram\.me)$/;

/** место клика: data-goal-place у ближайшего предка, общие части по их узлам, иначе раздел сайта или секция главной */
export function placeOf(el: Element): string {
  const tagged = el.closest<HTMLElement>("[data-goal-place]");
  if (tagged?.dataset.goalPlace) return tagged.dataset.goalPlace;
  if (el.closest("#dock")) return "tongue";
  if (el.closest("#ns")) return "menu";
  if (el.closest("header.top")) return "header";
  if (el.closest("#hero")) return "hero";
  if (el.closest("#final")) return "final";
  if (el.closest("#footer")) return "footer";
  const p = location.pathname.replace(/\/+$/, "") || "/";
  const m = p.match(/^\/(uslugi|works|dlya)(\/[^/]+)?$/);
  if (m) return m[2] ? { uslugi: "service", works: "case", dlya: "niche" }[m[1]]! : m[1];
  if (p === "/") return el.closest("section[id]")?.id || "home";
  return "other";
}

function onClick(e: MouseEvent) {
  if (e.type === "auxclick" && e.button !== 1) return;
  const t = e.target as Element | null;
  if (!t || !t.closest) return;

  if (t.closest(".top-menu")) {
    ymGoal("menu_open");
    return;
  }
  // "Нет Telegram? Оставьте контакт" раскрывает форму (обработчик кнопки ещё не сработал: aria-expanded пока прежний)
  const alt = t.closest("#final-alt");
  if (alt) {
    if (alt.getAttribute("aria-expanded") !== "true") ymGoal("form_open");
    return;
  }

  const a = t.closest<HTMLAnchorElement>("a[href]");
  if (!a) return;
  // карточки карусели героя: мышью и пальцем их открывает код героя и сам шлёт цель (hero-open),
  // первое касание только выбирает карточку. Здесь остаётся клавиатура (Enter даёт клик с detail 0)
  if (e.detail !== 0 && a.matches("#hero .card")) return;
  let u: URL;
  try {
    u = new URL(a.href, location.href);
  } catch {
    return;
  }
  if (!/^https?:$/.test(u.protocol)) return;
  const place = placeOf(a);

  if (TG.test(u.hostname)) {
    ymGoal("tg_click", { place });
    if (a.id === "final-cta") ymGoal("calc_cta");
    if (a.id === "dock") ymGoal("mobile_cta_tg");
    return;
  }

  if (u.origin === location.origin) {
    const m = u.pathname.match(/^\/works\/([^/]+)\/?$/);
    // ссылка разбора на самого себя (крошки, логотип раздела) не открывает разбор
    if (!m || u.pathname.replace(/\/+$/, "") === location.pathname.replace(/\/+$/, "")) return;
    // ссылка уводит из этой вкладки: пока tag.js не приехал, цель дождётся следующей страницы
    const leaving = e.type === "click" && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && a.target !== "_blank";
    ymGoal("case_open", { place, slug: m[1] }, { leaving });
    return;
  }

  if (!NOT_SITE.test(u.hostname)) ymGoal("site_open", { place, host: u.hostname.replace(/^www\./, "") });
}

/* карточку в карусели героя открывает её код (window.open после жеста), а клик достаётся самому герою:
   поэтому карусель сообщает об открытии своим событием */
function onHeroOpen(e: Event) {
  const host = (e as CustomEvent<{ host?: string }>).detail?.host;
  if (host) ymGoal("site_open", { place: "hero", host: host.replace(/^www\./, "") });
}

/** островок без разметки: вешает обработчик и отдаёт цели, отложенные на прошлой странице */
export function Goals() {
  useEffect(() => {
    ymFlushPending();
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    document.addEventListener("hero-open", onHeroOpen);
    return () => {
      document.removeEventListener("hero-open", onHeroOpen);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);
  return null;
}
