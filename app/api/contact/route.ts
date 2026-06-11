import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { name?: string; contact?: string; task?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  // honeypot — silently accept, drop bots
  if (body.company) return NextResponse.json({ ok: true });

  const name = (body.name || "").toString().slice(0, 200).trim();
  const contact = (body.contact || "").toString().slice(0, 200).trim();
  const task = (body.task || "").toString().slice(0, 2000).trim();

  if (!name || !contact) {
    return NextResponse.json({ ok: false, error: "name and contact required" }, { status: 422 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("Telegram env vars are not set (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)");
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 500 });
  }

  const text =
    `🔥 Новая заявка с сайта\n\n` +
    `👤 Имя: ${name}\n` +
    `📨 Контакт: ${contact}\n` +
    (task ? `📝 Задача: ${task}\n` : "");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) {
      console.error("Telegram API error", await res.text());
      return NextResponse.json({ ok: false, error: "telegram failed" }, { status: 502 });
    }
  } catch (e) {
    console.error("Telegram request failed", e);
    return NextResponse.json({ ok: false, error: "telegram failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
