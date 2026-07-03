"use client";

import { useState } from "react";
import { ymGoal } from "@/lib/metrika";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [contactErr, setContactErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // honeypot
    if (data.get("company")) return;
    // контакт должен быть достижимым: @ник, телефон или почта
    const contact = String(data.get("contact") || "").trim();
    const looksReachable = /@|\+?[\d\s().-]{7,}/.test(contact);
    if (!looksReachable) {
      setContactErr("похоже на опечатку — оставь @ник в Telegram, телефон или почту");
      form.querySelector<HTMLInputElement>("#cf-contact")?.focus();
      return;
    }
    setContactErr(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          contact: data.get("contact"),
          task: data.get("task"),
        }),
      });
      if (!res.ok) throw new Error("bad");
      setStatus("ok");
      ymGoal("lead_form");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="reveal" onSubmit={onSubmit}>
      <input className="hp" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" name="company" />
      <div className="field">
        <label htmlFor="cf-name">Как тебя зовут</label>
        <input id="cf-name" name="name" type="text" placeholder="Имя" required minLength={2} />
      </div>
      <div className="field">
        <label htmlFor="cf-contact">Как связаться</label>
        <input
          id="cf-contact"
          name="contact"
          type="text"
          placeholder="@telegram, телефон или почта"
          required
          aria-invalid={!!contactErr}
          aria-describedby={contactErr ? "cf-contact-err" : undefined}
          onChange={() => setContactErr(null)}
        />
        {contactErr && (
          <div className="formok" id="cf-contact-err" role="alert" style={{ marginTop: 8 }}>
            {contactErr}
          </div>
        )}
      </div>
      <div className="field">
        <label htmlFor="cf-task">Что нужно сделать</label>
        <textarea id="cf-task" name="task" placeholder="Пара слов о задаче — новый сайт, доработка, магазин, ускорение..." />
      </div>
      <button className="submit" data-cursor data-magnet disabled={status === "sending"}>
        {status === "sending" ? "Отправляю…" : "Отправить заявку →"}
      </button>
      {status === "ok" && <div className="formok">Заявка ушла — отвечу в течение часа. Спасибо!</div>}
      {status === "error" && (
        <div className="formok">
          Не отправилось. Напишите напрямую в{" "}
          <a href="https://t.me/lstmind" style={{ borderBottom: "1px solid currentColor" }}>
            Telegram
          </a>
          .
        </div>
      )}
      <div className="formnote">Заявка придёт мне в Telegram. Без спама и рассылок.</div>
    </form>
  );
}
