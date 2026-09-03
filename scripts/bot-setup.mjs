/**
 * Настройка бота в телеграме: вебхук на боевой домен, команды меню, описание.
 * Запуск: node scripts/bot-setup.mjs [--webhook]
 * Без флага только показывает текущее состояние и ставит команды.
 */
import { readFileSync } from "node:fs";
import { register } from "node:module";

register("./ts-loader.mjs", import.meta.url);
const { BOT_COMMANDS } = await import("../lib/bot.ts");
const { SITE } = await import("../lib/content.ts");

function env(name) {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  for (const file of [".env.local", ".env"]) {
    try {
      const m = readFileSync(file, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
      if (m) return m[1].trim().replace(/^"|"$/g, "");
    } catch {
      // файла может не быть — это нормально
    }
  }
  return "";
}

const TOKEN = env("TELEGRAM_BOT_TOKEN");
const SECRET = env("TELEGRAM_WEBHOOK_SECRET");
if (!TOKEN) {
  console.error("нет TELEGRAM_BOT_TOKEN в окружении или .env.local");
  process.exit(1);
}
const API = `https://api.telegram.org/bot${TOKEN}`;
const call = async (method, body) => {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return res.json();
};

const info = await call("getWebhookInfo");
console.log("сейчас вебхук:", info.result?.url || "не задан");
if (info.result?.last_error_message) console.log("последняя ошибка:", info.result.last_error_message);

if (process.argv.includes("--webhook")) {
  const url = `${SITE.url}/api/telegram`;
  const set = await call("setWebhook", {
    url,
    secret_token: SECRET || undefined,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: false,
  });
  console.log("новый вебхук:", url, set.ok ? "— ок" : `— ошибка: ${set.description}`);
}

const cmds = await call("setMyCommands", { commands: BOT_COMMANDS });
console.log("команды меню:", cmds.ok ? BOT_COMMANDS.map((c) => `/${c.command}`).join(" ") : cmds.description);

const desc = await call("setMyDescription", {
  description:
    "Бот Алексея (lstmind), веб-разработчика. Услуги и цены, расчёт стоимости за минуту, работы и демо-проекты, заявка напрямую.",
});
const short = await call("setMyShortDescription", {
  short_description: "Сайты, боты, админки. Цены, расчёт стоимости и заявка — прямо здесь.",
});
console.log("описание:", desc.ok && short.ok ? "обновлено" : `${desc.description || ""} ${short.description || ""}`.trim());
