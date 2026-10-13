/* Прайс: ванильный код статики (design-concepts/v4/karusel/sections/prices/section.html).
   Слова по буквам, вход строк лесенкой, раскладка колонок на десктопе, активная строка (мышь, фокус, середина экрана на телефоне).
   Возвращает полную очистку. */
export function runPrices(root) {
  var dead = false, offs = [];
  var on = function (t, type, fn, opt) { t.addEventListener(type, fn, opt); offs.push(function () { t.removeEventListener(type, fn, opt); }); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobQ = matchMedia('(max-width: 699px)');
  var rows = [].slice.call(root.querySelectorAll('.prices-row'));
  var list = root.querySelector('.prices-list');

  // слово режем на буквы (по словам, чтобы на телефоне переносилось по пробелу); читалке отдаём слово целиком
  rows.forEach(function (row) {
    var w = row.querySelector('.prices-word'), txt = w.getAttribute('data-w');
    w.textContent = '';
    var sr = document.createElement('span'); sr.className = 'prices-sr'; sr.textContent = txt; w.appendChild(sr);
    var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true'); w.appendChild(vis);
    var k = 0;
    txt.toUpperCase().split(' ').forEach(function (word, wi) {
      if (wi) vis.appendChild(document.createTextNode(' '));
      var wd = document.createElement('span'); wd.className = 'prices-wd';
      for (var i = 0; i < word.length; i++) {
        var c = document.createElement('span'); c.className = 'prices-ch'; c.textContent = word[i];
        c.style.setProperty('--prices-cd', 'calc(var(--prices-d, 0ms) + ' + (k++ * 38) + 'ms)');
        wd.appendChild(c);
      }
      vis.appendChild(wd);
    });
  });

  // вход: строки, попавшие в кадр вместе, идут лесенкой
  var io = null, qt = 0;
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('prices-js');
    var queue = [];
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); queue.push(e.target); } });
      if (!qt) qt = requestAnimationFrame(function () {
        qt = 0;
        queue.sort(function (a, b) { return rows.indexOf(a) - rows.indexOf(b); });
        queue.forEach(function (r, j) { r.style.setProperty('--prices-d', (j * 110) + 'ms'); r.classList.add('prices-in'); });
        queue = [];
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    rows.forEach(function (r) { io.observe(r); });
  }

  // десктоп: колонка слов по самому длинному слову, за ней колонка цен, карточки у правого края
  function layout() {
    if (dead || mobQ.matches) return;
    var W = list.clientWidth, wcol = 0, pw = 0;
    var gut = parseFloat(getComputedStyle(root).getPropertyValue('--prices-gut')) || 48;
    rows.forEach(function (r) {
      var v = r.querySelector('.prices-word > [aria-hidden]');
      if (v) wcol = Math.max(wcol, v.getBoundingClientRect().width);
      pw = Math.max(pw, r.querySelector('.prices-num').getBoundingClientRect().width);
    });
    wcol = Math.ceil(wcol);
    var cw = Math.max(128, Math.min(250, W * 0.165));
    // подпись под ценой сужается, если иначе карточке не хватает места
    var nw = Math.max(pw, Math.min(300, W - wcol - 2 * gut - cw));
    root.style.setProperty('--prices-wcol', wcol + 'px');
    root.style.setProperty('--prices-nw', Math.floor(nw) + 'px');
    var lw = list.getBoundingClientRect(), costR = 0;
    rows.forEach(function (r) {
      [].forEach.call(r.querySelectorAll('.prices-num,.prices-note'), function (x) { costR = Math.max(costR, x.getBoundingClientRect().right - lw.left); });
    });
    cw = Math.max(110, Math.min(cw, W - costR - gut));
    root.style.setProperty('--prices-cw', cw.toFixed(1) + 'px');
    var ch = cw * 2.165, x = W - cw, lh = lw.height;
    rows.forEach(function (r) {
      var s = r.querySelector('.prices-slot'), c = s.querySelector('.prices-card'), rb = r.getBoundingClientRect();
      s.style.setProperty('--prices-x', x.toFixed(1) + 'px');
      // в покое из линейки торчит верх карточки: от 20px под верхней линейкой строки до нижней
      var peek = Math.max(40, rb.height - 20);
      c.style.setProperty('--prices-hide', Math.max(0, ch - peek).toFixed(1) + 'px');
      // целиком карточка не выходит за нижнюю линейку списка: нижние строки поднимают её вверх
      var top = rb.top - lw.top + 20;
      c.style.setProperty('--prices-lift', Math.min(0, lh - top - ch).toFixed(1) + 'px');
    });
  }
  var raf = 0, r2 = 0;
  on(window, 'resize', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); });
  function ready() { if (dead) return; layout(); r2 = requestAnimationFrame(function () { r2 = requestAnimationFrame(function () { if (!dead) root.classList.add('prices-ready'); }); }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready); else ready();
  layout();

  // одно активное состояние на строку: мышь, фокус с клавиатуры, на телефоне середина экрана
  var cur = null;
  function setOn(r) {
    if (r === cur) return;
    if (cur) cur.classList.remove('prices-on');
    cur = r;
    if (cur) cur.classList.add('prices-on');
    list.classList.toggle('prices-hot', !!cur && !mobQ.matches);
  }
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  rows.forEach(function (r) {
    var a = r.querySelector('.prices-link');
    on(a, 'pointerenter', function (e) { if (e.pointerType === 'mouse' && fine.matches && !mobQ.matches) setOn(r); });
    on(a, 'focus', function () { if (!mobQ.matches && a.matches(':focus-visible')) setOn(r); });
    on(a, 'blur', function () { if (cur === r && !r.matches(':hover')) setOn(null); });
  });
  on(list, 'pointerleave', function (e) { if (e.pointerType === 'mouse' && !mobQ.matches) setOn(null); });

  var ticking = 0;
  function focusRow() {
    ticking = 0;
    if (dead || !mobQ.matches) return;
    var lr = list.getBoundingClientRect();
    if (lr.bottom < 0 || lr.top > innerHeight) { setOn(null); return; }
    var mid = innerHeight * 0.52, best = null, bd = 1e9;
    rows.forEach(function (r) {
      var b = r.getBoundingClientRect(), d = Math.abs((b.top + b.bottom) / 2 - mid);
      if (d < bd) { bd = d; best = r; }
    });
    setOn(best);
  }
  on(window, 'scroll', function () { if (!ticking) ticking = requestAnimationFrame(focusRow); }, { passive: true });
  on(mobQ, 'change', function () { setOn(null); layout(); focusRow(); });
  focusRow();

  return function destroy() {
    dead = true;
    cancelAnimationFrame(raf); cancelAnimationFrame(r2); cancelAnimationFrame(qt); cancelAnimationFrame(ticking);
    if (io) io.disconnect();
    offs.forEach(function (f) { f(); }); offs = [];
    rows.forEach(function (row) {
      var w = row.querySelector('.prices-word'); w.textContent = w.getAttribute('data-w');
      row.classList.remove('prices-in', 'prices-on'); row.style.removeProperty('--prices-d');
      var s = row.querySelector('.prices-slot'), c = s.querySelector('.prices-card');
      s.style.removeProperty('--prices-x'); c.style.removeProperty('--prices-hide'); c.style.removeProperty('--prices-lift');
    });
    list.classList.remove('prices-hot');
    root.classList.remove('prices-js', 'prices-ready');
    ['--prices-wcol', '--prices-nw', '--prices-cw'].forEach(function (p) { root.style.removeProperty(p); });
  };
}
