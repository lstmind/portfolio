/* 404: композиция героя. Ванильный код статики design-concepts/v4/karusel/404.html.
   Фигура стоит на красном язычке "На главную", два слова на уровне ладоней: пожимает плечами (поза 9),
   при наведении на язычок показывает вниз (поза 3). На телефоне один раз показывает сам.
   Функция самодостаточная: сервер вставляет её текст в страницу (nfRun.toString()) и она раскладывает сцену
   ещё до гидрации. Возвращает функцию полной очистки. Никаких импортов и внешних переменных. */
export function nfRun(nf) {
  var IMG = '/img/v4/';
  var dead = false, offs = [], timers = [];
  var on = function (t, type, fn, opt) { t.addEventListener(type, fn, opt); offs.push(function () { t.removeEventListener(type, fn, opt); }); };
  var later = function (fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; };

  var L = nf.querySelector('#nf-l'), R = nf.querySelector('#nf-r'), word = nf.querySelector('#nf-word');
  var p9 = nf.querySelector('#nf-9'), p3 = nf.querySelector('#nf-3'), figs = nf.querySelector('#nf-figs'), cta = nf.querySelector('.nf-cta');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, coarse = matchMedia('(hover: none)').matches;
  // холсты: поза 9 532x984, ось x=267; поза 3 400x984, ось x=188; подошвы у обеих y=978, макушка y=6
  // слова лежат над ладонями: у позы 9 полоса y 60..244 свободна левее x=132 и правее x=411, правая ладонь начинается с y=246
  var AX9 = 267, AX3 = 188, SOLE = 978, TOP = 6, BAND_L = 132, BAND_R = 411, PALM = 240;
  // ширины в em (Fira Sans Condensed 900, трекинг -.012em): чернила "СТРАНИЦЫ" 4.583, "НЕТ" 1.55; база в строке line-height:1 на .835
  var WL = 4.583, WR = 1.55, BASE = .835;

  function layout() {
    if (dead) return;
    var W = nf.clientWidth, H = nf.clientHeight;
    // телефон и узкий высокий экран (планшет стоя): слова строками сверху. рядом с фигурой им там места нет,
    // ладони оказываются на трети высоты и слова выходят мелкими, а подпись справа уходит под штанину
    var mob = W < 700 || H > W * 1.2;
    var tiny = W < 700, soleY = H - (tiny ? 60 : 64) + (tiny ? 13 : 15), fs, k, fx = W / 2, top;
    if (!mob) {
      // слово, фигура, слово: блок по центру экрана. "СТРАНИЦЫ" втрое шире "НЕТ", поэтому фигура уезжает вправо от середины
      var headY = Math.max(64, H * .085), m = Math.max(24, W * .03);
      k = (soleY - headY) / (SOLE - TOP); top = headY - TOP * k;
      var span = (BAND_R - BAND_L) * k, g = 22;
      fs = Math.min(H * .2, 230);
      for (var i = 0; i < 6; i++) { g = Math.max(22, fs * .16); fs = Math.min(H * .2, 230, (PALM - 60) * k / .703, (W - 2 * m - span - 2 * g) / (WL + WR)); }
      g = Math.max(22, fs * .16);
      var T = WL * fs + g + span + g + WR * fs;
      fx = (W - T) / 2 + WL * fs + g + (AX9 - BAND_L) * k;
      var yb = top + PALM * k;
      word.style.fontSize = fs + 'px';
      L.style.transform = 'translate(' + (fx + (BAND_L - AX9) * k - g - WL * fs).toFixed(1) + 'px,' + (yb - BASE * fs).toFixed(1) + 'px)';
      R.style.transform = 'translate(' + (fx + (BAND_R - AX9) * k + g - .031 * fs).toFixed(1) + 'px,' + (yb - BASE * fs).toFixed(1) + 'px)';
      nf.style.setProperty('--nf-side-y', Math.min(H * .735, soleY - 150) + 'px');
    } else {
      // телефон: два слова строками сверху, фигура целиком ниже
      var yT = Math.max(60, H * .08), lh = .95;
      fs = Math.min((W - 32) / WL, H * .11);
      word.style.fontSize = fs + 'px';
      L.style.transform = 'translate(' + ((W - WL * fs) / 2).toFixed(1) + 'px,' + yT.toFixed(1) + 'px)';
      R.style.transform = 'translate(' + ((W - WR * fs) / 2 - .031 * fs).toFixed(1) + 'px,' + (yT + lh * fs).toFixed(1) + 'px)';
      var headY2 = yT + lh * fs + fs + Math.max(22, H * .03);
      k = (soleY - headY2) / (SOLE - TOP); top = headY2 - TOP * k;
      // разведённые руки не шире экрана
      var kMax = (W - 12) / 520;
      if (k > kMax) { k = kMax; top = soleY - SOLE * k; }
      nf.style.setProperty('--nf-side-y', (H - (tiny ? 60 : 64) - 96) + 'px');
    }
    nf.style.setProperty('--fx', fx + 'px');
    nf.style.setProperty('--nf-m', Math.max(16, Math.min(40, W * .026)) + 'px');
    place(p9, AX9, 532, fx, top, k);
    place(p3, AX3, 400, fx, top, k);
  }
  function place(im, ax, w, fx, top, k) {
    im.style.left = (fx - ax * k).toFixed(1) + 'px';
    im.style.top = top.toFixed(1) + 'px';
    im.style.width = (w * k).toFixed(1) + 'px';
    im.sizes = Math.ceil(w * k) + 'px';
  }
  layout();
  // кадр позы 9 запрашиваем после раскладки: sizes уже точный, браузер не тянет лишний размер
  if (!p9.getAttribute('src')) {
    p9.srcset = [560, 780, 984, 1400].map(function (h, j) { return IMG + 'pose-j9-' + h + '.webp ' + [303, 422, 532, 757][j] + 'w'; }).join(', ');
    p9.src = IMG + 'pose-j9-780.webp';
  }
  on(window, 'resize', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  var pose = 9, ready = false;
  function show(p) {
    if (dead || p === pose || (p === 3 && !ready)) return;
    pose = p;
    p9.style.opacity = p === 9 ? 1 : 0; p3.style.opacity = p === 3 ? 1 : 0;
    // как спрайт: кадр меняется сразу, фигура подпрыгивает на 3px
    if (figs.animate) figs.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: .4 }, { transform: 'translateY(0)' }], { duration: 210, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  function hot(v) { nf.classList.toggle('hot', v); show(v ? 3 : 9); }

  if (!reduce) {
    // поза 3 подгружается после страницы
    var load3 = function () {
      if (dead) return;
      p3.srcset = [560, 780, 984, 1400, 1600, 1968].map(function (h, j) { return IMG + 'pose-j3-' + h + '.webp ' + [228, 317, 400, 569, 650, 800][j] + 'w'; }).join(', ');
      p3.src = IMG + 'pose-j3-780.webp';
      var ok = function () { ready = true; };
      (p3.decode ? p3.decode() : Promise.reject()).then(ok, function () { p3.addEventListener('load', ok, { once: true }); });
    };
    var go = function () { if (window.requestIdleCallback) requestIdleCallback(load3, { timeout: 1000 }); else later(load3, 200); };
    if (document.readyState === 'complete') go(); else on(window, 'load', go, { once: true });

    on(cta, 'pointerenter', function (e) { if (e.pointerType === 'mouse') hot(true); });
    on(cta, 'pointerleave', function () { hot(false); });
    on(cta, 'focus', function () { if (cta.matches(':focus-visible')) hot(true); });
    on(cta, 'blur', function () { hot(false); });
    // на телефоне наведения нет: один раз показывает на язычок сам
    if (coarse) {
      later(function tryHint() {
        if (dead) return;
        if (!ready) { later(tryHint, 300); return; }
        nf.classList.add('hint'); show(3);
        later(function () { nf.classList.remove('hint'); show(9); }, 2300);
      }, 1900);
    }
  }

  return function destroy() {
    dead = true;
    offs.forEach(function (f) { f(); });
    timers.forEach(clearTimeout);
    nf.classList.remove('hot', 'hint');
    p9.style.opacity = ''; p3.style.opacity = '';
  };
}
