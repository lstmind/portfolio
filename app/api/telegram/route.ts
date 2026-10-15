import { NextResponse } from "next/server";
import { HOURS, REPLY } from "@/lib/content";
import {
  leadPrompt,
  leadSubject,
  route,
  screenAbout,
  screenCalc1,
  screenCases,
  screenFaqGroups,
  screenLead,
  screenMain,
  screenNeed,
  screenNiches,
  screenPrices,
  screenProcess,
  screenReview,
  screenServices,
  screenWorks,
  subjectFromPrompt,
  type Btn,
  type Screen,
} from "@/lib/bot";
import { SITE } from "@/lib/content";
import { FALLBACK_REVIEWS, getKworkReviewsCount } from "@/lib/kwork";

export const runtime = "nodejs";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER = process.env.TELEGRAM_CHAT_ID;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const API = `https://api.telegram.org/bot${TOKEN}`;
const BANNER = `${SITE.url}/opengraph-image`;

type TgUser = { id: number; first_name?: string; last_name?: string; username?: string };

async function tg(method: string, body: Record<string, unknown>) {
  return fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
}
const kb = (rows: Btn[][]) => ({ inline_keyboard: rows });

function who(u: TgUser) {
  const handle = u.username ? `@${u.username}` : "";
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return `${full || "клиент"}${handle ? ` (${handle})` : ""} [id ${u.id}]`;
}
// «Ответить клиенту» кнопка владельцу (если у клиента есть @username)
function ownerReply(u: TgUser): Record<string, unknown> {
  return u.username ? { reply_markup: { inline_keyboard: [[{ text: "✍️ Ответить клиенту", url: `https://t.me/${u.username}` }]] } } : {};
}

/** число отзывов с Kwork: если профиль тормозит, берём фолбэк, а не держим вебхук */
async function reviewsCount(): Promise<number> {
  const timeout = new Promise<number>((resolve) => setTimeout(() => resolve(FALLBACK_REVIEWS), 1500));
  return Promise.race([getKworkReviewsCount(), timeout]);
}

async function screenFor(data: string): Promise<Screen | null> {
  if (data.startsWith("rev:")) return screenReview(Number(data.slice(4)) || 0, await reviewsCount());
  return route(data);
}

export async function POST(req: Request) {
  if (SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!TOKEN || !OWNER) return NextResponse.json({ ok: true });

  let update: {
    message?: {
      from: TgUser;
      text?: string;
      caption?: string;
      contact?: { phone_number: string; first_name?: string };
      reply_to_message?: { text?: string };
    };
    callback_query?: { id: string; from: TgUser; data?: string; message?: { message_id: number; chat: { id: number } } };
  };
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    if (update.callback_query) {
      const cq = update.callback_query;
      const data = cq.data || "";
      const msg = cq.message;
      await tg("answerCallbackQuery", { callback_query_id: cq.id });
      if (!msg) return NextResponse.json({ ok: true });

      let screen: Screen | null;
      if (data.startsWith("lead:")) {
        const key = data.slice(5);
        screen = screenLead(key);
        if (String(cq.from.id) !== String(OWNER)) {
          await tg("sendMessage", {
            chat_id: OWNER,
            text: `🔔 <b>Интерес через бота</b>\nТема: ${leadSubject(key)}\nКлиент: ${who(cq.from)}\n— ждёт описания задачи`,
            parse_mode: "HTML",
            ...ownerReply(cq.from),
          });
        }
        // ответ на это сообщение вернёт тему заявки — так письмо владельцу знает, о чём речь
        await tg("sendMessage", {
          chat_id: cq.from.id,
          text: leadPrompt(key),
          reply_markup: {
            force_reply: true,
            input_field_placeholder: "Опишите задачу…",
          },
        });
        await tg("sendMessage", {
          chat_id: cq.from.id,
          text: "Или поделитесь телефоном одной кнопкой — Алексей позвонит сам:",
          reply_markup: {
            keyboard: [[{ text: "📱 Поделиться телефоном", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      } else {
        screen = await screenFor(data);
      }

      if (screen) {
        await tg("editMessageCaption", {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
          caption: screen.text,
          parse_mode: "HTML",
          reply_markup: kb(screen.rows),
        });
      }
      return NextResponse.json({ ok: true });
    }

    const m = update.message;
    if (!m) return NextResponse.json({ ok: true });
    const from = m.from;
    const text = (m.text || "").trim();

    // команды → соответствующий экран баннером
    if (text.startsWith("/")) {
      const cmd = text.slice(1).split(/[\s@]/)[0];
      const map: Record<string, () => Screen | Promise<Screen>> = {
        start: screenMain,
        menu: screenMain,
        need: screenNeed,
        calc: screenCalc1,
        prices: screenPrices,
        services: screenServices,
        niches: screenNiches,
        works: screenWorks,
        cases: screenCases,
        faq: screenFaqGroups,
        process: screenProcess,
        about: screenAbout,
        reviews: async () => screenReview(0, await reviewsCount()),
      };
      const builder = map[cmd] ?? screenMain;
      const s = await builder();
      const res = await tg("sendPhoto", { chat_id: from.id, photo: BANNER, caption: s.text, parse_mode: "HTML", reply_markup: kb(s.rows) });
      if (!res.ok) {
        await tg("sendMessage", { chat_id: from.id, text: s.text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup: kb(s.rows) });
      }
      return NextResponse.json({ ok: true });
    }

    // владелец — свои сообщения не считаем заявкой
    if (String(from.id) === String(OWNER)) return NextResponse.json({ ok: true });

    // клиент поделился телефоном
    if (m.contact) {
      await tg("sendMessage", {
        chat_id: OWNER,
        text: `📱 <b>Контакт от клиента</b>\n${who(from)}\nТелефон: ${m.contact.phone_number}`,
        parse_mode: "HTML",
        ...ownerReply(from),
      });
      await tg("sendMessage", { chat_id: from.id, text: `Спасибо! Передал контакт, Алексей свяжется ${REPLY.within}, ${HOURS.full} ⏱`, reply_markup: { remove_keyboard: true } });
      return NextResponse.json({ ok: true });
    }

    // любое другое сообщение клиента → заявка владельцу
    const subject = m.reply_to_message?.text ? subjectFromPrompt(m.reply_to_message.text) : null;
    if (text || m.caption) {
      await tg("sendChatAction", { chat_id: from.id, action: "typing" });
      await tg("sendMessage", {
        chat_id: OWNER,
        text: `💬 <b>Заявка из бота</b>\nОт: ${who(from)}${subject ? `\nТема: ${subject}` : ""}\n\n${text || m.caption}`,
        parse_mode: "HTML",
        ...ownerReply(from),
      });
      await tg("sendMessage", {
        chat_id: from.id,
        text: `Передал Алексею ✅ Он ответит ${REPLY.within}, ${HOURS.full}.\nЕсли срочно, пишите @lstmind`,
        reply_markup: kb([[{ text: "🏠 В меню", callback_data: "menu" }]]),
      });
    } else {
      await tg("sendMessage", { chat_id: OWNER, text: `📎 ${who(from)} прислал вложение в бот${subject ? ` (тема: ${subject})` : ""}`, ...ownerReply(from) });
      await tg("sendMessage", { chat_id: from.id, text: "Получил, передал Алексею ✅" });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("telegram webhook error", e);
    return NextResponse.json({ ok: true });
  }
}
