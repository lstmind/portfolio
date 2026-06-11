"use client";

import { useState } from "react";
import { FAQ } from "@/lib/content";

export function FaqList() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="faq reveal">
      {FAQ.map((f, i) => {
        const isOpen = open === i;
        return (
          <div className={`fq${isOpen ? " open" : ""}`} key={f.q}>
            <button
              className="fqsum"
              data-cursor
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{f.q}</span>
              <span className="pl">+</span>
            </button>
            <div className="fqwrap" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
              <div className="fqinner">
                <div className="fa">{f.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
