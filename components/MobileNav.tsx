"use client";

import { useState, useEffect } from "react";
import { NAV, SITE } from "@/lib/content";
import { ymGoal } from "@/lib/metrika";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [ctaOn, setCtaOn] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return () => { document.body.style.overflow = ""; };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // липкий CTA: появляется после героя, прячется когда контакт уже на экране
  useEffect(() => {
    const contact = document.getElementById("contact");
    let contactVisible = false;
    const io = contact
      ? new IntersectionObserver((es) => es.forEach((e) => { contactVisible = e.isIntersecting; onScroll(); }), { threshold: 0.15 })
      : null;
    if (contact && io) io.observe(contact);
    const onScroll = () => setCtaOn(window.scrollY > window.innerHeight * 0.8 && !contactVisible);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

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
      <div className={`mobmenu${open ? " open" : ""}`} inert={!open}>
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
      {/* липкий мобильный CTA — контакт в один тап с любого места страницы */}
      <div className={`mcta${ctaOn ? " on" : ""}`} inert={!ctaOn} aria-label="Быстрая связь">
        <a className="mcta-main" href="#contact" onClick={() => ymGoal("mobile_cta")}>
          Обсудить проект →
        </a>
        <a
          className="mcta-tg mono"
          href={SITE.telegram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => ymGoal("mobile_cta_tg")}
        >
          TG ↗
        </a>
      </div>
    </>
  );
}
