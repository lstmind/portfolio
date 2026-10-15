/* Общая логика коротких форм заявки: проверка полей, отправка на /api/contact, ответ после отправки и при сбое.
   Берут её форма калькулятора на главной (home/final.run.js) и короткая форма аудита и контакта (cta/lead.run.js).
   Тексты приходят из lib/cta.ts (LEAD) и lib/content.ts (HOURS) через data-атрибуты: здесь их нет. */

/** телефон, почта или @ник: то же правило, что было у формы главной */
export function validContact(s) {
  return /@|\+?[\d\s().-]{7,}/.test(String(s || ''));
}

/** похоже на адрес сайта: mysite.ru, https://www.site.com/page, сайт.рф */
export function validSite(s) {
  return /^(https?:\/\/)?([^\s/.:@]+\.)+[^\s/.:@\d]{2,}(:\d+)?(\/\S*)?$/i.test(String(s || '').trim());
}

/** часы по Москве сейчас, 0–23 */
function moscowHour() {
  try {
    return +new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', hour: '2-digit', hourCycle: 'h23' }).format(new Date());
  } catch (e) {
    return (new Date().getUTCHours() + 3) % 24;
  }
}

/** что сказать после отправки: в часы ответа "отвечу в течение часа", ночью "отвечу утром" */
export function okText(t) {
  var h = moscowHour();
  return h >= t.from && h < t.to ? t.okNow : t.okLater;
}

/** ссылка в Telegram с текстом: тот же формат, что tgHref в lib/cta.ts */
export function tgHref(base, text) {
  return text ? base + '?text=' + encodeURIComponent(text) : base;
}

/**
 * Сбой отправки: "Не отправилось, текст в полях остался. Напишите в Telegram или на почту ...".
 * В Telegram уходит то, что человек уже написал (draft), чтобы не набирать заново. Разметка собирается узлами, без innerHTML.
 */
export function showFail(status, t, draft) {
  status.textContent = '';
  var tg = document.createElement('a');
  tg.href = tgHref(t.tg, draft);
  tg.target = '_blank';
  tg.rel = 'noopener';
  tg.textContent = 'Telegram';
  var mail = document.createElement('a');
  mail.href = 'mailto:' + t.email;
  mail.textContent = t.email;
  status.append(t.fail + ' ', tg, ' или на почту ', mail, '.');
}

/** заявка на сервер: сначала файл заявок, потом Telegram (app/api/contact). Ошибка, если сервер не подтвердил */
export function postLead(payload) {
  var body = Object.assign({ page: location.pathname + location.search, from: document.referrer || '' }, payload);
  return fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (res) {
    if (!res.ok) throw new Error('bad');
  });
}
