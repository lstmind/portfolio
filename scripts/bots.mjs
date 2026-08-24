/**
 * Кто из поисковых роботов заходил на сайт.
 *
 * Читает журнал Caddy на сервере и показывает, какие боты приходили,
 * сколько раз и на какие страницы.
 *
 *   node scripts/bots.mjs           за сутки
 *   node scripts/bots.mjs "7 days"  за неделю
 */

import { execFileSync } from "node:child_process";

const since = process.argv[2] || "1 day";
const host = process.env.LSTMIND_HOST || "lstmind";

const raw = execFileSync(
  "ssh",
  ["-o", "BatchMode=yes", host, `journalctl -u caddy --since "${since} ago" --no-pager -o cat`],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
);

const BOTS = [
  ["Яндекс", /YandexBot|YandexAdditional|YandexRenderResourcesBot/i],
  ["Google", /Googlebot|Google-Extended|Google-InspectionTool/i],
  ["Bing", /bingbot|BingPreview/i],
  ["ChatGPT", /GPTBot|OAI-SearchBot|ChatGPT-User/i],
  ["Perplexity", /PerplexityBot|Perplexity-User/i],
  ["Apple", /Applebot/i],
  ["Mail.ru", /Mail\.RU_Bot/i],
  ["прочие роботы", /bot|crawler|spider/i],
];

const stat = new Map();
let requests = 0;

for (const line of raw.split("\n")) {
  if (!line.includes('"msg":"handled request"')) continue;
  let rec;
  try {
    rec = JSON.parse(line.slice(line.indexOf("{")));
  } catch {
    continue;
  }
  requests++;
  const ua = (rec.request?.headers?.["User-Agent"] || [""])[0];
  const uri = (rec.request?.uri || "").split("?")[0];
  const who = BOTS.find(([, re]) => re.test(ua));
  if (!who) continue;
  const key = who[0];
  if (!stat.has(key)) stat.set(key, { hits: 0, pages: new Map() });
  const s = stat.get(key);
  s.hits++;
  s.pages.set(uri, (s.pages.get(uri) || 0) + 1);
}

console.log(`период: последние ${since} · запросов всего: ${requests}\n`);
if (!stat.size) {
  console.log("роботы не приходили");
} else {
  for (const [name, s] of [...stat].sort((a, b) => b[1].hits - a[1].hits)) {
    const top = [...s.pages].sort((a, b) => b[1] - a[1]).slice(0, 6);
    console.log(`${name}: ${s.hits} запросов, страниц ${s.pages.size}`);
    for (const [p, n] of top) console.log(`    ${String(n).padStart(3)}  ${p || "/"}`);
    console.log("");
  }
}
