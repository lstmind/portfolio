/* Поведение раздела ниш. Каждая функция возвращает полную очистку.
   Прайс-вывеска берёт код главной (components/v4/home/prices.run.js), здесь только своё. */

/**
 * Карточки сайтов. Мышь: цвет при наведении (это CSS). Палец: наведения нет, поэтому цвет получает карточка,
 * которая ближе всех к середине экрана, как строка прайса на телефоне.
 */
export function runCards(root) {
  var touch = matchMedia('(hover: none), (pointer: coarse)');
  var list = root.querySelector('.dl-cards');
  var cards = [].slice.call(root.querySelectorAll('.dl-card'));
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

/**
 * Веер первого экрана на телефоне: наведения нет, поэтому карточки по очереди сами получают цвет,
 * пока первый экран в кадре. Раз в 2,6 с, без анимации при reduced-motion.
 */
export function runFan(root) {
  var touch = matchMedia('(hover: none), (pointer: coarse)');
  var cards = [].slice.call(root.querySelectorAll('.dl-fc'));
  if (cards.length < 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) return function () {};
  var main = root.querySelector('.dl-fc--main');
  // очередь: с первой работы ниши, дальше слева направо
  var queue = [main].concat(cards.filter(function (c) { return c !== main; }));
  var i = 0, t = 0, seen = false, io = null;
  function tick() {
    cards.forEach(function (c) { c.classList.remove('is-on'); });
    if (touch.matches && seen) queue[i % queue.length].classList.add('is-on');
    i++;
  }
  function start() { stop(); if (!touch.matches) return; t = setInterval(tick, 2600); tick(); }
  function stop() { clearInterval(t); t = 0; cards.forEach(function (c) { c.classList.remove('is-on'); }); }
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { seen = e.isIntersecting; if (seen) start(); else stop(); });
    }, { threshold: .4 });
    io.observe(root);
  } else { seen = true; start(); }
  touch.addEventListener('change', start);
  return function destroy() {
    stop();
    if (io) io.disconnect();
    touch.removeEventListener('change', start);
  };
}

/** крупные слова ниже первого экрана встают на барабане, когда доходят до экрана */
export function runWords(page) {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return function () {};
  var words = [].slice.call(page.querySelectorAll('.dl-final .dl-word'));
  if (!words.length) return function () {};
  page.classList.add('dl-js');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target.classList.add('is-in'); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  words.forEach(function (w) { io.observe(w); });
  return function destroy() {
    io.disconnect();
    page.classList.remove('dl-js');
    words.forEach(function (w) { w.classList.remove('is-in'); });
  };
}

/**
 * Хаб ниш, десктоп: наведение на строку вывески меняет позу персонажа в первом экране на сцену ниши,
 * мгновенно и с подскоком 3px, как в герое. Ось корпуса остаётся на месте (сцены шире 400, сдвиг по ax).
 * Сцена ставится, только если фигура в кадре и её левый край не доходит до текста первого экрана:
 * персонаж никогда не наезжает на текст. При reduced-motion поза не меняется.
 */
export function runHubPose(fig) {
  var list = document.querySelector('#dl-niches .prices-list');
  var base = fig.querySelector('.dl-hero-base');
  var hero = fig.closest('.dl-hero');
  if (!list || !base || !hero || matchMedia('(prefers-reduced-motion: reduce)').matches) return function () {};
  var fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 700px)');
  var rows = [].slice.call(list.querySelectorAll('.prices-row[data-sc-src]'));
  var txt = [].slice.call(hero.querySelectorAll('.dl-crumbs ol, .dl-kicker, .dl-title, .dl-answer, .dl-meta, .dl-hero-act'));
  var alt = document.createElement('img');
  alt.className = 'dl-hero-alt'; alt.alt = ''; alt.setAttribute('aria-hidden', 'true'); alt.decoding = 'async';
  fig.appendChild(alt);
  var cur = null, pre = new Map(), offs = [];
  var on = function (t, type, fn, opt) { t.addEventListener(type, fn, opt); offs.push(function () { t.removeEventListener(type, fn, opt); }); };
  function sizes(r) { return Math.round(base.getBoundingClientRect().height * +r.getAttribute('data-sc-w') / 984) + 'px'; }
  function preload() {
    rows.forEach(function (r) {
      if (pre.has(r)) return;
      var im = new Image(); im.decoding = 'async'; im.sizes = sizes(r);
      im.srcset = r.getAttribute('data-sc-set'); im.src = r.getAttribute('data-sc-src');
      pre.set(r, im);
    });
  }
  // правый край текста первого экрана: по строкам текста, а не по ширине колонки
  function textRight() {
    var m = 0;
    txt.forEach(function (el) {
      var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
      while ((n = tw.nextNode())) {
        if (!n.nodeValue.trim()) continue;
        var rg = document.createRange(); rg.selectNodeContents(n);
        [].forEach.call(rg.getClientRects(), function (r) { if (r.width) m = Math.max(m, r.right); });
      }
    });
    // кнопка шире своего текста
    var tg = hero.querySelector('.dl-tg');
    if (tg) m = Math.max(m, tg.getBoundingClientRect().right);
    return m;
  }
  function geom(r) {
    var b = base.getBoundingClientRect(), s = b.height / 984, ax = +r.getAttribute('data-sc-ax'), w = +r.getAttribute('data-sc-w');
    return { b: b, s: s, left: b.left - (ax - 188) * s, right: b.left + (188 + w - ax) * s, dx: -(ax - 188) * s };
  }
  function fits(r) {
    var g = geom(r);
    if (g.b.bottom < 120 || g.b.top > innerHeight - 120) return false;
    return g.left >= textRight() + 24 && g.right <= document.documentElement.clientWidth - 4;
  }
  function hop() { fig.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 210, easing: 'cubic-bezier(.3,.7,.4,1)' }); }
  // фигура первого экрана ушла из кадра: сцена встаёт в самой строке, в просвет между ценой и карточкой сайта
  var rowOn = null;
  function rowShow(r) {
    if (rowOn === r) return;
    if (rowOn) rowOn.classList.remove('dl-fit');
    rowOn = null;
    var m = r && r.querySelector('.dl-mini-scene');
    if (!m) return;
    var link = r.querySelector('.prices-link').getBoundingClientRect(), cl = 1e9, cr = 0, cw = m.offsetWidth;
    [].forEach.call(r.querySelectorAll('.prices-num, .prices-note'), function (x) { var b = x.getBoundingClientRect(); cl = Math.min(cl, b.left); cr = Math.max(cr, b.right); });
    var wr = r.querySelector('.prices-word > [aria-hidden]').getBoundingClientRect().right;
    // просветы: после слова до цены, после цены до карточки сайта; берём первый, где сцена встаёт с запасом 20px по бокам
    var gaps = [[wr, cl], [cr, r.querySelector('.prices-slot').getBoundingClientRect().left]].filter(function (g) { return cw && g[1] - g[0] >= cw + 40; });
    if (!gaps.length) return;
    m.style.left = (gaps[0][0] - link.left + (gaps[0][1] - gaps[0][0] - cw) / 2).toFixed(1) + 'px';
    rowOn = r;
    r.classList.add('dl-fit');
    m.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 210, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  function show(r) {
    var row = r;
    if (r && !fits(r)) r = null;
    rowShow(r ? null : row);
    if (r === cur) return;
    cur = r;
    if (!r) { alt.style.visibility = 'hidden'; base.style.visibility = ''; hop(); return; }
    var im = pre.get(r);
    var put = function () {
      if (cur !== r) return;
      var g = geom(r);
      alt.sizes = sizes(r);
      alt.srcset = r.getAttribute('data-sc-set');
      alt.src = r.getAttribute('data-sc-src');
      alt.style.height = g.b.height + 'px';
      alt.style.left = (base.offsetLeft + g.dx) + 'px';
      alt.style.top = base.offsetTop + 'px';
      alt.style.visibility = 'visible';
      base.style.visibility = 'hidden';
      hop();
    };
    if (im && !im.complete) im.decode().then(put, put); else put();
  }
  on(list, 'pointerenter', function (e) { if (e.pointerType === 'mouse' && fine.matches) preload(); });
  rows.forEach(function (r) {
    var a = r.querySelector('.prices-link');
    on(a, 'pointerenter', function (e) { if (e.pointerType === 'mouse' && fine.matches) show(r); });
    on(a, 'focus', function () { if (fine.matches && a.matches(':focus-visible')) { preload(); show(r); } });
  });
  on(list, 'pointerleave', function () { show(null); });
  on(list, 'focusout', function (e) { if (!list.contains(e.relatedTarget)) show(null); });
  on(window, 'scroll', function () { if (cur && !fits(cur)) show(null); if (rowOn) rowShow(null); }, { passive: true });
  return function destroy() {
    offs.forEach(function (f) { f(); });
    alt.remove();
    base.style.visibility = '';
    if (rowOn) rowOn.classList.remove('dl-fit');
  };
}

/**
 * Списки с кропами сцен (другие ниши): на телефоне наведения нет, поэтому цвет получает строка у середины экрана.
 */
export function runCenter(root) {
  var touch = matchMedia('(hover: none), (pointer: coarse)');
  var items = [].slice.call(root.querySelectorAll('li'));
  if (!items.length) return function () {};
  var cur = null, rq = 0;
  function set(c) { if (c === cur) return; if (cur) cur.classList.remove('is-on'); cur = c; if (cur) cur.classList.add('is-on'); }
  function pick() {
    rq = 0;
    if (!touch.matches) { set(null); return; }
    var lr = root.getBoundingClientRect();
    if (lr.bottom < 0 || lr.top > innerHeight) { set(null); return; }
    var mid = innerHeight * 0.52, best = null, bd = 1e9;
    items.forEach(function (c) { var b = c.getBoundingClientRect(), d = Math.abs((b.top + b.bottom) / 2 - mid); if (d < bd) { bd = d; best = c; } });
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
