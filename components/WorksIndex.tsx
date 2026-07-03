"use client";

import { useState } from "react";
import { WORKS_INDEX, WORK_CATS } from "@/lib/content";

/** Полный индекс работ: фильтр-чипы + строки с сутью и движком, в ДНК сайта */
export function WorksIndex() {
  const [cat, setCat] = useState<string>("Все");
  const items = cat === "Все" ? WORKS_INDEX : WORKS_INDEX.filter((w) => w.cat === cat);

  return (
    <div className="widx reveal">
      <div className="widx-head">
        <div className="widx-title mono">Полный индекс · {WORKS_INDEX.length} проектов</div>
        <div className="widx-chips" role="group" aria-label="Фильтр работ">
          {WORK_CATS.map((c) => (
            <button
              key={c}
              aria-pressed={cat === c}
              className={`chip mono${cat === c ? " on" : ""}`}
              onClick={() => setCat(c)}
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
        {items.map((w, i) => (
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
    </div>
  );
}
