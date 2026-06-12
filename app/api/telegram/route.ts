import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER = process.env.TELEGRAM_CHAT_ID;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const API = `https://api.telegram.org/bot${TOKEN}`;

type TgUser = { id: number; first_name?: string; last_name?: string; username?: string };

async function tg(method: string, body: Record<string, unknown>) {
  return fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
}

const SERVICES: Record<string, string> = {
  site: "Сайт под ключ",
  shop: "Интернет-магазин",
  fix: "Доработка / правки",
  speed: "Ускорение сайта",
  other: "Другое / вопрос",
};

const MENU = {
  inline_keyboard: [
    [
      { text: "🚀 Сайт под ключ", callback_data: "svc:site" },
      { text: "🛒 Интернет-магазин", callback_data: "svc:shop" },
    ],
    [
      { text: "🛠 Доработать сайт", callback_data: "svc:fix" },
      { text: "⚡ Ускорить сайт", callback_data: "svc:speed" },
    ],
    [{ text: "💬 Другое / спросить", callback_data: "svc:other" }],
    [
      { text: "🌐 Сайт", url: "https://lstmind.ru" },
      { text: "✍️ Написать Алексею", url: "https://t.me/lstmind" },
    ],
  ],
};

function who(u: TgUser) {
  const handle = u.username ? `@${u.username}` : "";
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return `${full || "клиент"}${handle ? ` (${handle})` : ""} [id ${u.id}]`;
}

export async function POST(req: Request) {
  if (SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!TOKEN || !OWNER) return NextResponse.json({ ok: true });

  let update: {
    message?: { from: TgUser; text?: string; caption?: string };
    callback_query?: { id: string; from: TgUser; data?: string };
  };
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    // ---- service button tapped
    if (update.callback_query) {
      const cq = update.callback_query;
      const from = cq.from;
      await tg("answerCallbackQuery", { callback_query_id: cq.id });
      if ((cq.data || "").startsWith("svc:")) {
        const svc = SERVICES[(cq.data || "").slice(4)] || "Услуга";
        await tg("sendMessage", {
          chat_id: from.id,
          text: `Отличный выбор — *${svc}* 👍\n\nОпишите в двух словах, что нужно (можно с бюджетом/сроком) — я передам Алексею, он ответит в течение часа.`,
          parse_mode: "Markdown",
        });
        if (String(from.id) !== String(OWNER)) {
          await tg("sendMessage", {
            chat_id: OWNER,
            text: `🔔 Интерес через бота\nУслуга: ${svc}\nКлиент: ${who(from)}\n— ждёт описания задачи`,
          });
        }
      }
      return NextResponse.json({ ok: true });
    }

    const msg = update.message;
    if (!msg) return NextResponse.json({ ok: true });
    const from = msg.from;
    const text = (msg.text || "").trim();

    // ---- /start
    if (text.startsWith("/start")) {
      await tg("sendMessage", {
        chat_id: from.id,
        text: "👋 Привет! Я бот Алексея — веб-разработчика.\n\nПомогу оформить заявку за минуту. Что нужно?",
        reply_markup: MENU,
      });
      return NextResponse.json({ ok: true });
    }

    // ---- owner's own messages — never treat as a lead
    if (String(from.id) === String(OWNER)) {
      return NextResponse.json({ ok: true });
    }

    // ---- any other client message → forward to owner as a lead
    if (text || msg.caption) {
      await tg("sendMessage", {
        chat_id: OWNER,
        text: `💬 Заявка из бота\nОт: ${who(from)}\n\n${text || msg.caption}`,
      });
      await tg("sendMessage", {
        chat_id: from.id,
        text: "Передал Алексею ✅ Он ответит в течение часа.\nЕсли срочно — @lstmind",
      });
    } else {
      await tg("sendMessage", {
        chat_id: OWNER,
        text: `📎 ${who(from)} прислал вложение в бот — загляни в @lstmind_bot`,
      });
      await tg("sendMessage", { chat_id: from.id, text: "Получил, передал Алексею ✅" });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("telegram webhook error", e);
    // always 200 so Telegram doesn't hammer retries
    return NextResponse.json({ ok: true });
  }
}
