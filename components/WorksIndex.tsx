"use client";

import { useState } from "react";
import { WORKS_INDEX, WORK_CATS } from "@/lib/content";

/** Полный индекс работ: фильтр-чипы + строки с hairline, в ДНК сайта */
export function WorksIndex() {
  const [cat, setCat] = useState<string>("Все");
  const items = cat === "Все" ? WORKS_INDEX : WORKS_INDEX.filter((w) => w.cat === cat);

  return (
    <div className="widx reveal">
      <div className="widx-head">
        <div className="widx-title mono">Полный индекс · {WORKS_INDEX.length} проектов</div>
        <div className="widx-chips" role="tablist" aria-label="Фильтр работ">
          {WORK_CATS.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
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
          <a key={w.href} href={w.href} target="_blank" rel="noopener noreferrer" data-cursor>
            <span className="no mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="nm">{w.title}</span>
            <span className="st mono">{w.stack}</span>
            <span className="ar mono">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
