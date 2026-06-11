"use client";

import { useState, useEffect } from "react";
import { NAV, SITE } from "@/lib/content";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        className={`burger${open ? " open" : ""}`}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`mobmenu${open ? " open" : ""}`}>
        <nav>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
          <a className="mtg" href={SITE.telegram} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            Написать в Telegram ↗
          </a>
        </nav>
      </div>
    </>
  );
}
