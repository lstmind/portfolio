import { NextResponse, after } from "next/server";
import { saveLead, type Lead } from "./store";
import { mailOn, sendMail } from "./mail";

export const runtime = "nodejs";

const EMAIL = /^[^\s<>@"]+@[^\s<>@"]+\.[^\s<>@"]+$/;

/**
 * Заявка с формы. Порядок важен для закона о персональных данных (первая запись в России):
 * 1) строка в файл на сервере (LEADS_FILE, см. store.ts); не записалось: ошибка в лог, заявка всё равно идёт дальше;
 * 2) Telegram, как раньше, и письмо на почту, если настроен SMTP (mail.ts). Если файл не записался,
 *    первой копией в России становится письмо: Telegram ждёт, пока оно уйдёт (или не уйдёт, тогда заявку не теряем).
 * Человеку "дошло", если заявку получил хотя бы один канал, который я читаю: Telegram или почта.
 */
export async function POST(req: Request) {
  let body: {
    name?: string;
    contact?: string;
    task?: string;
    company?: string;
    budget?: string;
    page?: string;
    from?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });

  // honeypot — silently accept, drop bots
  if (body.company) return NextResponse.json({ ok: true });

  const name = (body.name || "").toString().slice(0, 200).trim();
  const contact = (body.contact || "").toString().slice(0, 200).trim();
  const task = (body.task || "").toString().slice(0, 2000).trim();

  if (!name || !contact) {
    return NextResponse.json({ ok: false, error: "name and contact required" }, { status: 422 });
  }

  // страница и источник: без них не понять, какие страницы реально приносят заявки
  const budget = (body.budget || "").toString().slice(0, 60).trim();
  const page = (body.page || "").toString().slice(0, 200).trim();
  const from = (body.from || "").toString().slice(0, 200).trim();

  const lead: Lead = { t: new Date().toISOString(), name, contact, task, budget, page, from };
  let saved = true;
  try {
    await saveLead(lead);
  } catch (e) {
    saved = false;
    // в лог только причина, без данных заявки
    console.error("lead file write failed:", (e as NodeJS.ErrnoException)?.code || (e as Error)?.message);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const tgOn = !!(token && chatId);
  const mail = mailOn();
  if (!tgOn && !mail) {
    console.error("Telegram env vars are not set (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID), SMTP is off");
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 500 });
  }

  const text =
    `🔥 Новая заявка с сайта\n\n` +
    `👤 Имя: ${name}\n` +
    `📨 Контакт: ${contact}\n` +
    (task ? `📝 Задача: ${task}\n` : "") +
    (budget ? `💰 Бюджет: ${budget}\n` : "") +
    (page ? `📄 Страница: ${page}\n` : "") +
    (from ? `↩️ Источник: ${from}\n` : "");

  // письмо уходит параллельно с Telegram; ждём его, только если Telegram не доставил
  const mailing = mail
    ? sendMail({
        subject: `Заявка с сайта: ${name}`.slice(0, 120),
        text:
          `Новая заявка с сайта lstmind.ru\n\n` +
          `Имя: ${name}\nКонтакт: ${contact}\n` +
          (task ? `Задача: ${task}\n` : "") +
          (budget ? `Бюджет: ${budget}\n` : "") +
          (page ? `Страница: ${page}\n` : "") +
          (from ? `Источник: ${from}\n` : "") +
          `\nВремя: ${lead.t}\n`,
        replyTo: EMAIL.test(contact) ? contact : undefined,
      }).then(
        () => true,
        (e: Error) => {
          console.error("lead mail failed:", e?.message);
          return false;
        },
      )
    : Promise.resolve(false);
  // файл не записался: сначала письмо (серверы в России), потом Telegram
  if (!saved) await mailing;

  let tgOk = false;
  if (tgOn) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      if (res.ok) tgOk = true;
      else console.error("Telegram API error", await res.text());
    } catch (e) {
      console.error("Telegram request failed", e);
    }
  }

  if (tgOk) {
    // ответ человеку не ждёт почту: письмо досылается после ответа
    after(() => mailing);
    return NextResponse.json({ ok: true });
  }
  if (await mailing) return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false, error: "delivery failed" }, { status: 502 });
}
