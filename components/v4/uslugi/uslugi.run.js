/* Поведение раздела услуг. Каждая функция возвращает полную очистку.
   Прайс-вывеска берёт код главной (components/v4/home/prices.run.js), здесь только своё. */

/** экран ноутбука в первом экране: сайт едет, только пока герой в кадре */
export function runHero(root) {
  if (!('IntersectionObserver' in window)) { root.classList.add('u-live'); return function () { root.classList.remove('u-live'); }; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { root.classList.toggle('u-live', e.isIntersecting); });
  }, { threshold: 0 });
  io.observe(root);
  return function destroy() { io.disconnect(); root.classList.remove('u-live'); };
}

/**
 * Карточки работ. Мышь: цвет при наведении (это CSS). Палец: наведения нет, поэтому цвет получает карточка,
 * которая целиком в ленте и ближе всех к середине экрана, как строка прайса на телефоне.
 */
export function runCards(root) {
  var touch = matchMedia('(hover: none), (pointer: coarse)');
  var list = root.querySelector('.u-cards');
  var cards = [].slice.call(root.querySelectorAll('.u-card'));
  if (!list || !cards.length) return function () {};
  var cur = null, rq = 0;
  function set(c) {
    if (c === cur) return;
    if (cur) cur.classList.remove('is-on');
    cur = c;
    if (cur) cur.classList.add('is-on');
  }
  function pick() {
    rq = 0;
    if (!touch.matches) { set(null); return; }
    var lr = list.getBoundingClientRect();
    if (lr.bottom < innerHeight * .15 || lr.top > innerHeight * .85) { set(null); return; }
    var mid = innerWidth / 2, best = null, bd = 1e9;
    cards.forEach(function (c) {
      var b = c.getBoundingClientRect(), d = Math.abs((b.left + b.right) / 2 - mid);
      if (d < bd) { bd = d; best = c; }
    });
    set(best);
  }
  function req() { if (!rq) rq = requestAnimationFrame(pick); }
  addEventListener('scroll', req, { passive: true });
  list.addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  touch.addEventListener('change', req);
  pick();
  return function destroy() {
    cancelAnimationFrame(rq);
    removeEventListener('scroll', req);
    list.removeEventListener('scroll', req);
    removeEventListener('resize', req);
    touch.removeEventListener('change', req);
    set(null);
  };
}

/** крупные слова ниже первого экрана встают на барабане, когда доходят до экрана */
export function runWords(page) {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return function () {};
  var words = [].slice.call(page.querySelectorAll('.u-flow .u-word, .u-final .u-word'));
  if (!words.length) return function () {};
  page.classList.add('u-js');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target.classList.add('is-in'); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  words.forEach(function (w) { io.observe(w); });
  return function destroy() {
    io.disconnect();
    page.classList.remove('u-js');
    words.forEach(function (w) { w.classList.remove('is-in'); });
  };
}

/** ниши: на телефоне цвет получает строка у середины экрана; мышь и фокус это CSS */
export function runNiches(root) {
  var touch = matchMedia('(hover: none), (pointer: coarse)');
  var rows = [].slice.call(root.querySelectorAll('.u-niches li'));
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
  touch.addEventListener('change', req);
  pick();
  return function destroy() { cancelAnimationFrame(rq); removeEventListener('scroll', req); touch.removeEventListener('change', req); set(null); };
}

/**
 * Прайс-вывеска на десктопе: у активной строки (мышь, фокус) между ценой и карточкой сайта встаёт сцена этой услуги.
 * Стоит на нижней линейке строки, меняется мгновенно с подскоком 3px, как позы в герое. Если места нет, не встаёт:
 * текст ничем не перекрывается. Кадры грузятся по первому подходу мыши к вывеске.
 */
export function runSignFigs(root) {
  var rows = [].slice.call(root.querySelectorAll('.prices-row[data-fig]'));
  var list = root.querySelector('.prices-list');
  if (!rows.length || !list || !window.MutationObserver) return function () {};
  var mq = matchMedia('(min-width: 700px)');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var figs = [], made = false, cur = null;
  function make() {
    if (made) return;
    made = true;
    rows.forEach(function (r) {
      var d = JSON.parse(r.getAttribute('data-fig'));
      var im = document.createElement('img');
      im.alt = ''; im.decoding = 'async'; im.className = 'u-sfig'; im.setAttribute('aria-hidden', 'true');
      im.width = d.w; im.height = 984;
      im.sizes = Math.ceil((220 * d.w) / 984) + 'px';
      im.srcset = d.srcSet; im.src = d.src;
      r.appendChild(im);
      figs.push({ r: r, im: im, w: d.w });
    });
  }
  function figOf(r) { for (var i = 0; i < figs.length; i++) if (figs[i].r === r) return figs[i]; return null; }
  function place(f) {
    var rb = f.r.getBoundingClientRect(), right = 0;
    [].forEach.call(f.r.querySelectorAll('.prices-num,.prices-note'), function (x) { right = Math.max(right, x.getBoundingClientRect().right - rb.left); });
    var card = f.r.querySelector('.prices-card');
    var cx = card ? card.getBoundingClientRect().left - rb.left : rb.width;
    var h = Math.min(rb.height - 16, 240), w = (h * f.w) / 984;
    var gap = cx - right;
    if (h < 90 || gap < w + 48) return false;
    f.im.style.height = h + 'px';
    f.im.style.width = w + 'px';
    f.im.style.left = (right + (gap - w) / 2).toFixed(1) + 'px';
    return true;
  }
  function show(r) {
    var f = r && mq.matches ? (make(), figOf(r)) : null;
    if (f && cur === f) return;
    if (cur) cur.im.classList.remove('on');
    cur = null;
    if (!f || !place(f)) return;
    cur = f;
    f.im.classList.add('on');
    if (!reduce && f.im.animate) f.im.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
  }
  var mo = new MutationObserver(function () {
    var on = null;
    rows.forEach(function (r) { if (r.classList.contains('prices-on')) on = r; });
    show(on);
  });
  rows.forEach(function (r) { mo.observe(r, { attributes: true, attributeFilter: ['class'] }); });
  function warm() { if (mq.matches) make(); }
  list.addEventListener('pointerenter', warm);
  list.addEventListener('focusin', warm);
  return function destroy() {
    mo.disconnect();
    list.removeEventListener('pointerenter', warm);
    list.removeEventListener('focusin', warm);
    figs.forEach(function (f) { f.im.remove(); });
    figs = []; cur = null;
  };
}

/** "Не делаю": строки зачёркиваются тонкой линией, когда входят в кадр */
export function runStrike(root) {
  var rows = [].slice.call(root.querySelectorAll('.u-no-list li'));
  if (!rows.length) return function () {};
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    rows.forEach(function (r) { r.classList.add('is-in'); });
    return function () { rows.forEach(function (r) { r.classList.remove('is-in'); }); };
  }
  root.classList.add('u-js-strike');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target.classList.add('is-in'); } });
  }, { rootMargin: '0px 0px -25% 0px' });
  rows.forEach(function (r, i) { r.style.setProperty('--i', i); io.observe(r); });
  return function destroy() { io.disconnect(); root.classList.remove('u-js-strike'); rows.forEach(function (r) { r.classList.remove('is-in'); }); };
}
