/* Как это будет: ванильный код статики (design-concepts/v4/karusel/sections/process/section.html).
   Десктоп от 900: закреплённая сцена, шаг по прокрутке, слово на дуге барабаном, экран ноутбука листается.
   Телефон: лента со scroll-snap. Возвращает полную очистку. */
export function runProcess(sec) {
  var dead = false, offs = [];
  var on = function (t, type, fn, opt) { t.addEventListener(type, fn, opt); offs.push(function () { t.removeEventListener(type, fn, opt); }); };
  var stage = sec.querySelector('#process-stage');
  var list = sec.querySelector('#process-steps');
  var steps = Array.from(sec.querySelectorAll('.process-step'));
  var segs = Array.from(sec.querySelectorAll('.process-seg'));
  var nEl = sec.querySelector('#process-n');
  var prevBtn = sec.querySelector('#process-prev'), nextBtn = sec.querySelector('#process-next');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wideMQ = matchMedia('(min-width: 900px)');
  var FAM = getComputedStyle(sec).getPropertyValue('--display').trim() || '"Fira Sans Condensed"';
  // холст поз 400x984: ось корпуса, макушка, подошвы, грудь; края всех четырёх поз в полосе груди
  var JG = { W: 400, H: 984, AX: 188, TOP: 6, SOLE: 978, CHEST: 232, L: 21, R: 349 };
  var screenBox = sec.querySelector('.process-screen'), screenImg = screenBox && screenBox.querySelector('img');
  sec.classList.add('is-js');

  /* буквы слова: для барабана, текст для чтения остаётся целым */
  steps.forEach(function (li) {
    var h = li.querySelector('.process-word'), txt = h.textContent.trim();
    li._orig = txt;
    h.textContent = '';
    var sr = document.createElement('span'); sr.className = 'process-sr'; sr.textContent = txt; h.appendChild(sr);
    var box = document.createElement('span'); box.className = 'process-letters'; box.setAttribute('aria-hidden', 'true');
    Array.from(txt.toUpperCase()).forEach(function (c, k) {
      var s = document.createElement('span'); s.className = 'process-ch'; s.style.setProperty('--process-k', k);
      var i = document.createElement('i'); i.textContent = c; s.appendChild(i); box.appendChild(s);
    });
    h.appendChild(box);
    li._txt = txt.toUpperCase(); li._ch = Array.from(box.children); li._box = box;
  });

  /* геометрия дуги, как у слова героя */
  var mctx = document.createElement('canvas').getContext('2d');
  function glyphs(str, fs) {
    mctx.font = '900 ' + fs + 'px ' + FAM;
    var ls = -0.012 * fs, g = [];
    for (var i = 0; i < str.length; i++) { var w = mctx.measureText(str[i]).width; g.push({ x: mctx.measureText(str.slice(0, i)).width + ls * i + w / 2, w: w }); }
    var L = g[g.length - 1]; return { g: g, w: L.x + L.w / 2 };
  }
  var PERSP = 1100;
  var proj = function (x, Rw) { var p = x / Rw, Z = Rw * (1 - Math.cos(p)); return Rw * Math.sin(p) * PERSP / (PERSP - Z); };
  var unproj = function (X, Rw) { var a = -Rw, b = Rw; for (var i = 0; i < 40; i++) { var m = (a + b) / 2; if (proj(m, Rw) < X) a = m; else b = m; } return (a + b) / 2; };

  var pin = false, cur = 0, G = null;
  function layout() {
    if (dead) return;
    pin = wideMQ.matches && !reduce;
    sec.classList.toggle('is-pin', pin);
    if (!pin) {
      if (cur < 0) setStep(0);
      steps.forEach(function (li) { li._box.style.fontSize = ''; li._ch.forEach(function (s) { s.style.transform = ''; }); });
      if (screenImg) screenImg.style.transform = '';
      return;
    }
    var W = stage.clientWidth, H = stage.clientHeight;
    // та же фигура, что в герое: макушка и подошвы в тех же точках экрана
    var head = Math.max(64, H * .085), sole = H - 49;
    var k = (sole - head) / (JG.SOLE - JG.TOP), top = head - JG.TOP * k, fx = W / 2;
    var Rw = W * .72, margin = Math.max(24, W * .03), cap = Math.min(H * .2, 230);
    var w100 = Math.max.apply(null, steps.map(function (li) { return glyphs(li._txt, 100).w; }));
    var fs = cap, xL = 0, gap = 0;
    for (var i = 0; i < 6; i++) {
      gap = Math.max(22, fs * .16);
      var inL = (JG.L - JG.AX) * k - gap;
      xL = unproj(inL, Rw);
      var sL = (inL + W / 2 - margin) / (inL - proj(xL - w100 * fs / 100, Rw));
      fs = Math.min(cap, fs * sL);
    }
    gap = Math.max(22, fs * .16);
    xL = unproj((JG.L - JG.AX) * k - gap, Rw);
    var y = top + JG.CHEST * k - fs * .5;
    steps.forEach(function (li) {
      var A = glyphs(li._txt, fs), x0 = xL - A.w;
      li._box.style.fontSize = fs + 'px';
      A.g.forEach(function (o, j) {
        var x = x0 + o.x, p = x / Rw, X = Rw * Math.sin(p), Z = Rw * (1 - Math.cos(p));
        li._ch[j].style.transform = 'translate3d(' + (X - o.w / 2).toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + Z.toFixed(1) + 'px) rotateY(' + (-p * 57.2958).toFixed(2) + 'deg)';
      });
    });
    var lx = fx + (JG.R - JG.AX) * k + Math.max(30, fs * .2);
    var S = sec.style;
    S.setProperty('--process-fx', fx + 'px');
    S.setProperty('--process-ft', top + 'px');
    S.setProperty('--process-fh', JG.H * k + 'px');
    S.setProperty('--process-sole', (top + JG.SOLE * k) + 'px');
    S.setProperty('--process-wy', (y + fs * .5) + 'px');
    S.setProperty('--process-lb', (y + fs * .835) + 'px');
    S.setProperty('--process-lx', lx + 'px');
    S.setProperty('--process-lw', Math.min(400, W - lx - margin) + 'px');
    S.setProperty('--process-hy', Math.max(100, head + 26) + 'px');
    S.setProperty('--process-sy', (top + 760 * k) + 'px');
    S.setProperty('--process-sx', Math.min(W * .24, 330) + 'px');
    G = { k: k, H: H };
    onScroll();
  }

  /* смена шага: поза сразу, с подскоком на 3px; слово барабаном; строка всплывает */
  function hop(li) {
    if (reduce) return;
    var f = li.querySelector('.process-fig');
    f.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: .4 }, { transform: 'translateY(0)' }], { duration: 210, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  // i = -1: сцена ещё въезжает, фигура уже стоит в позе 4, слово появится барабаном, когда сцена встанет на место
  function setStep(i) {
    if (i === cur) return;
    var prev = cur, dir = i > prev ? 1 : -1;
    cur = i;
    if (prev >= 0) { var o = steps[prev]; o.style.setProperty('--process-rx', (dir * 78) + 'deg'); o.classList.remove('is-on'); }
    if (i >= 0) {
      var n = steps[i];
      n.style.setProperty('--process-rx', (-dir * 78) + 'deg');
      n.classList.add('is-pre'); void n.offsetWidth; n.classList.remove('is-pre');
      n.classList.add('is-on');
    }
    var pi = Math.max(0, i), pp = Math.max(0, prev);
    if (pi !== pp) { steps[pp].classList.remove('is-pose'); steps[pi].classList.add('is-pose'); hop(steps[pi]); }
    nEl.textContent = pi + 1;
    prevBtn.disabled = pi === 0; nextBtn.disabled = pi === steps.length - 1;
    segs.forEach(function (s, j) { if (!pin) s.style.setProperty('--process-fill', j <= pi ? 1 : 0); if (i >= 0 && j === i) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current'); });
  }

  /* десктоп: шаг и заливка засечек по прокрутке, экран ноутбука листается на третьем шаге */
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var raf = 0, near = false;
  function onScroll() {
    raf = 0;
    if (dead || !pin) return;
    var r = sec.getBoundingClientRect(), span = r.height - G.H;
    var f = clamp(-r.top / span, 0, 1) * steps.length;
    setStep(r.top > G.H * .22 ? -1 : Math.min(steps.length - 1, Math.floor(f)));
    segs.forEach(function (s, j) { s.style.setProperty('--process-fill', clamp(f - j, 0, 1).toFixed(3)); });
    if (screenImg && screenImg.complete && screenImg.naturalWidth) {
      var t = smooth(clamp((f - 2 - .12) / .76, 0, 1));
      var d = screenImg.offsetHeight - screenBox.clientHeight;
      screenImg.style.transform = 'translate3d(0,' + (-t * d).toFixed(1) + 'px,0)';
    }
  }
  var req = function () { if (near && !raf && !dead) raf = requestAnimationFrame(onScroll); };
  on(window, 'scroll', req, { passive: true });
  var nearIO = new IntersectionObserver(function (es) { near = es[0].isIntersecting; if (near) req(); }, { rootMargin: '50% 0px' });
  nearIO.observe(sec);

  function goTo(i) {
    i = clamp(i, 0, steps.length - 1);
    if (pin) {
      var span = sec.offsetHeight - G.H, top = sec.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + span * (i + (i === 2 ? .1 : .5)) / steps.length + 1, behavior: reduce ? 'auto' : 'smooth' });
    } else {
      list.scrollTo({ left: steps[i].offsetLeft - steps[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  segs.forEach(function (s, j) { on(s, 'click', function () { goTo(j); }); });
  on(prevBtn, 'click', function () { goTo(cur - 1); });
  on(nextBtn, 'click', function () { goTo(cur + 1); });
  // клавиатура: фокус на ссылке скрытого шага подводит к этому шагу
  on(list, 'focusin', function (e) { var li = e.target.closest('.process-step'); if (pin && li && !li.classList.contains('is-on')) goTo(steps.indexOf(li)); });

  /* лента: текущий кадр по положению прокрутки */
  var laneRaf = 0;
  on(list, 'scroll', function () {
    if (pin || laneRaf) return;
    laneRaf = requestAnimationFrame(function () {
      laneRaf = 0;
      if (dead) return;
      var x = list.scrollLeft, w = steps[1].offsetLeft - steps[0].offsetLeft;
      setStep(clamp(Math.round(x / w), 0, steps.length - 1));
    });
  }, { passive: true });
  // экран на телефоне листается сам, только пока лента в кадре
  var liveIO = new IntersectionObserver(function (es) { sec.classList.toggle('process-live', es[0].isIntersecting); });
  liveIO.observe(list);

  var rz = 0;
  on(window, 'resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  on(wideMQ, 'change', layout);
  layout();
  if (document.fonts) document.fonts.load('900 100px ' + FAM, 'РАЗБОР').then(layout);

  return function destroy() {
    dead = true;
    cancelAnimationFrame(raf); cancelAnimationFrame(laneRaf); clearTimeout(rz);
    offs.forEach(function (f) { f(); }); offs = [];
    nearIO.disconnect(); liveIO.disconnect();
    steps.forEach(function (li, i) {
      li.querySelector('.process-word').textContent = li._orig;
      li.classList.toggle('is-on', i === 0); li.classList.toggle('is-pose', i === 0); li.classList.remove('is-pre');
      li.style.removeProperty('--process-rx');
    });
    segs.forEach(function (s, j) {
      s.style.removeProperty('--process-fill'); if (j === 0) { s.style.setProperty('--process-fill', 1); s.setAttribute('aria-current', 'step'); } else s.removeAttribute('aria-current');
    });
    nEl.textContent = '1'; prevBtn.disabled = true; nextBtn.disabled = false;
    if (screenImg) screenImg.style.transform = '';
    sec.classList.remove('is-js', 'is-pin', 'process-live');
    ['--process-fx', '--process-ft', '--process-fh', '--process-sole', '--process-wy', '--process-lb', '--process-lx', '--process-lw', '--process-hy', '--process-sy', '--process-sx'].forEach(function (p) { sec.style.removeProperty(p); });
  };
}
