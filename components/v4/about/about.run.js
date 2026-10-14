/* Поведение страницы "Обо мне". Каждая функция возвращает полную очистку.
   Проявление при прокрутке как на остальных страницах: крупные слова встают на барабане, строки поднимаются лесенкой,
   персонажи выходят на свою линейку. Без IntersectionObserver и при reduced-motion всё стоит сразу, ничего не прячется. */

/** проявление: крупные слова ниже первого экрана, строки и кадры с data-rv */
export function runReveal(page) {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return function () {};
  var words = [].slice.call(page.querySelectorAll('.ab-big:not(.ab-big--hero)'));
  var items = [].slice.call(page.querySelectorAll('[data-rv]'));
  var all = words.concat(items);
  if (!all.length) return function () {};
  page.classList.add('ab-js');
  var queue = [], rq = 0;
  // что вошло в кадр одним кадром, идёт лесенкой по порядку в разметке
  function flush() {
    rq = 0;
    queue.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
    queue.forEach(function (el, j) { el.style.setProperty('--d', (j * 70) + 'ms'); el.classList.add('is-in'); });
    queue = [];
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); queue.push(e.target); } });
    if (queue.length && !rq) rq = requestAnimationFrame(flush);
  }, { rootMargin: '0px 0px -10% 0px' });
  all.forEach(function (el) { io.observe(el); });
  return function destroy() {
    io.disconnect();
    cancelAnimationFrame(rq);
    page.classList.remove('ab-js');
    all.forEach(function (el) { el.classList.remove('is-in'); el.style.removeProperty('--d'); });
  };
}

/**
 * Барабан "Пишу на ...": слово уезжает вверх контуром, снизу встаёт следующее. Раз в 2,4 с и только пока блок в кадре.
 * При reduced-motion стоит первое слово, контуры соседей остаются рисунком.
 */
export function runDrum(root) {
  var win = root.querySelector('.ab-win');
  if (!win || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return function () {};
  var words;
  try { words = JSON.parse(win.getAttribute('data-words') || '[]'); } catch (e) { words = []; }
  if (words.length < 3) return function () {};
  var spans = [].slice.call(win.querySelectorAll('.ab-dw'));
  // четвёртое слово ждёт снизу, невидимое: в момент прокрутки оно встаёт на место нижнего контура
  var next2 = document.createElement('span');
  next2.className = 'ab-dw ab-dw--in';
  win.appendChild(next2);
  var i = 0, t = 0, back = 0, seen = false;
  var at = function (k) { return words[(k + words.length) % words.length]; };
  function paint() {
    spans[0].textContent = at(i - 1);
    spans[1].textContent = at(i);
    spans[2].textContent = at(i + 1);
    next2.textContent = at(i + 2);
  }
  function tick() {
    if (document.hidden) return;
    win.classList.add('is-roll');
    clearTimeout(back);
    back = setTimeout(function () {
      i = (i + 1) % words.length;
      win.classList.add('is-snap');
      win.classList.remove('is-roll');
      paint();
      void win.offsetHeight;
      win.classList.remove('is-snap');
    }, 700);
  }
  function start() { if (!t) t = setInterval(tick, 2400); }
  function stop() { clearInterval(t); t = 0; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { seen = e.isIntersecting; if (seen) start(); else stop(); });
  }, { threshold: 0.3 });
  io.observe(root);
  paint();
  return function destroy() {
    stop();
    clearTimeout(back);
    io.disconnect();
    win.classList.remove('is-roll', 'is-snap');
    next2.remove();
    i = 0;
    spans[0].textContent = at(-1);
    spans[1].textContent = at(0);
    spans[2].textContent = at(1);
  };
}

/** "Скопировать": почта и ИНН в буфер, на кнопке "Скопировано" на полторы секунды, читалке то же вслух */
export function runCopy(page) {
  var live = page.querySelector('.ab-live');
  var timers = [];
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, fail) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(e); }
      ta.remove();
    });
  }
  function onClick(e) {
    var b = e.target.closest && e.target.closest('[data-copy]');
    if (!b || !page.contains(b)) return;
    var t = b.querySelector('.ab-copy-t');
    copy(b.getAttribute('data-copy')).then(function () {
      b.classList.add('is-done');
      if (t) t.textContent = 'Скопировано';
      if (live) live.textContent = 'Скопировано: ' + b.getAttribute('data-copy');
      timers.push(setTimeout(function () {
        b.classList.remove('is-done');
        if (t) t.textContent = 'Скопировать';
      }, 1600));
    }, function () {
      // буфер недоступен: хотя бы выделяем значение, чтобы скопировать руками
      var v = b.previousElementSibling;
      if (v && window.getSelection) { var r = document.createRange(); r.selectNodeContents(v); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    });
  }
  page.addEventListener('click', onClick);
  return function destroy() {
    page.removeEventListener('click', onClick);
    timers.forEach(clearTimeout);
  };
}

/** "Что получается лучше всего" на телефоне: наведения нет, поэтому цвет карточки получает строка у середины экрана */
export function runRows(root) {
  var touch = matchMedia('(hover: none), (pointer: coarse)');
  var rows = [].slice.call(root.querySelectorAll('.ab-can-list > li'));
  if (!rows.length) return function () {};
  var cur = null, rq = 0;
  function set(r) { if (r === cur) return; if (cur) cur.classList.remove('is-on'); cur = r; if (cur) cur.classList.add('is-on'); }
  function pick() {
    rq = 0;
    if (!touch.matches) { set(null); return; }
    var mid = innerHeight * 0.5, best = null, bd = innerHeight * 0.3;
    rows.forEach(function (r) { var b = r.getBoundingClientRect(), d = Math.abs((b.top + b.bottom) / 2 - mid); if (d < bd) { bd = d; best = r; } });
    set(best);
  }
  function req() { if (!rq) rq = requestAnimationFrame(pick); }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  touch.addEventListener('change', req);
  pick();
  return function destroy() {
    cancelAnimationFrame(rq);
    removeEventListener('scroll', req);
    removeEventListener('resize', req);
    touch.removeEventListener('change', req);
    set(null);
  };
}
