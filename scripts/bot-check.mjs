/**
 * Проверка экранов бота без телеграма: лимиты подписи и callback_data,
 * живые ссылки в кнопках, отсутствие битых маршрутов.
 * Запуск: node scripts/bot-check.mjs
 */
import { register } from "node:module";

// lib/*.ts ходят друг к другу через алиас @/ и импорты без расширения — учим этому node
register("./ts-loader.mjs", import.meta.url);

const bot = await import("../lib/bot.ts");
const { INDUSTRY_PAGES } = await import("../lib/industries.ts");
const { CALC, FAQ, REVIEWS } = await import("../lib/content.ts");
const { CASE_PAGES } = await import("../lib/cases.ts");

// bot.ts режет текст на 1000 символах (LIMIT). Сравнивать с телеграмными 1024
// бессмысленно: обрезание случится раньше, и проверка его не увидит.
const CAPTION_LIMIT = 1000;
const problems = [];
const screens = [];

const add = (name, screen) => screens.push([name, screen]);

add("menu", bot.screenMain());
add("need", bot.screenNeed());
for (const k of ["new", "fix", "ads", "auto", "seo", "design"]) add(`need:${k}`, bot.screenNeedPick(k));
add("services", bot.screenServices());
add("services2", bot.screenServicesExtra());
add("prices", bot.screenPrices());
add("niches", bot.screenNiches());
add("works", bot.screenWorks());
add("cases", bot.screenCases());
add("about", bot.screenAbout());
add("nope", bot.screenNotDoing());
add("faq", bot.screenFaqGroups());
add("process", bot.screenProcess());
add("calc", bot.screenCalc1());
for (const slug of bot.ALL_SERVICE_SLUGS) add(`svc:${slug}`, bot.screenService(slug));
for (const i of INDUSTRY_PAGES) add(`ind:${i.slug}`, bot.screenNiche(i.slug));
for (const c of CASE_PAGES) add(`case:${c.slug}`, bot.screenCase(c.slug));
for (const g of ["money", "time", "tech", "trust"]) add(`faqg:${g}`, bot.screenFaqList(g));
for (let i = 0; i < FAQ.length; i++) add(`faq:${i}`, bot.screenFaq(i));
for (let i = 0; i < REVIEWS.length; i++) add(`rev:${i}`, bot.screenReview(i, 29));
for (const t of CALC.types) {
  add(`calc:${t.k}`, bot.screenCalc2(t.k));
  add(`calc:${t.k}:m`, bot.screenCalc3(t.k, "m"));
  for (const s of ["s", "m", "l"]) {
    for (const u of ["n", "w", "u"]) add(`calc:${t.k}:${s}:${u}`, bot.screenCalcResult(t.k, s, u));
  }
}
add("lead:telegram-bot", bot.screenLead("telegram-bot"));
add("lead:calc_bot", bot.screenLead("calc_bot"));
add("lead:ind_dostavka-edy", bot.screenLead("ind_dostavka-edy"));
add("lead:case_drovyanaya", bot.screenLead("case_drovyanaya"));
add("lead:other", bot.screenLead("other"));

// тема заявки должна возвращаться из ответа клиента
for (const key of ["telegram-bot", "calc_bot", "ind_dostavka-edy", "case_drovyanaya"]) {
  const back = bot.subjectFromPrompt(bot.leadPrompt(key));
  if (back !== bot.leadSubject(key)) problems.push(`тема заявки не вернулась: ${key} → ${back}`);
}

const callbacks = new Set();

for (const [name, s] of screens) {
  const len = [...s.text].length;
  if (len > CAPTION_LIMIT) problems.push(`${name}: подпись ${len} символов, лимит ${CAPTION_LIMIT}`);
  if (!s.rows.length) problems.push(`${name}: нет кнопок`);
  for (const row of s.rows) {
    if (row.length > 3) problems.push(`${name}: ${row.length} кнопок в ряду — на телефоне не влезет`);
    for (const b of row) {
      if (!b.text) problems.push(`${name}: кнопка без текста`);
      if (!b.url && !b.callback_data) problems.push(`${name}: кнопка «${b.text}» никуда не ведёт`);
      if (b.callback_data) {
        if (Buffer.byteLength(b.callback_data) > 64) problems.push(`${name}: callback_data длиннее 64 байт: ${b.callback_data}`);
        callbacks.add(b.callback_data);
      }
      if (b.url && !/^https:\/\//.test(b.url)) problems.push(`${name}: ссылка не https: ${b.url}`);
    }
  }
}

// каждая кнопка-callback должна вести на существующий экран
for (const data of callbacks) {
  if (data.startsWith("lead:")) continue;
  // отзывы собираются в вебхуке: им нужно живое число с Kwork
  if (data.startsWith("rev:")) continue;
  if (!bot.route(data)) problems.push(`нет экрана для кнопки: ${data}`);
}

// незакрытые html-теги ломают parse_mode=HTML — телеграм отвечает ошибкой и экран не меняется
for (const [name, s] of screens) {
  const open = (s.text.match(/<b>/g) || []).length + (s.text.match(/<i>/g) || []).length;
  const close = (s.text.match(/<\/b>/g) || []).length + (s.text.match(/<\/i>/g) || []).length;
  if (open !== close) problems.push(`${name}: незакрытый тег (${open} открытых, ${close} закрытых)`);
}

const longest = screens.map(([n, s]) => [n, [...s.text].length]).sort((a, b) => b[1] - a[1])[0];
console.log(`экранов: ${screens.length}, кнопок-переходов: ${callbacks.size}, самый длинный: ${longest[0]} (${longest[1]} симв.)`);
console.log(problems.length ? `ПРОБЛЕМЫ:\n${problems.join("\n")}` : "экраны в порядке");
process.exit(problems.length ? 1 : 0);
