/**
 * Отправка адресов сайта в IndexNow.
 *
 * Протокол поддерживают Bing и Яндекс: вместо ожидания обхода мы сами говорим,
 * что страницы появились или изменились. Для ChatGPT это важно потому, что его
 * поиск работает на индексе Bing.
 *
 *   node scripts/indexnow.mjs            все адреса из карты сайта
 *   node scripts/indexnow.mjs /uslugi/x  только указанные
 */

const HOST = "lstmind.ru";
const KEY = "7a955e04c0b85b9e8ef0d81ae1b52cb2";
const ORIGIN = `https://${HOST}`;

const args = process.argv.slice(2);

async function urlsFromSitemap() {
  const r = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!r.ok) throw new Error(`карта сайта отдала ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const urlList = args.length
  ? args.map((p) => (p.startsWith("http") ? p : ORIGIN + (p.startsWith("/") ? p : "/" + p)))
  : await urlsFromSitemap();

// ключ должен лежать на сайте — без него запрос отклонят
const keyCheck = await fetch(`${ORIGIN}/${KEY}.txt`);
if (!keyCheck.ok) {
  console.error(`ключ недоступен: ${ORIGIN}/${KEY}.txt отдаёт ${keyCheck.status}`);
  console.error("сначала выложи сайт, потом отправляй");
  process.exit(1);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `${ORIGIN}/${KEY}.txt`,
  urlList,
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`адресов отправлено: ${urlList.length}`);
console.log(`ответ: ${res.status} ${res.statusText}${text ? " · " + text.slice(0, 200) : ""}`);
if (res.status === 200 || res.status === 202) {
  console.log("принято, страницы уйдут в очередь Bing и Яндекса");
} else {
  console.log("не принято — смотри код ответа: 400 неверный формат, 403 ключ не совпал, 422 адрес не с того домена");
  process.exit(1);
}
