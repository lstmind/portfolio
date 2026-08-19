"use client";

import { useState } from "react";
import { WORKS_INDEX, WORK_CATS, plural } from "@/lib/content";

/** Полный индекс работ: фильтр-чипы + строки с сутью и движком, в ДНК сайта */
/** сколько строк показываем сразу — остальное по кнопке, чтобы список не растягивал страницу */
const PREVIEW = 8;

export function WorksIndex() {
  const [cat, setCat] = useState<string>("Все");
  const [all, setAll] = useState(false);
  const items = cat === "Все" ? WORKS_INDEX : WORKS_INDEX.filter((w) => w.cat === cat);
  const shown = all ? items : items.slice(0, PREVIEW);
  const rest = items.length - shown.length;

  const pick = (c: string) => {
    setCat(c);
    setAll(false);
  };

  return (
    <div className="widx reveal">
      <div className="widx-head">
        <div className="widx-title mono">Полный индекс · {WORKS_INDEX.length} {plural(WORKS_INDEX.length, ["проект", "проекта", "проектов"])}</div>
        <div className="widx-chips" role="group" aria-label="Фильтр работ">
          {WORK_CATS.map((c) => (
            <button
              key={c}
              aria-pressed={cat === c}
              className={`chip mono${cat === c ? " on" : ""}`}
              onClick={() => pick(c)}
            >
              {c}
              <span className="cnt">
                {c === "Все" ? WORKS_INDEX.length : WORKS_INDEX.filter((w) => w.cat === c).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="widx-list">
        {shown.map((w, i) => (
          <a
            key={w.href}
            href={w.href}
            {...(w.href.startsWith("#") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
            data-cursor
          >
            <span className="no mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="mid">
              <span className="nm">{w.title}</span>
              <span className="note">{w.note}</span>
            </span>
            <span className="eng mono">{w.engine}</span>
            <span className="ar mono" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
      {rest > 0 && (
        <button className="widx-more mono" onClick={() => setAll(true)} data-cursor>
          Показать ещё {rest} {plural(rest, ["проект", "проекта", "проектов"])} ↓
        </button>
      )}
      {all && items.length > PREVIEW && (
        <button className="widx-more mono" onClick={() => setAll(false)} data-cursor>
          Свернуть ↑
        </button>
      )}
    </div>
  );
}
