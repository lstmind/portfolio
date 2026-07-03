"use client";

import { useRef, useState } from "react";
import { CALC, SITE } from "@/lib/content";
import { ymGoal } from "@/lib/metrika";

/** Интерактивный калькулятор стоимости — та же логика, что в telegram-боте */
export function CostCalc() {
  const [type, setType] = useState("land");
  const [scale, setScale] = useState("m");
  const [urg, setUrg] = useState("n");
  const touched = useRef(false);

  // цель «калькулятором пользуются» — один раз за визит, на первом клике
  const touch = () => {
    if (!touched.current) {
      touched.current = true;
      ymGoal("calc_use");
    }
  };

  const idx = scale === "s" ? 0 : scale === "m" ? 1 : 2;
  const [lo, hi] = CALC.prices[type][idx];
  const mult = urg === "u" ? 1.25 : 1;
  const low = Math.round(lo * mult);
  const high = Math.round(hi * mult);
  const term = urg === "u" ? "срочно — обсудим" : CALC.terms[type][idx];

  const group = (
    label: string,
    items: readonly { k: string; label: string }[],
    val: string,
    set: (v: string) => void
  ) => (
    <div className="calc-g">
      <h4 className="mono">{label}</h4>
      <div className="calc-opts" role="radiogroup" aria-label={label}>
        {items.map((it) => (
          <button
            key={it.k}
            role="radio"
            aria-checked={val === it.k}
            className={`calc-chip${val === it.k ? " on" : ""}`}
            onClick={() => { touch(); set(it.k); }}
            data-cursor
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="calc reveal">
      <div className="calc-left">
        {group("01 · Что нужно", CALC.types, type, setType)}
        {group("02 · Масштаб", CALC.scales, scale, setScale)}
        {group("03 · Сроки", CALC.urgency, urg, setUrg)}
      </div>
      <div className="calc-res" aria-live="polite">
        <div className="lbl mono">Примерная вилка</div>
        <div className="calc-sum">
          ≈ {low}–{high} <span className="s">тыс ₽</span>
        </div>
        <div className="calc-term mono">срок: {term}</div>
        <p className="calc-note">
          Это ориентир, не оферта. Точную фикс-смету назову после короткого разбора задачи — бесплатно и
          без обязательств.
        </p>
        <div className="calc-cta">
          <a className="magnet" href="#contact" data-cursor data-magnet onClick={() => ymGoal("calc_cta")}>
            <span className="lab">Зафиксировать смету →</span>
          </a>
          <a className="ghost" href={SITE.telegram} target="_blank" rel="noopener noreferrer" data-cursor>
            или сразу в Telegram <span className="ar">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
