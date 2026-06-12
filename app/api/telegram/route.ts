import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER = process.env.TELEGRAM_CHAT_ID;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const API = `https://api.telegram.org/bot${TOKEN}`;
const SITE = "https://lstmind.ru";
const DIRECT = "https://t.me/lstmind";

type TgUser = { id: number; first_name?: string; last_name?: string; username?: string };
type Btn = { text: string; callback_data?: string; url?: string };
type Screen = { text: string; rows: Btn[][] };

async function tg(method: string, body: Record<string, unknown>) {
  return fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
}

function who(u: TgUser) {
  const handle = u.username ? `@${u.username}` : "";
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return `${full || "клиент"}${handle ? ` (${handle})` : ""} [id ${u.id}]`;
}

type Service = {
  key: string;
  emoji: string;
  title: string;
  desc: string;
  price: string;
  term: string;
};

const SERVICES: Service[] = [
  {
    key: "site",
    emoji: "🚀",
    title: "Сайт под ключ",
    desc: "От идеи до публикации: структура, дизайн, вёрстка, формы заявок, базовое SEO. Не шаблон — под вашу задачу.",
    price: "от 25 000 ₽ — лендинг\n40 000–90 000 ₽ — многостраничный",
    term: "5–14 дней",
  },
  {
    key: "shop",
    emoji: "🛒",
    title: "Интернет-магазин",
    desc: "WooCommerce под ключ: каталог, фильтры, корзина, оплата и доставка. Перенос товаров, настройка под рекламу.",
    price: "от 60 000 ₽",
    term: "от 2 недель",
  },
  {
    key: "fix",
    emoji: "🛠",
    title: "Доработка / спасение сайта",
    desc: "Починю чужой сайт: вёрстка, баги, недоделки. Работаю на копии с бэкапом — рабочий сайт в безопасности.",
    price: "от 1 500 ₽/час",
    term: "от 1 дня",
  },
  {
    key: "speed",
    emoji: "⚡",
    title: "Ускорение сайта",
    desc: "Разгоняю до зелёного PageSpeed: картинки, кэш, чистка лишнего. Быстрый сайт = выше в выдаче и больше заявок.",
    price: "аудит бесплатно, работы от 5 000 ₽",
    term: "1–3 дня",
  },
  {
    key: "figma",
    emoji: "▦",
    title: "Вёрстка по Figma",
    desc: "Пиксель-в-пиксель из макета. Адаптив, чистый код, кроссбраузер. Без «почти как в дизайне».",
    price: "от 1 500 ₽ за экран",
    term: "от 1 дня",
  },
  {
    key: "migrate",
    emoji: "⇄",
    title: "Миграции и хостинг",
    desc: "Перенос между хостингами и доменами без простоя. SSL, почта, домен — всё настрою, сайт не упадёт.",
    price: "от 2 000 ₽",
    term: "1–2 дня",
  },
];

const back = (cb: string, label = "⬅️ Назад"): Btn => ({ text: label, callback_data: cb });
const home: Btn = { text: "🏠 В меню", callback_data: "menu" };

function screenMain(): Screen {
  return {
    text:
      "👋 <b>Привет! Это бот Алексея</b> — веб-разработчика.\n\n" +
      "Делаю сайты, которые быстро грузятся и приносят заявки. Здесь можно спокойно изучить услуги и цены, а как надумаете — оставить заявку за минуту.\n\n" +
      "С чего начнём? 👇",
    rows: [
      [{ text: "💼 Услуги и цены", callback_data: "services" }],
      [
        { text: "⚙️ Как я работаю", callback_data: "process" },
        { text: "🗂 Мои работы", callback_data: "works" },
      ],
      [{ text: "📝 Оставить заявку", callback_data: "lead:other" }],
      [
        { text: "🌐 Сайт", url: SITE },
        { text: "✍️ Написать напрямую", url: DIRECT },
      ],
    ],
  };
}

function screenServices(): Screen {
  return {
    text:
      "💼 <b>Услуги и цены</b>\n\n" +
      "Выберите — расскажу, что входит, сроки и стоимость. Ни к чему не обязывает 🙂",
    rows: [
      ...SERVICES.map((s) => [{ text: `${s.emoji} ${s.title}`, callback_data: `svc:${s.key}` }]),
      [home],
    ],
  };
}

function screenService(key: string): Screen {
  const s = SERVICES.find((x) => x.key === key) || SERVICES[0];
  return {
    text:
      `${s.emoji} <b>${s.title}</b>\n\n` +
      `${s.desc}\n\n` +
      `💰 <b>Цена:</b> ${s.price}\n` +
      `⏱ <b>Срок:</b> ${s.term}\n\n` +
      `<i>Точную смету назову после короткого разбора — бесплатно и без обязательств.</i>`,
    rows: [
      [{ text: "📝 Оставить заявку на это", callback_data: `lead:${s.key}` }],
      [back("services", "⬅️ К услугам"), home],
    ],
  };
}

function screenProcess(): Screen {
  return {
    text:
      "⚙️ <b>Как я работаю</b>\n\n" +
      "1. <b>Разбор задачи</b> — что нужно, кому, бюджет и срок.\n" +
      "2. <b>Смета и сроки</b> — фикс-цена до старта, без «это считается отдельно».\n" +
      "3. <b>Дизайн + код</b> — делаю сам, не передаю по цепочке фрилансеров.\n" +
      "4. <b>Не трогаю ваш прод</b> — работаю на копии с бэкапом.\n" +
      "5. <b>Запуск + поддержка</b> — месяц правок после релиза бесплатно.\n\n" +
      "Коротко: понятно, аккуратно, без воды.",
    rows: [
      [{ text: "📝 Оставить заявку", callback_data: "lead:other" }],
      [home],
    ],
  };
}

function screenWorks(): Screen {
  return {
    text:
      "🗂 <b>Мои работы</b> — живые сайты, а не картинки:\n\n" +
      "• <b>Сказ по краю</b> — магазин арт-керамики (WordPress + WooCommerce)\n" +
      "• <b>СибСтар</b> — сайт грузоперевозок с нуля\n" +
      "• <b>Well Event</b> — кейтеринг-сервис\n" +
      "• <b>Сказ по краю</b> — бренд-лендинг (Webflow)\n\n" +
      "Открыть — кнопками ниже 👇",
    rows: [
      [
        { text: "Сказ по краю ↗", url: "https://www.skazpokrayu.ru/" },
        { text: "СибСтар ↗", url: "https://tksibstar.com/" },
      ],
      [
        { text: "Well Event ↗", url: "https://wellevent.ru/" },
        { text: "Бренд (Webflow) ↗", url: "https://skazpokrayu.online/" },
      ],
      [home],
    ],
  };
}

function screenLead(key: string): { screen: Screen; svc: string } {
  const s = SERVICES.find((x) => x.key === key);
  const svc = s ? s.title : "не выбрана";
  return {
    screen: {
      text:
        "📝 <b>Заявка</b>\n\n" +
        (s ? `Услуга: <b>${s.title}</b>\n\n` : "") +
        "Напишите одним сообщением, что нужно — можно с бюджетом и сроком. Если удобно, оставьте контакт (@ник или телефон).\n\n" +
        "Алексей ответит в течение часа ⏱",
      rows: [[home]],
    },
    svc,
  };
}

function kb(rows: Btn[][]) {
  return { inline_keyboard: rows };
}

export async function POST(req: Request) {
  if (SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!TOKEN || !OWNER) return NextResponse.json({ ok: true });

  let update: {
    message?: { from: TgUser; text?: string; caption?: string };
    callback_query?: { id: string; from: TgUser; data?: string; message?: { message_id: number; chat: { id: number } } };
  };
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    // ---------- inline navigation ----------
    if (update.callback_query) {
      const cq = update.callback_query;
      const data = cq.data || "";
      const msg = cq.message;
      await tg("answerCallbackQuery", { callback_query_id: cq.id });
      if (!msg) return NextResponse.json({ ok: true });

      let screen: Screen | null = null;
      if (data === "menu") screen = screenMain();
      else if (data === "services") screen = screenServices();
      else if (data === "process") screen = screenProcess();
      else if (data === "works") screen = screenWorks();
      else if (data.startsWith("svc:")) screen = screenService(data.slice(4));
      else if (data.startsWith("lead:")) {
        const { screen: s, svc } = screenLead(data.slice(5));
        screen = s;
        if (String(cq.from.id) !== String(OWNER)) {
          await tg("sendMessage", {
            chat_id: OWNER,
            text: `🔔 <b>Интерес через бота</b>\nУслуга: ${svc}\nКлиент: ${who(cq.from)}\n— ждёт описания задачи`,
            parse_mode: "HTML",
          });
        }
      }

      if (screen) {
        await tg("editMessageText", {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
          text: screen.text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: kb(screen.rows),
        });
      }
      return NextResponse.json({ ok: true });
    }

    // ---------- messages ----------
    const m = update.message;
    if (!m) return NextResponse.json({ ok: true });
    const from = m.from;
    const text = (m.text || "").trim();

    if (text.startsWith("/start") || text === "/menu") {
      const s = screenMain();
      await tg("sendMessage", {
        chat_id: from.id,
        text: s.text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: kb(s.rows),
      });
      return NextResponse.json({ ok: true });
    }

    // owner's own messages — never treat as a lead
    if (String(from.id) === String(OWNER)) {
      return NextResponse.json({ ok: true });
    }

    // any other client message → forward to owner as a lead
    if (text || m.caption) {
      await tg("sendMessage", {
        chat_id: OWNER,
        text: `💬 <b>Заявка из бота</b>\nОт: ${who(from)}\n\n${text || m.caption}`,
        parse_mode: "HTML",
      });
      await tg("sendMessage", {
        chat_id: from.id,
        text: "Передал Алексею ✅ Он ответит в течение часа.\nЕсли срочно — @lstmind",
      });
    } else {
      await tg("sendMessage", {
        chat_id: OWNER,
        text: `📎 ${who(from)} прислал вложение в бот`,
      });
      await tg("sendMessage", { chat_id: from.id, text: "Получил, передал Алексею ✅" });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("telegram webhook error", e);
    return NextResponse.json({ ok: true });
  }
}
