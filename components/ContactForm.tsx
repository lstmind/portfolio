"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // honeypot
    if (data.get("company")) return;
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
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="reveal" onSubmit={onSubmit}>
      <input className="hp" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" name="company" />
      <div className="field">
        <label htmlFor="cf-name">Как вас зовут</label>
        <input id="cf-name" name="name" type="text" placeholder="Имя" required />
      </div>
      <div className="field">
        <label htmlFor="cf-contact">Как связаться</label>
        <input id="cf-contact" name="contact" type="text" placeholder="@telegram или телефон" required />
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
