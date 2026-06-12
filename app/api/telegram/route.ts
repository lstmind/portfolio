import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER = process.env.TELEGRAM_CHAT_ID;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const API = `https://api.telegram.org/bot${TOKEN}`;
const SITE = "https://lstmind.ru";
const DIRECT = "https://t.me/lstmind";
const BANNER = "https://portfolio-amber-eta-duclbiwm5n.vercel.app/opengraph-image";

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
const kb = (rows: Btn[][]) => ({ inline_keyboard: rows });
const home: Btn = { text: "🏠 В меню", callback_data: "menu" };

function who(u: TgUser) {
  const handle = u.username ? `@${u.username}` : "";
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return `${full || "клиент"}${handle ? ` (${handle})` : ""} [id ${u.id}]`;
}

// ---------------- content ----------------
type Service = { key: string; emoji: string; title: string; desc: string; price: string; term: string };
const SERVICES: Service[] = [
  { key: "site", emoji: "🚀", title: "Сайт под ключ", desc: "От идеи до публикации: структура, дизайн, вёрстка, формы заявок, базовое SEO. Не шаблон — под вашу задачу.", price: "от 25 000 ₽ — лендинг\n40 000–90 000 ₽ — многостраничный", term: "5–14 дней" },
  { key: "shop", emoji: "🛒", title: "Интернет-магазин", desc: "WooCommerce под ключ: каталог, фильтры, корзина, оплата и доставка. Перенос товаров, настройка под рекламу.", price: "от 60 000 ₽", term: "от 2 недель" },
  { key: "fix", emoji: "🛠", title: "Доработка / спасение сайта", desc: "Починю чужой сайт: вёрстка, баги, недоделки. Работаю на копии с бэкапом — рабочий сайт в безопасности.", price: "от 1 500 ₽/час", term: "от 1 дня" },
  { key: "speed", emoji: "⚡", title: "Ускорение сайта", desc: "Разгоняю до зелёного PageSpeed: картинки, кэш, чистка лишнего. Быстрый сайт = выше в выдаче и больше заявок.", price: "аудит бесплатно, работы от 5 000 ₽", term: "1–3 дня" },
  { key: "figma", emoji: "▦", title: "Вёрстка по Figma", desc: "Пиксель-в-пиксель из макета. Адаптив, чистый код, кроссбраузер. Без «почти как в дизайне».", price: "от 1 500 ₽ за экран", term: "от 1 дня" },
  { key: "migrate", emoji: "⇄", title: "Миграции и хостинг", desc: "Перенос между хостингами и доменами без простоя. SSL, почта, домен — всё настрою, сайт не упадёт.", price: "от 2 000 ₽", term: "1–2 дня" },
];

const FAQ: { q: string; a: string }[] = [
  { q: "Сколько стоит лендинг?", a: "Простой — от 25 000 ₽ (5–7 дней). Стандартный, с анимацией и проработкой — 40–70k (7–14 дней). Точную смету назову после разбора. Мелкие правки — 1 500 ₽/час." },
  { q: "Как происходит оплата?", a: "Обычно 50% предоплата, 50% после сдачи; на крупных проектах — этапами. Работаю как самозанятый, чек дам. Сначала смета — без оплаты «вслепую»." },
  { q: "Срочные сроки берёшь?", a: "Берусь — со срочной наценкой. От работы не отказываюсь: если горит, найду способ успеть. Наценку и реальный срок назову сразу." },
  { q: "Делаешь SEO?", a: "Базовое SEO — всегда: чистый код, скорость, мета-теги, структура, sitemap. Полное продвижение (семантика, тексты, ссылки) — отдельно, подскажу стратегию." },
  { q: "Поддержка после релиза?", a: "Месяц после сдачи правлю мелочи и баги бесплатно. Дальше — по часам или на абонентке. Не из тех, кто пропадает после оплаты." },
];

// ---------------- screens ----------------
function screenMain(): Screen {
  return {
    text:
      "👋 <b>Привет! Это бот Алексея</b> — веб-разработчика.\n\n" +
      "Делаю сайты, которые быстро грузятся и приносят заявки. Здесь можно изучить услуги и цены, прикинуть стоимость за минуту или сразу оставить заявку.\n\n" +
      "С чего начнём? 👇",
    rows: [
      [{ text: "🧮 Рассчитать стоимость", callback_data: "calc" }],
      [
        { text: "💼 Услуги и цены", callback_data: "services" },
        { text: "⚙️ Как я работаю", callback_data: "process" },
      ],
      [
        { text: "🗂 Работы", callback_data: "works" },
        { text: "⭐ Отзывы", callback_data: "reviews" },
        { text: "❓ Вопросы", callback_data: "faq" },
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
    text: "💼 <b>Услуги и цены</b>\n\nВыберите — расскажу, что входит, сроки и стоимость. Ни к чему не обязывает 🙂",
    rows: [...SERVICES.map((s) => [{ text: `${s.emoji} ${s.title}`, callback_data: `svc:${s.key}` }]), [home]],
  };
}

function screenService(key: string): Screen {
  const s = SERVICES.find((x) => x.key === key) || SERVICES[0];
  return {
    text:
      `${s.emoji} <b>${s.title}</b>\n\n${s.desc}\n\n` +
      `💰 <b>Цена:</b> ${s.price}\n⏱ <b>Срок:</b> ${s.term}\n\n` +
      `<i>Точную смету назову после короткого разбора — бесплатно и без обязательств.</i>`,
    rows: [
      [{ text: "📝 Оставить заявку на это", callback_data: `lead:${s.key}` }],
      [{ text: "⬅️ К услугам", callback_data: "services" }, home],
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
    rows: [[{ text: "📝 Оставить заявку", callback_data: "lead:other" }], [home]],
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
      [{ text: "Сказ по краю ↗", url: "https://www.skazpokrayu.ru/" }, { text: "СибСтар ↗", url: "https://tksibstar.com/" }],
      [{ text: "Well Event ↗", url: "https://wellevent.ru/" }, { text: "Бренд ↗", url: "https://skazpokrayu.online/" }],
      [home],
    ],
  };
}

function screenReviews(): Screen {
  return {
    text:
      "⭐ <b>Отзывы клиентов</b>\n\n" +
      "<b>5.0</b> на Kwork · 28 отзывов · 0 отрицательных\n\n" +
      "«Уже в третий раз убеждаюсь в профессионализме и внимании к деталям. Всё аккуратно, с отличным результатом. Обязательно обращусь снова!»\n— <i>13Mieva</i>\n\n" +
      "«Как всегда всё на высшем уровне, продолжаем работать. Рекомендую.»\n— <i>managermoon</i>\n\n" +
      "«Выполнил задачу быстро и качественно.»\n— <i>Kabelgroup</i>",
    rows: [[{ text: "Все отзывы на Kwork ↗", url: "https://kwork.ru/user/lstmind" }], [home]],
  };
}

function screenFaqList(): Screen {
  return {
    text: "❓ <b>Частые вопросы</b>\n\nВыберите вопрос — отвечу заранее:",
    rows: [...FAQ.map((f, i) => [{ text: f.q, callback_data: `faq:${i}` }]), [home]],
  };
}
function screenFaq(i: number): Screen {
  const f = FAQ[i] || FAQ[0];
  return {
    text: `❓ <b>${f.q}</b>\n\n${f.a}`,
    rows: [[{ text: "⬅️ Вопросы", callback_data: "faq" }, home]],
  };
}

// ---------------- calculator ----------------
const CALC_TYPES: Record<string, string> = { land: "Лендинг", multi: "Многостраничный сайт", shop: "Интернет-магазин", fix: "Доработка сайта" };
const CALC_SCALE: Record<string, string> = { s: "Простой", m: "Стандартный", l: "Сложный" };
const CALC_URG: Record<string, string> = { n: "Не горит", w: "2–3 недели", u: "Срочно" };
// диапазоны в тыс. ₽: [low, high] по [s,m,l]
const PRICES: Record<string, [number, number][]> = {
  land: [[25, 40], [40, 65], [65, 95]],
  multi: [[50, 80], [80, 140], [140, 220]],
  shop: [[60, 110], [110, 190], [190, 330]],
  fix: [[5, 15], [15, 40], [40, 90]],
};
const TERMS: Record<string, string[]> = {
  land: ["5–10 дней", "1–2 недели", "2–3 недели"],
  multi: ["1–2 недели", "2–4 недели", "1–2 месяца"],
  shop: ["2–3 недели", "1–2 месяца", "от 2 месяцев"],
  fix: ["1–3 дня", "3–10 дней", "от 2 недель"],
};

function screenCalc1(): Screen {
  return {
    text: "🧮 <b>Калькулятор стоимости</b>\n\nЗа минуту прикину вилку цены и срок. Без обязательств.\n\n<b>1/3 — что нужно?</b>",
    rows: [
      [{ text: "Лендинг", callback_data: "calc:land" }, { text: "Многостраничный", callback_data: "calc:multi" }],
      [{ text: "Интернет-магазин", callback_data: "calc:shop" }, { text: "Доработка", callback_data: "calc:fix" }],
      [home],
    ],
  };
}
function screenCalc2(type: string): Screen {
  return {
    text: `🧮 <b>${CALC_TYPES[type]}</b>\n\n<b>2/3 — масштаб?</b>`,
    rows: [
      [{ text: "Простой", callback_data: `calc:${type}:s` }, { text: "Стандартный", callback_data: `calc:${type}:m` }, { text: "Сложный", callback_data: `calc:${type}:l` }],
      [{ text: "⬅️ Назад", callback_data: "calc" }, home],
    ],
  };
}
function screenCalc3(type: string, scale: string): Screen {
  return {
    text: `🧮 <b>${CALC_TYPES[type]} · ${CALC_SCALE[scale]}</b>\n\n<b>3/3 — сроки?</b>`,
    rows: [
      [{ text: "Не горит", callback_data: `calc:${type}:${scale}:n` }, { text: "2–3 недели", callback_data: `calc:${type}:${scale}:w` }, { text: "Срочно", callback_data: `calc:${type}:${scale}:u` }],
      [{ text: "⬅️ Назад", callback_data: `calc:${type}` }, home],
    ],
  };
}
function screenCalcResult(type: string, scale: string, urg: string): Screen {
  const idx = scale === "s" ? 0 : scale === "m" ? 1 : 2;
  const [lo, hi] = PRICES[type][idx];
  const mult = urg === "u" ? 1.25 : 1;
  const low = Math.round((lo * mult) / 5) * 5;
  const high = Math.round((hi * mult) / 5) * 5;
  const term = urg === "u" ? "срочно — обсудим" : TERMS[type][idx];
  return {
    text:
      "🧮 <b>Примерный расчёт</b>\n\n" +
      `Тип: <b>${CALC_TYPES[type]}</b>\nМасштаб: ${CALC_SCALE[scale]}\nСроки: ${CALC_URG[urg]}\n\n` +
      `💰 <b>≈ ${low} 000 – ${high} 000 ₽</b>\n⏱ ${term}\n\n` +
      "<i>Это ориентир. Точную фикс-смету назову после короткого разбора — бесплатно.</i>",
    rows: [
      [{ text: "📝 Оставить заявку", callback_data: `lead:calc_${type}` }],
      [{ text: "🔄 Пересчитать", callback_data: "calc" }, home],
    ],
  };
}

function screenLead(key: string): { screen: Screen; svc: string } {
  let svc = "не выбрана";
  if (key.startsWith("calc_")) svc = `расчёт: ${CALC_TYPES[key.slice(5)] || ""}`.trim();
  else { const s = SERVICES.find((x) => x.key === key); if (s) svc = s.title; }
  return {
    screen: {
      text:
        "📝 <b>Заявка</b>\n\n" +
        (svc !== "не выбрана" ? `Услуга: <b>${svc}</b>\n\n` : "") +
        "Напишите одним сообщением, что нужно — можно с бюджетом и сроком. Если удобно, оставьте контакт (@ник или телефон).\n\n" +
        "Алексей ответит в течение часа ⏱",
      rows: [[home]],
    },
    svc,
  };
}

function route(data: string): Screen | null {
  if (data === "menu") return screenMain();
  if (data === "services") return screenServices();
  if (data === "process") return screenProcess();
  if (data === "works") return screenWorks();
  if (data === "reviews") return screenReviews();
  if (data === "faq") return screenFaqList();
  if (data.startsWith("faq:")) return screenFaq(Number(data.slice(4)) || 0);
  if (data.startsWith("svc:")) return screenService(data.slice(4));
  if (data === "calc") return screenCalc1();
  if (data.startsWith("calc:")) {
    const p = data.split(":"); // calc:type[:scale[:urg]]
    if (p.length === 2) return screenCalc2(p[1]);
    if (p.length === 3) return screenCalc3(p[1], p[2]);
    if (p.length === 4) return screenCalcResult(p[1], p[2], p[3]);
  }
  return null;
}

// ---------------- handler ----------------
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
    if (update.callback_query) {
      const cq = update.callback_query;
      const data = cq.data || "";
      const msg = cq.message;
      await tg("answerCallbackQuery", { callback_query_id: cq.id });
      if (!msg) return NextResponse.json({ ok: true });

      let screen: Screen | null;
      if (data.startsWith("lead:")) {
        const { screen: s, svc } = screenLead(data.slice(5));
        screen = s;
        if (String(cq.from.id) !== String(OWNER)) {
          await tg("sendMessage", {
            chat_id: OWNER,
            text: `🔔 <b>Интерес через бота</b>\nУслуга: ${svc}\nКлиент: ${who(cq.from)}\n— ждёт описания задачи`,
            parse_mode: "HTML",
          });
        }
      } else {
        screen = route(data);
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

    if (text.startsWith("/start") || text === "/menu") {
      const s = screenMain();
      const res = await tg("sendPhoto", {
        chat_id: from.id,
        photo: BANNER,
        caption: s.text,
        parse_mode: "HTML",
        reply_markup: kb(s.rows),
      });
      // если баннер не загрузился — текстовый фолбэк
      if (!res.ok) {
        await tg("sendMessage", { chat_id: from.id, text: s.text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup: kb(s.rows) });
      }
      return NextResponse.json({ ok: true });
    }

    if (String(from.id) === String(OWNER)) return NextResponse.json({ ok: true });

    if (text || m.caption) {
      await tg("sendChatAction", { chat_id: from.id, action: "typing" });
      await tg("sendMessage", { chat_id: OWNER, text: `💬 <b>Заявка из бота</b>\nОт: ${who(from)}\n\n${text || m.caption}`, parse_mode: "HTML" });
      await tg("sendMessage", { chat_id: from.id, text: "Передал Алексею ✅ Он ответит в течение часа.\nЕсли срочно — @lstmind" });
    } else {
      await tg("sendMessage", { chat_id: OWNER, text: `📎 ${who(from)} прислал вложение в бот` });
      await tg("sendMessage", { chat_id: from.id, text: "Получил, передал Алексею ✅" });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("telegram webhook error", e);
    return NextResponse.json({ ok: true });
  }
}
