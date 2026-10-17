/**
 * Страж оформления текстов: прогоняет видимые строки из данных сайта по правилам
 * design-concepts/v4/typo/STYLEGUIDE.md и не даёт собрать сайт, если что-то выбилось.
 * Запуск: node scripts/typo-check.mjs (сам вызывается перед npm run build).
 *
 * Что смотрит:
 *  - строковые значения всех экспортов из файлов DATA (рекурсивно, функции пропускает);
 *  - пункты списков (LISTS): с заглавной буквы и без точки в конце;
 *  - текст между тегами в components/**\/*.tsx (длинное тире) и массивы-списки в них (const ИМЯ = ["…"]).
 * Дословные отзывы не проверяются: любая строка, которая целиком входит в отзыв
 * из lib/reviews.ts или REVIEWS, пропускается.
 */
import { register } from "node:module";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

register("./ts-loader.mjs", import.meta.url);

const ROOT = fileURLToPath(new URL("../", import.meta.url));

const DATA = [
  "lib/services.ts",
  "lib/industries.ts",
  "lib/cases.ts",
  "lib/content.ts",
  "lib/cta.ts",
  "lib/home.ts",
  "components/v4/legal/docs.ts",
];
/** файлы, где смотрим только пункты списков из LISTS (в остальном там слова под вёрстку: "Пишу на Битриксе") */
const LIST_ONLY = ["components/v4/about/data.ts"];

const L = "А-Яа-яЁё";

/** [название, регулярка, пояснение]; регулярка с флагом g */
const RULES = [
  ["длинное тире", /—/g, "вместо него двоеточие, запятая, точка или скобки"],
  ["прямые кавычки", new RegExp(`"(?=[${L}])|(?<=[${L}.,!?])"`, "g"), "«ёлочки», внутри „лапки“"],
  ["k в цене", /\d\s?[kк](?![A-Za-zЀ-ӿ])/g, "от 60 000 ₽ или 25–40 тыс. ₽"],
  ["тыс без точки", /(?<![Ѐ-ӿ])тыс(?![Ѐ-ӿ.])/g, "тыс. ₽"],
  ["тыс. без ₽", /тыс\.(?![\s ⁠]*₽)/g, "вилка пишется 50–100 тыс. ₽"],
  ["₽ вплотную к числу", /\d₽/g, "2 000 ₽"],
  ["рубли словом", /\d[\s ]?(руб\.?|р\.)(?![Ѐ-ӿ])/g, "только знак ₽"],
  ["ставка не ₽/час", /₽\s(в|за)\sчас|₽\/ч(?![Ѐ-ӿ])/g, "2 000 ₽/час"],
  ["абонемент ₽/мес", /₽\/мес/g, "от 6 000 ₽ в месяц"],
  ["короткое тире не в диапазоне", /(?<![\d½IVX])–|–(?![⁠]?\d)/g, "короткое тире только между числами: 3–5 дней"],
  ["дефис вместо тире", new RegExp(`[${L}\\d,)»] - [${L}\\d«(]`, "g"), "длинного тире нет, дефис только внутри слова"],
  ["три точки", /\.\.\./g, "многоточие одним знаком …"],
  ["почта", /(?<![\w@./-])(e-?mail|имейл)(?![\w.@-])/gi, "пишем «почта»"],
  ["Telegram-бот", /Telegram-бот/g, "телеграм-бот"],
  ["Битрикс без 1С-", /(?<!1С-)(?<!1C-)Битрикс(?!24|\s24)/g, "1С-Битрикс (не путать с Битрикс24)"],
  ["1C латиницей", /(?<![A-Za-z0-9])1C(?![A-Za-z0-9])/g, "1С с кириллической С"],
  ["Яндекс с точкой", /Яндекс\.(Метрик|Директ|Бизнес|Вебмастер)/g, "Яндекс Метрика, без точки"],
  ["Тильда", /Тильд/g, "Tilda, не склоняем"],
  ["ВК", /(?<![Ѐ-ӿ])(ВК|Вконтакте)(?![Ѐ-ӿ])/g, "ВКонтакте"],
  ["Wordpress", /Wordpress|Woocommerce|Opencart|Pagespeed/g, "WordPress, WooCommerce, OpenCart, PageSpeed"],
  ["строчные аббревиатуры", new RegExp(`(?<![\\w./@:#-])(api|utm|csv|pdf|webp|https|ssh|sqlite|crm)(?![\\w.:/=-])(?=[\\s,.;:)»]|$)`, "g"), "API, UTM, CSV, PDF, WebP, HTTPS, SSH, SQLite, CRM"],
  ["«Мой налог» без ёлочек", /(?<!«)Мой [нН]алог/g, "«Мой налог»"],
  ["срок словом", /от (одного|двух|трёх|четырёх|пяти|полутора) (дн|рабоч|недел)/g, "от 1 дня, от 2 дней, от 2 недель, от 1,5 недели"],
  ["срок словами через дефис", /(одну-две|одного-двух|две-три|два-три|двух-трёх|три-четыре) (дн|день|дня|недел|месяц)/g, "2–3 недели"],
  ["сокращение слитно", /(?<![Ѐ-ӿ])т\.[ед]\.|и т\.[дп]\./g, "т. е., и т. д."],
];

/**
 * Пункты списков: первая буква заглавная, точки в конце нет (решение владельца 17.10.2026).
 * Ключ: файл, значение: регулярки на путь до строки (как его строит walk: SERVICE_PAGES[3].includes[0]).
 * Новое поле-список на сайте: допишите его сюда, иначе страж его не увидит.
 */
const LISTS = {
  "lib/services.ts": [/\.includes\[\d+\]$/, /\.fit\[\d+\]$/, /\.focus\.signs\[\d+\]$/, /\.focus\.does\[\d+\]$/],
  "lib/industries.ts": [/\.includes\[\d+\]$/],
  "lib/cases.ts": [/\.done\[\d+\]$/],
  "lib/cta.ts": [/\.checks\[\d+\]$/, /^PRICE_FACTORS\.items\[\d+\]\.t$/],
  "lib/home.ts": [/^PROCESS_SPEC\.(left|right)\[\d+\]$/],
  "lib/content.ts": [/^STACK\[\d+\]$/, /\.stack\[\d+\]$/],
  "components/v4/legal/docs.ts": [/\.short\[\d+\]$/, /\.ul\[\d+\]$/, /\.dl\[\d+\]\[[01]\]$/],
  "components/v4/about/data.ts": [/^STACK_ALL\[\d+\]$/],
};
/** с чего пункт может начинаться со строчной: названия и теги в их обычном написании (amoCRM, iOS, hreflang, cookie) */
const LOWER_OK = /^(amoCRM|iOS|iPhone|iPad|macOS|e-commerce|eSIM|hreflang|title|h[1-6]|robots\.txt|sitemap\.xml|cookie|canonical|noindex|alt|favicon|www)(?![\wА-Яа-яЁё])|^[a-z]+[A-Z]/;
/** точка сокращения в конце пункта остаётся: "и т. д.", "г." */
const ABBR_END = /(?<![А-Яа-яЁёA-Za-z])(т\. [дпе]|др|г|руб|тыс|см|стр)\.$/;
function listProblems(raw) {
  const s = scrub(raw).trim();
  const out = [];
  const head = s.replace(/^[«„("(\s]+/, "");
  if (/^[a-zа-яё]/.test(head) && !LOWER_OK.test(head)) out.push(["пункт со строчной", head.slice(0, 40), "пункт списка с заглавной буквы (кроме amoCRM, iOS, hreflang и т. п.)"]);
  if (/[.;]$/.test(s) && !ABBR_END.test(s)) out.push(["точка в конце пункта", s.slice(-40), "в конце пункта точки нет, даже если в нём два предложения"]);
  return out;
}

/**
 * Самопроверка правил: каждая плохая строка должна попасться, ни одна хорошая не должна.
 * Гоняется при каждом запуске, чтобы правка регулярки не выключила правило молча.
 */
const BAD = [
  "Структура страниц — до дизайна",
  'кнопка "Отправить"',
  "каталог: от 60k",
  "бот заявок: 25–40 тыс ₽",
  "вилка 50–100 тыс.",
  "от 30 000₽",
  "от 500 руб.",
  "2 000 ₽ в час",
  "от 6 000 ₽/мес",
  "принят – готовим",
  "сайт - это просто",
  "подождите...",
  "или на e-mail",
  "Telegram-бот для заявок",
  "сайт на Битриксе",
  "обмен с 1C",
  "цели в Яндекс.Метрике",
  "сайт на Тильде",
  "группа ВК",
  "тема на Wordpress",
  "выгрузка в csv",
  "чек из Мой налог",
  "т.е. так",
  "займёт от двух дней",
  "занимает от двух недель",
  "с админкой за две-три недели",
];
const GOOD = [
  "3–5 дней, 50–100 тыс. ₽, 10–22 по Москве, 1,5–2 недели",
  "от 30 000 ₽, 2 000 ₽/час, от 6 000 ₽ в месяц",
  "интернет-магазин на 1С-Битриксе, Битрикс24, обмен с 1С",
  "«Нажмите „Отправить“», чек из «Мой налог»",
  "UTM-метки, API, CSV, title и h1, robots.txt, файл api.php",
  "до 5 тысяч товаров, т. е. немного, и т. д.",
  "почта, Яндекс Метрика, Tilda, ВКонтакте, WordPress",
];
const BAD_ITEMS = [
  "структура страниц и порядок блоков",
  "«сайт может быть опасен»",
  "Нужен первый сайт компании или услуги.",
  "Простой рисую сам. Сильный делаем в паре с дизайнером.",
  "посетители сайта;",
  "Те, кто оставил заявку;",
];
const GOOD_ITEMS = [
  "Структура страниц и порядок блоков",
  "«Сайт может быть опасен»",
  "Простой рисую сам. Сильный делаем в паре с дизайнером",
  "amoCRM или Битрикс24 вместо таблицы",
  "iPhone и Android, iOS 15 и новее",
  "hreflang и отдельные адреса под каждый язык",
  "cookie-файлы и идентификатор браузера",
  "404 и редиректы со старых адресов",
  "1С-Битрикс, WordPress и т. д.",
  "Next.js и React",
];
const hits = (s) => RULES.filter(([, re]) => ((re.lastIndex = 0), re.test(scrub(s))));
const selfFail = [
  ...BAD.filter((s) => !hits(s).length).map((s) => `правило не поймало: ${s}`),
  ...GOOD.flatMap((s) => hits(s).map(([n]) => `ложное срабатывание «${n}»: ${s}`)),
  ...BAD_ITEMS.filter((s) => !listProblems(s).length).map((s) => `правило списков не поймало: ${s}`),
  ...GOOD_ITEMS.flatMap((s) => listProblems(s).map(([n]) => `ложное срабатывание «${n}»: ${s}`)),
];
if (selfFail.length) {
  console.log(selfFail.join("\n") + "\n\nстраж оформления сломан: поправьте RULES в scripts/typo-check.mjs");
  process.exit(1);
}

/** URL, пути и почта внутри строки не текст: вырезаем их перед проверкой */
function scrub(s) {
  return s
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/(^|[\s(])\/[a-z0-9/_\-.#?=&]*/gi, "$1 ")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, " ");
}

// отзывы: дословно, со всеми ошибками авторов
const reviews = await import("../lib/reviews.ts");
const { REVIEWS } = await import("../lib/content.ts");
const reviewTexts = [
  ...reviews.KWORK_REVIEWS.map((r) => r.text),
  ...reviews.PROFI_REVIEWS.map((r) => r.text),
  ...(reviews.HOME_REVIEWS ?? []).flatMap((r) => Object.values(r).filter((v) => typeof v === "string")),
  ...REVIEWS.map((r) => r.text),
];
const isReview = (s) => s.length > 12 && reviewTexts.some((t) => t.includes(s) || t.replace(/\[\[|\]\]/g, "").includes(s));

const problems = [];
let checked = 0;

// одна и та же строка часто реэкспортируется (ONE_PHRASE в cta.ts и home.ts): показываем её один раз
const done = new Set();

function check(file, path, raw) {
  if (done.has(raw) || isReview(raw)) return;
  done.add(raw);
  checked++;
  const s = scrub(raw);
  for (const [name, re, hint] of RULES) {
    re.lastIndex = 0;
    for (const m of s.matchAll(re)) {
      const at = m.index ?? 0;
      const frag = s.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, " ");
      problems.push({ file, path, name, hint, frag });
    }
  }
}

// пункты списков проверяются отдельно от RULES: та же строка вне списка (в абзаце) может кончаться точкой
const listDone = new Set();
function checkItem(file, path, raw) {
  if (!(LISTS[file] ?? []).some((re) => re.test(path)) || listDone.has(raw)) return;
  listDone.add(raw);
  for (const [name, frag, hint] of listProblems(raw)) problems.push({ file, path, name, hint, frag });
}

function walk(file, path, v, seen) {
  if (typeof v === "string") return checkItem(file, path, v), check(file, path, v);
  if (!v || typeof v !== "object" || seen.has(v)) return;
  seen.add(v);
  if (Array.isArray(v)) v.forEach((x, i) => walk(file, `${path}[${i}]`, x, seen));
  else for (const [k, x] of Object.entries(v)) walk(file, `${path}.${k}`, x, seen);
}

for (const file of DATA) {
  const mod = await import(`../${file}`);
  const seen = new Set();
  for (const [name, v] of Object.entries(mod)) {
    if (file === "lib/content.ts" && name === "REVIEWS") continue;
    walk(file, name, v, seen);
  }
}
for (const file of LIST_ONLY) {
  const mod = await import(`../${file}`);
  for (const [name, v] of Object.entries(mod)) {
    if (!Array.isArray(v)) continue;
    v.forEach((x, i) => typeof x === "string" && (checked++, checkItem(file, `${name}[${i}]`, x)));
  }
}

function* files(dir, ext) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* files(p, ext);
    else if (ext.test(n)) yield p;
  }
}

// текст из CSS (content у ::before/::after): кавычки вокруг отзывов и подписи тоже видны
for (const dir of ["components", "app"]) {
  for (const p of files(join(ROOT, dir), /\.css$/)) {
    const rel = relative(ROOT, p).replace(/\\/g, "/");
    readFileSync(p, "utf8").split(/\r?\n/).forEach((line, i) => {
      for (const m of line.matchAll(/content:\s*"((?:\\.|[^"\\])*)"/g)) {
        checked++;
        if (/\\"|\\0*22\b|—/.test(m[1]))
          problems.push({ file: rel, path: `строка ${i + 1}`, name: "текст в CSS", hint: "«ёлочки», без длинного тире", frag: m[0] });
      }
    });
  }
}

// массивы-списки, зашитые в компоненты (const SERP_STEPS = ["Индексация", "Скорость"]): те же правила, что у пунктов
for (const dir of ["components", "app"]) {
  for (const p of files(join(ROOT, dir), /\.tsx$/)) {
    const rel = relative(ROOT, p).replace(/\\/g, "/");
    readFileSync(p, "utf8").split(/\r?\n/).forEach((line, i) => {
      const m = line.match(/^\s*const ([A-Z][A-Z0-9_]*) = \[((?:\s*"[^"]*",?)+)\s*\];/);
      if (!m) return;
      for (const [, item] of m[2].matchAll(/"([^"]*)"/g)) {
        if (!/[А-Яа-яЁё]/.test(item)) continue;
        checked++;
        for (const [name, frag, hint] of listProblems(item)) problems.push({ file: rel, path: `строка ${i + 1}, ${m[1]}`, name, hint, frag });
      }
    });
  }
}

// длинное тире в JSX-тексте компонентов: между ">" и "<" и в строковых пропсах alt/aria-label/title
for (const dir of ["components", "app"]) {
  for (const p of files(join(ROOT, dir), /\.tsx$/)) {
    const rel = relative(ROOT, p).replace(/\\/g, "/");
    const lines = readFileSync(p, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("{/*")) return;
      // хвостовой комментарий в строке кода не текст
      const code = line
        .replace(/\s\/\/\s.*$/, "")
        .replace(/\{\/\*.*?\*\/\}/g, "")
        // регулярки в коде (st.split(/\s*[—→]\s*/)) тоже не текст
        .replace(/(?<=[(,=:]\s*)\/(?:\\.|\[[^\]]*\]|[^/\n])+\/[a-z]*/g, "");
      if (!code.includes("—")) return;
      checked++;
      problems.push({ file: rel, path: `строка ${i + 1}`, name: "длинное тире", hint: "в вёрстке тоже без него", frag: code.trim().slice(0, 90) });
    });
  }
}

if (problems.length) {
  for (const p of problems) console.log(`${p.file}  ${p.path}\n  ${p.name}: …${p.frag}…\n  → ${p.hint}`);
  console.log(`\nоформление: ${problems.length} нарушений (проверено строк: ${checked}). Правила: design-concepts/v4/typo/STYLEGUIDE.md`);
  process.exit(1);
}
console.log(`оформление в порядке: ${checked} строк, 0 нарушений`);
