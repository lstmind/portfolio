/* Сайты: ванильный код статики (design-concepts/v4/karusel/sections/works/section.html).
   Десктоп: сцена закреплена, сайты идут барабаном по прокрутке. Телефон: карточка в фокусе экрана цветная, её скрин едет сам.
   Возвращает полную очистку: обработчики, наблюдатели, кадры, разбивку имён на буквы. */
export function runWorks(root) {
  var dead = false, offs = [];
  var on = function (t, type, fn, opt) { t.addEventListener(type, fn, opt); offs.push(function () { t.removeEventListener(type, fn, opt); }); };
  var track = root.querySelector('.s-works__track');
  var items = Array.from(root.querySelectorAll('.s-works__item'));
  var cards = items.map(function (it) { return it.querySelector('.s-works__card'); });
  var imgs = items.map(function (it) { return it.querySelector('.s-works__screen img'); });
  var curEl = root.querySelector('.s-works__cur');
  var toc = root.querySelector('.s-works__toc');
  var tocLis = toc ? Array.from(toc.querySelectorAll('li:not(.s-works__toc-more)')) : [];
  var N = items.length;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pinMQ = matchMedia('(min-width: 1000px) and (min-height: 600px)');
  var HOLD = 0.7;            // доля шага, пока сайт стоит и его скрин едет; остальное переход к следующему
  var FAM = getComputedStyle(root).getPropertyValue('--display').trim() || '"Fira Sans Condensed"';
  root.classList.add('is-js');

  /* имя по буквам: буквы скрыты от чтения, имя читается из aria-label ссылки */
  var words = [], names = [];
  items.forEach(function (it) {
    var a = it.querySelector('.s-works__name a');
    var txt = a.textContent.trim();
    names.push([a, txt]);
    a.textContent = '';
    var k = 0;
    txt.split(' ').forEach(function (w, wi) {
      words.push(w.toUpperCase());
      if (wi) a.appendChild(document.createTextNode(' '));
      var ws = document.createElement('span'); ws.className = 's-works__w'; ws.setAttribute('aria-hidden', 'true');
      for (var ci = 0; ci < w.length; ci++) {
        var s = document.createElement('span'); s.className = 's-works__ch';
        var i = document.createElement('i'); i.textContent = w[ci]; i.style.setProperty('--works-k', k++);
        s.appendChild(i); ws.appendChild(s);
      }
      a.appendChild(ws);
    });
  });

  /* картинки: грузим по подходу */
  var loaded = new Set();
  function load(k) {
    if (k < 0 || k >= N || loaded.has(k)) return;
    loaded.add(k);
    var im = imgs[k], base = im.dataset.src;
    im.srcset = base + '-390.webp 390w, ' + base + '-600.webp 600w, ' + base + '-780.webp 780w';
    im.src = base + '-390.webp';
  }

  /* кегль имени: самое длинное слово влезает в колонку */
  var mctx = document.createElement('canvas').getContext('2d');
  function ratio(w) { return (mctx.measureText(w).width - 1.2 * (w.length - 1)) / 100; }
  function longest() {
    mctx.font = '900 100px ' + FAM;
    var m = 0;
    words.forEach(function (w) { m = Math.max(m, ratio(w)); });
    return m || 4.6;
  }

  var pin = false, L = 1, G = { ch: 0, cw: 0 }, shifts = [], active = -1, cur = 0, raf = 0, near = false;
  var outT = new Map();

  function setActive(a) {
    if (a === active) return;
    var prev = active; active = a;
    items.forEach(function (it, k) {
      if (k === a) { clearTimeout(outT.get(it)); it.classList.remove('is-out'); it.classList.add('is-on'); }
      else if (k === prev) {
        it.classList.remove('is-on'); it.classList.add('is-out');
        clearTimeout(outT.get(it));
        outT.set(it, setTimeout(function () { it.classList.remove('is-out'); }, 760));
      } else it.classList.remove('is-on', 'is-out');
    });
    tocLis.forEach(function (li, k) { li.classList.toggle('is-cur', k === a); });
    if (curEl) {
      curEl.textContent = String(a + 1).padStart(2, '0');
      if (!reduce && prev >= 0) curEl.animate([{ transform: 'translateY(-3px)' }, { transform: 'none' }], { duration: 210, easing: 'cubic-bezier(.3,.7,.4,1)' });
    }
    if (near) [a - 1, a, a + 1, a + 2].forEach(load);
  }

  function posOf(u) {
    var k = Math.floor(u), f = u - k;
    if (u <= 0) return 0;
    if (k >= N - 1) return N - 1;
    if (f < HOLD) return k;
    var t = (f - HOLD) / (1 - HOLD);
    return k + t * t * (3 - 2 * t);
  }

  function render(u) {
    var pos = posOf(u), gap = Math.max(26, G.ch * .04);
    for (var k = 0; k < N; k++) {
      var c = cards[k], off = k - pos, ao = Math.abs(off);
      if (ao > 1.6) { if (c.style.visibility !== 'hidden') c.style.visibility = 'hidden'; continue; }
      if (c.style.visibility) c.style.visibility = '';
      var y = off * (G.ch + gap), z = -Math.min(ao, 1) * 140, r = -off * 11;
      c.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateX(' + r.toFixed(2) + 'deg)';
      c.classList.toggle('is-live', ao < .3);
      var sp = Math.min(1, Math.max(0, (u - k) / HOLD));
      imgs[k].style.transform = 'translate3d(0,' + (-sp * shifts[k]).toFixed(1) + 'px,0)';
    }
    setActive(Math.round(pos));
  }

  function targetU() { return Math.max(0, -track.getBoundingClientRect().top) / L; }
  function frame() {
    raf = 0;
    if (dead) return;
    var t = targetU();
    cur += (t - cur) * .2;
    if (Math.abs(t - cur) < .0004) cur = t;
    render(cur);
    raf = cur !== t ? requestAnimationFrame(frame) : 0;
  }
  function kick() { if (pin && !raf && !dead) raf = requestAnimationFrame(frame); }

  /* телефон и планшет: карточка в фокусе экрана цветная, её скрин едет сам */
  var flowIO = null, nameIO = null, loadIO = null;
  function flowOn() {
    flowIO = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-live', e.isIntersecting); }); },
      { rootMargin: '-30% 0px -30% 0px' });
    nameIO = new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-on'); nameIO.unobserve(e.target); }
    }); }, { rootMargin: '0px 0px -10% 0px' });
    loadIO = new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (e.isIntersecting) { load(cards.indexOf(e.target)); loadIO.unobserve(e.target); }
    }); }, { rootMargin: '120% 0px' });
    cards.forEach(function (c) { flowIO.observe(c); loadIO.observe(c); });
    items.forEach(function (it) { nameIO.observe(it); });
  }
  function flowOff() { [flowIO, nameIO, loadIO].forEach(function (o) { if (o) o.disconnect(); }); flowIO = nameIO = loadIO = null; }

  // оглавление показываем, только если между самым высоким текстом и низом карточки есть место
  function fitToc(ch) {
    if (!toc) return;
    var low = 0;
    items.forEach(function (it) { var t = it.querySelector('.s-works__text'); low = Math.max(low, t.offsetTop + t.offsetHeight); });
    var H = window.innerHeight, bottom = H / 2 + 22 + ch / 2;
    toc.classList.toggle('is-off', bottom - toc.offsetHeight - 36 < low);
  }

  function layout() {
    if (dead) return;
    var W = document.documentElement.clientWidth, H = window.innerHeight;
    var was = pin;
    pin = pinMQ.matches && !reduce;
    root.classList.toggle('is-pin', pin);
    var R = longest();
    if (pin) {
      var pad = Math.min(40, Math.max(16, W * .026));
      var ch = Math.round(Math.max(440, Math.min(H * .76, 820))), cw = Math.round(ch * 390 / 844);
      var cx = Math.round(Math.min(W * .69, W - pad - 130 - cw / 2));
      var colW = cx - cw / 2 - pad - Math.max(56, W * .045);
      G = { ch: ch, cw: cw };
      L = H * 1.05;
      track.style.setProperty('--works-track', (H + (N - 1 + HOLD + .14) * L) + 'px');
      root.style.setProperty('--works-ch', ch + 'px');
      root.style.setProperty('--works-cw', cw + 'px');
      root.style.setProperty('--works-cx', cx + 'px');
      root.style.setProperty('--works-dy', '22px');
      root.style.setProperty('--works-colw', colW + 'px');
      // колонка собрана по карточке: имя от её верхнего края, оглавление по нижнему.
      // каждое имя в одну строку и во всю колонку, но не выше того, что оставляют подпись и оглавление
      var bodyH = 0;
      items.forEach(function (it) { bodyH = Math.max(bodyH, it.querySelector('.s-works__body').offsetHeight); });
      var tocH = toc ? toc.offsetHeight : 0;
      var fsMax = Math.max(H * .14, Math.min(H * .28, (ch - bodyH - 26 - tocH - 56) / .86));
      // ширину имени меряем по самой вёрстке при кегле 100px: так точнее, чем canvas
      var nameEls = items.map(function (it) { return it.querySelector('.s-works__name a'); });
      items.forEach(function (it) { it.style.setProperty('--works-fs', '100px'); });
      var ratios = nameEls.map(function (a) { return a.getBoundingClientRect().width / 100; });
      var fsMin = fsMax;
      items.forEach(function (it, k) { var f = Math.min(fsMax, colW / (ratios[k] || 4.6)); fsMin = Math.min(fsMin, f); it.style.setProperty('--works-fs', f.toFixed(1) + 'px'); });
      root.style.setProperty('--works-fs', fsMin.toFixed(1) + 'px');
      shifts = imgs.map(function (im) { return Math.max(0, Math.min(cw * +im.getAttribute('height') / +im.getAttribute('width') - ch, ch * 2.1)); });
      imgs.forEach(function (im) { im.sizes = cw + 'px'; });
      if (!was) { flowOff(); cards.forEach(function (c) { c.classList.remove('is-live'); }); items.forEach(function (it) { it.classList.remove('is-on'); }); active = -1; }
      cur = targetU(); render(cur);
      fitToc(ch);
    } else {
      track.style.removeProperty('--works-track');
      ['--works-ch', '--works-cw', '--works-cx', '--works-dy', '--works-colw'].forEach(function (p) { root.style.removeProperty(p); });
      items.forEach(function (it) { it.style.removeProperty('--works-fs'); });
      cards.forEach(function (c) { c.style.transform = ''; c.style.visibility = ''; });
      imgs.forEach(function (im) { im.style.transform = ''; });
      var colW2 = W < 700 ? W - 32 : (W - 2 * Math.min(40, Math.max(16, W * .026))) - Math.min(W * .34, 330) - 48;
      root.style.setProperty('--works-fs', Math.min(W < 700 ? 88 : 150, colW2 / R) + 'px');
      var cwF = W < 700 ? Math.min(W * .72, 330) : Math.min(W * .34, 330);
      imgs.forEach(function (im) { im.sizes = Math.ceil(cwF) + 'px'; });
      if (was || !flowIO) { items.forEach(function (it) { it.classList.remove('is-out'); }); active = -1; flowOn(); }
    }
  }

  /* оглавление: щелчок прокручивает сцену к сайту, барабан докручивает сам */
  tocLis.forEach(function (li, k) { on(li.querySelector('button'), 'click', function () {
    if (!pin) return;
    window.scrollTo({ top: window.scrollY + track.getBoundingClientRect().top + (k + .02) * L, behavior: 'smooth' });
  }); });

  /* клавиатура: фокус на сайте прокручивает сцену к нему */
  items.forEach(function (it, k) { on(it, 'focusin', function () {
    if (!pin || k === active) return;
    var top = window.scrollY + track.getBoundingClientRect().top + (k + .02) * L;
    window.scrollTo({ top: top, behavior: 'auto' });
    cur = targetU(); render(cur);
  }); });

  // цикл кадров живёт, только пока секция рядом с экраном
  // картинки сцены грузятся, только когда секция в полутора экранах от кадра
  var nearIO = new IntersectionObserver(function (es) {
    near = es[0].isIntersecting;
    if (near && pin) { [active - 1, active, active + 1, active + 2].forEach(load); kick(); }
  }, { rootMargin: '150% 0px' });
  nearIO.observe(track);
  on(window, 'scroll', function () { if (near) kick(); }, { passive: true });
  var rt = 0;
  on(window, 'resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  return function destroy() {
    dead = true;
    cancelAnimationFrame(raf); clearTimeout(rt);
    outT.forEach(function (t) { clearTimeout(t); });
    offs.forEach(function (f) { f(); }); offs = [];
    flowOff(); nearIO.disconnect();
    names.forEach(function (n) { n[0].textContent = n[1]; });
    root.classList.remove('is-js', 'is-pin');
    ['--works-ch', '--works-cw', '--works-cx', '--works-dy', '--works-colw', '--works-fs'].forEach(function (p) { root.style.removeProperty(p); });
    track.style.removeProperty('--works-track');
    items.forEach(function (it) { it.classList.remove('is-on', 'is-out'); it.style.removeProperty('--works-fs'); });
    cards.forEach(function (c) { c.classList.remove('is-live'); c.style.transform = ''; c.style.visibility = ''; });
    imgs.forEach(function (im) { im.style.transform = ''; });
    tocLis.forEach(function (li) { li.classList.remove('is-cur'); });
    if (toc) toc.classList.remove('is-off');
  };
}
