/* Герой "карусель": слово на дуге, кольцо сайтов, три позы персонажа, стрелка от пальца к кнопке.
   Ванильный код статики (design-concepts/v4/karusel/hero.html) без экспериментальных вариантов: футболка, слова по бокам, смена кадра с подскоком.
   Функция самодостаточная: сервер вставляет её текст в страницу (heroRun.toString()), и она запускается сразу при разборе html,
   до гидрации, как в статике. Возвращает функцию полной очистки. Никаких импортов и внешних переменных. */
export function heroRun(hero) {
  var IMG = '/img/v4/';
  var dead = false;
  var offs = [];
  var on = function (t, type, fn, opt) { t.addEventListener(type, fn, opt); offs.push(function () { t.removeEventListener(type, fn, opt); }); };

  var ul = hero.querySelector('#cards');
  var wordEl = hero.querySelector('#word');
  var whoEl = hero.querySelector('#who');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(hover: none)').matches;
  // шрифт заголовка: next/font даёт семейству своё имя, берём его из той же переменной, что и стили
  var FAM = getComputedStyle(hero).getPropertyValue('--display').trim() || '"Fira Sans Condensed"';

  /* ---------- карточки: разметка с сервера, здесь только состояние ---------- */
  var cardEls = Array.prototype.slice.call(ul.querySelectorAll('.card'));
  var N = cardEls.length, STEP = 360 / N;
  var cards = cardEls.map(function (a, i) {
    a.querySelectorAll('img').forEach(function (im) { on(im, 'error', function () { im.style.visibility = 'hidden'; }); });
    return { name: a.dataset.name, host: a.dataset.host, el: a, fog: a.querySelector('.fog'), soft: a.querySelector('.soft'), i: i, ang: 0, lift: 0, vis: true };
  });

  /* ---------- геометрия ---------- */
  var G = {}, laidOut = '';
  // force: пересчёт после загрузки шрифта нужен, только если что-то мерили canvas-ом (иначе размеры те же)
  function layout(force) {
    if (dead) return;
    var W = hero.clientWidth, H = hero.clientHeight, mob = W < 700;
    // строка "кто, где, сколько" могла переложиться другим числом строк, когда догрузился Montserrat: тогда тоже пересчёт
    var key = W + 'x' + H + 'x' + (whoEl ? whoEl.offsetHeight : 0);
    if (force === 'font' && !byCanvas && laidOut === key) return;
    laidOut = key;
    var ch = mob ? Math.min(H * 0.4, 350) : Math.min(H * 0.43, W * 0.3);
    var cw = ch * 390 / 844;
    var R = mob ? cw * 2.35 : cw * 3.7;
    var d = R * (mob ? 2.4 : 3.28);
    var P = d + R;
    G = { W: W, H: H, mob: mob, cw: cw, ch: ch, R: R, P: P, k: mob ? .55 : .62 };
    hero.style.setProperty('--cw', cw + 'px');
    hero.style.setProperty('--ch', ch + 'px');
    hero.style.setProperty('--P', P + 'px');
    layoutJ();
  }
  // телефон: высота карточек под заданный просвет; R и перспектива пропорциональны высоте
  function setCards(ch) {
    var cw = ch * 390 / 844, R = cw * 2.35, P = R * 2.4 + R;
    G.ch = ch; G.cw = cw; G.R = R; G.P = P;
    hero.style.setProperty('--cw', cw + 'px'); hero.style.setProperty('--ch', ch + 'px'); hero.style.setProperty('--P', P + 'px');
  }
  // во сколько раз ближние к зрителю карточки, видимые на экране, выше центральной (кольцо крутится, берём худший угол)
  function cardScale(ch, W) {
    var cw = ch * 390 / 844, R = cw * 2.35, P = R * 3.4, s = 1;
    for (var a = 0; a < 104; a += 2) {
      var r = a * Math.PI / 180, Z = R * (1 - Math.cos(r)), k = P / (P - Z);
      if (R * Math.sin(r) * k - cw / 2 * k < W / 2) s = Math.max(s, k);
    }
    return s;
  }

  /* ---------- слово на дуге ---------- */
  var poseImgs = [hero.querySelector('#me'), hero.querySelector('#me2'), hero.querySelector('#me3')];
  var me = poseImgs[0];
  var PF = { pre: 'pose-j', w: 400, h: 984, hs: [560, 780, 984, 1400, 1600, 1968], ws: [228, 317, 400, 569, 650, 800] };
  var FIRST = (hero.dataset.words || 'делаю,чиню,ускоряю').split(',');
  var wi = 0, letters = [], fs = 100;
  var mctx = document.createElement('canvas').getContext('2d');
  // ширины строк шрифтом Fira Sans Condensed 900 на 100px, с кернингом (сняты canvas-ом с загруженным шрифтом).
  // по ним геометрия героя сразу та же, что после загрузки шрифта: фигура и карточки не прыгают, когда шрифт догружается.
  // строки, которой нет в таблице (сменили слова в lib/home.ts), меряем как раньше, тогда после загрузки шрифта пересчёт
  var W100 = { 'Д': 59.9, 'Е': 47, 'Л': 59.1, 'ДЕ': 106.9, 'А': 55.4, 'ДЕЛ': 166, 'Ю': 87.4, 'ДЕЛА': 221.4, 'ДЕЛАЮ': 308.8, 'Ч': 56.9, 'И': 59, 'Н': 59.6, 'ЧИ': 115.9, 'ЧИН': 175.5, 'ЧИНЮ': 262.9, 'У': 54.6, 'С': 53.5, 'К': 59.4, 'УС': 107.1, 'О': 63.2, 'УСК': 166.5, 'Р': 55.7, 'УСКО': 227.7, 'Я': 55.8, 'УСКОР': 283.4, 'УСКОРЯ': 339.2, 'УСКОРЯЮ': 426.6, 'Й': 59, 'СА': 108.9, 'Т': 50.4, 'САЙ': 167.9, 'Ы': 79.8, 'САЙТ': 218.3, 'САЙТЫ': 298.1 };
  var byCanvas = false;
  function adv(s) {
    if (!s) return 0;
    if (Object.prototype.hasOwnProperty.call(W100, s)) return W100[s] * fs / 100;
    byCanvas = true;
    mctx.font = '900 ' + fs + 'px ' + FAM; return mctx.measureText(s).width;
  }
  function buildWord(first, animate) {
    var placed = placeJ(first);
    // буквы второго слова переиспользуем: они едут по дуге, первое слово меняется на барабане
    var keep = letters.filter(function (L) { return L.tail; });
    var old = letters.filter(function (L) { return !L.tail; });
    var next = [];
    var tailIdx = 0;
    placed.forEach(function (o) {
      if (o.c === ' ') return;
      if (o.tail && keep[tailIdx]) {
        var K = keep[tailIdx++]; K.el.style.transform = o.t; next.push(K); return;
      }
      var s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('i'); inner.textContent = o.c; s.appendChild(inner);
      s.style.transform = o.t;
      if (animate) { s.classList.add('pre'); s.style.transition = 'none'; inner.style.transitionDelay = (o.k * 40 + 420) + 'ms'; }
      wordEl.appendChild(s);
      next.push({ el: s, tail: o.tail });
    });
    old.forEach(function (L, j) {
      if (!animate) { L.el.remove(); return; }
      L.el.querySelector('i').style.transitionDelay = (j * 35) + 'ms';
      L.el.classList.add('out');
      setTimeout(function () { L.el.remove(); }, 900 + j * 35);
    });
    if (animate) {
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        next.forEach(function (L) { if (L.el.classList.contains('pre')) { L.el.style.transition = ''; L.el.classList.remove('pre'); } });
      }); });
    }
    letters = next;
  }

  /* ---------- фигура и заголовок не пересекаются ---------- */
  // холст поз 400x984: ось корпуса x=188, макушка y=6, подошва y=978; огибающая всех трёх поз по 48 полосам [лево, право]
  var JG = { W: 400, H: 984, AX: 188, TOP: 6, SOLE: 978, CHEST: 232,
    ENV: [[121,240],[107,260],[102,266],[101,268],[117,265],[24,243],[7,242],[10,295],[13,313],[12,323],[17,392],[14,391],[11,383],[7,387],[7,382],[9,372],[12,363],[33,354],[58,344],[56,308],[61,292],[65,280],[69,282],[70,280],[73,279],[73,282],[84,283],[85,284],[88,282],[87,285],[90,285],[91,284],[90,288],[91,291],[95,291],[95,291],[95,294],[95,297],[96,296],[94,297],[95,298],[94,300],[90,298],[88,295],[93,297],[77,320],[73,331],[75,333]] };
  var WL = null;
  function figAt(fx, headY, soleY) { var k = (soleY - headY) / (JG.SOLE - JG.TOP); return { fx: fx, k: k, top: headY - JG.TOP * k }; }
  function figExt(f, y0, y1) {
    // экранные левый и правый края фигуры (любой из трёх поз) в полосе y0..y1
    var n = JG.ENV.length, bh = JG.H / n, l = 1e9, r = -1e9;
    var b0 = Math.max(0, Math.floor((y0 - f.top) / f.k / bh)), b1 = Math.min(n - 1, Math.floor((y1 - f.top) / f.k / bh));
    for (var b = b0; b <= b1; b++) { var e = JG.ENV[b]; if (e) { l = Math.min(l, e[0]); r = Math.max(r, e[1]); } }
    return l > r ? [f.fx, f.fx] : [f.fx + (l - JG.AX) * f.k, f.fx + (r - JG.AX) * f.k];
  }
  function glyphs(str) {
    // буквы строки от её начала, кернинг по префиксам
    var ls = -0.012 * fs, g = [];
    for (var i = 0; i < str.length; i++) { var w = adv(str[i]); g.push({ c: str[i], x: adv(str.slice(0, i)) + ls * i + w / 2, w: w }); }
    var L = g[g.length - 1]; return { g: g, w: L.x + L.w / 2 };
  }
  var PERSP = 1100;
  function proj(x, Rw) { var p = x / Rw, Z = Rw * (1 - Math.cos(p)); return Rw * Math.sin(p) * PERSP / (PERSP - Z); }
  function unproj(X, Rw) { var a = -Rw, b = Rw; for (var i = 0; i < 40; i++) { var m = (a + b) / 2; if (proj(m, Rw) < X) a = m; else b = m; } return (a + b) / 2; }
  function widthAt(str, size) { var k = fs; fs = size; var w = glyphs(str).w; fs = k; return w; }
  var LONG = FIRST.reduce(function (a, b) { return b.length > a.length ? b : a; }, '').toUpperCase(), TAIL = 'САЙТЫ';
  function layoutJ() {
    var W = G.W, H = G.H, mob = G.mob;
    hero.style.removeProperty('--word-x');
    hero.style.removeProperty('--who-y');
    var soleY = H - (mob ? 60 : 64) + (mob ? 13 : 15);   // подошвы чуть заходят на красный язычок
    var w100 = widthAt(LONG, 100), t100 = widthAt(TAIL, 100);
    var fx = W / 2, f, S, i;
    if (mob) {
      // телефон: заголовок в две строки сверху, фигура целиком ниже него
      var Rw = W * .95, yT = Math.max(52, H * .07), lh = 1.17, avail = W - 32;   // у Й кратка на .94em над базой, у заглавных .72: строки разведены так, чтобы кратка стояла в чистом просвете
      fs = 100;
      for (i = 0; i < 4; i++) {
        var half = proj(w100 * fs / 100 / 2, Rw);
        fs *= (avail / 2) / half;
      }
      fs = Math.min(fs, H * .118);
      // строка "кто, где, сколько" сразу под словами; фигура и карточки опускаются на её высоту
      var wb = yT + lh * fs + fs * .92, whoH = whoEl ? whoEl.offsetHeight : 0, add = whoH ? whoH + 8 : 0;
      if (whoEl) hero.style.setProperty('--who-y', (wb + 10) + 'px');
      f = figAt(fx, yT + lh * fs + fs + Math.max(26, H * .03) + add, soleY);   // запас на подскок (3) и подсказку (8)
      S = { mode: 'center', arc: true, Rw: Rw, y: yT, lh: lh * fs };
      // карточки за корпусом, от заголовка вниз; подписи ниже карточек на чистой бумаге у штанин, не поверх скринов
      var capH = 36, top = wb + 16 + add, ctaTop = H - 60;
      var span = Math.max(180, (ctaTop - 24 - capH - top) * .8);
      var ch = G.ch;
      for (i = 0; i < 3; i++) ch *= span / (ch * cardScale(ch, W));
      setCards(ch);
      S.cy = top + span / 2;
      hero.style.setProperty('--side-y', (top + span + 14) + 'px');
      var sy = top + span + 14, leg = figExt(f, sy - 8, sy + 56);
      hero.style.setProperty('--capw-l', Math.max(90, leg[0] - 12 - 10) + 'px');
      hero.style.setProperty('--capw-r', Math.max(90, W - 12 - leg[1] - 10) + 'px');
    } else {
      // по бокам: первое слово слева от фигуры, САЙТЫ справа, на уровне груди
      f = figAt(fx, Math.max(64, H * .085), soleY);
      var Rw2 = W * .72, margin = Math.max(24, W * .03), cap = Math.min(H * .2, 230);
      fs = cap;
      var xL = 0, xR = 0, y = 0, ext, gap;
      for (i = 0; i < 6; i++) {
        y = f.top + JG.CHEST * f.k - fs * .5;
        ext = figExt(f, y, y + fs); gap = Math.max(22, fs * .16);
        var inL = ext[0] - gap - W / 2, inR = ext[1] + gap - W / 2;
        xL = unproj(inL, Rw2); xR = unproj(inR, Rw2);
        var wl = w100 * fs / 100, wr = t100 * fs / 100;
        var sL = (inL + W / 2 - margin) / (inL - proj(xL - wl, Rw2));
        var sR = (W / 2 - margin - inR) / (proj(xR + wr, Rw2) - inR);
        fs = Math.min(cap, fs * Math.min(sL, sR));
      }
      y = f.top + JG.CHEST * f.k - fs * .5;
      ext = figExt(f, y, y + fs); gap = Math.max(22, fs * .16);
      xL = unproj(ext[0] - gap - W / 2, Rw2); xR = unproj(ext[1] + gap - W / 2, Rw2);
      S = { mode: 'sides', arc: true, Rw: Rw2, y: y, xL: xL, xR: xR };
      // карточки ниже слов: слова на чистой бумаге, подписи под карточками
      S.cy = y + fs + Math.max(22, H * .035) + G.ch / 2;
      hero.style.setProperty('--side-y', (S.cy + G.ch / 2 + Math.max(24, H * .03)) + 'px');
    }
    WL = S;
    wordEl.style.fontSize = fs + 'px';
    hero.style.setProperty('--fx', fx + 'px');
    hero.style.setProperty('--word-y', (S.y + (S.mode === 'sides' ? fs * .5 : S.lh * .5 + fs * .5)) + 'px');
    hero.style.setProperty('--me-t', f.top + 'px');
    hero.style.setProperty('--me-h', JG.H * f.k + 'px');
    hero.style.setProperty('--cy', (S.cy || f.top + (JG.TOP + (JG.SOLE - JG.TOP) * (mob ? .44 : .4)) * f.k) + 'px');
    // телефоны с плотностью от 2,5: файл не больше 569w (pose-*-1400), как в sizes разметки (Hero.tsx)
    var dpr = window.devicePixelRatio || 1, szPx = Math.ceil(JG.W * f.k);
    if (mob && dpr >= 2.5) szPx = Math.min(szPx, Math.floor(569 / dpr));
    var sz = szPx + 'px';
    poseImgs.forEach(function (im) { im.sizes = sz; });
    letters.forEach(function (L) { L.el.remove(); }); letters = [];
    buildWord(FIRST[wi], false);
  }
  function placeJ(first) {
    var S = WL, A = glyphs(first.toUpperCase()), B = glyphs(TAIL), out = [];
    var put = function (gl, x0, y, tail) { gl.g.forEach(function (o, k) {
      var x = x0 + o.x;
      var p = x / S.Rw, X = S.Rw * Math.sin(p), Z = S.Rw * (1 - Math.cos(p));
      var t = 'translate3d(' + (X - o.w / 2).toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + Z.toFixed(1) + 'px) rotateY(' + (-p * 57.2958).toFixed(2) + 'deg)';
      out.push({ c: o.c, t: t, tail: tail, k: k });
    }); };
    if (S.mode === 'sides') { put(A, S.xL - A.w, S.y, false); put(B, S.xR, S.y, true); }
    else { put(A, -A.w / 2, S.y, false); put(B, -B.w / 2, S.y + S.lh, true); }
    return out;
  }

  /* ---------- маска портрета: клик по фигуре не открывает сайт ---------- */
  var masks = new Map();
  function readMask(im) {
    try {
      var w = 152, h = Math.round(152 * im.naturalHeight / im.naturalWidth);
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, w, h);
      masks.set(im, { data: x.getImageData(0, 0, w, h).data, w: w, h: h });
    } catch (e) { masks.set(im, null); }
  }
  // маску снимаем при первой надобности (наведение, касание): рисование кадра в canvas разжимает картинку
  // на главном потоке, и при загрузке страницы это была лишняя длинная задача
  function maskOf(im) {
    if (!masks.has(im) && im.complete && im.naturalWidth) readMask(im);
    return masks.get(im);
  }
  function overPortrait(px, py) {
    var im = poseImgs[pose - 1] || me;
    var r = im.getBoundingClientRect();
    if (px < r.left || px > r.right || py < r.top || py > r.bottom) return false;
    var mask = maskOf(im) || maskOf(me);
    if (!mask) return py > r.top + r.height * 0.05 && Math.abs(px - (r.left + r.width / 2)) < r.width * 0.25;
    var ix = Math.floor((px - r.left) / r.width * mask.w), iy = Math.floor((py - r.top) / r.height * mask.h);
    return mask.data[(iy * mask.w + ix) * 4 + 3] > 100;
  }

  /* ---------- жест: стрелка тушью от кончика пальца (поза 3) к кнопке ---------- */
  var ptSvg = hero.querySelector('#point'), pL = hero.querySelector('#pL'), pH = hero.querySelector('#pH');
  var pmL = hero.querySelector('#pmL'), pmH = hero.querySelector('#pmH'), rL = hero.querySelector('#rL'), rH = hero.querySelector('#rH');
  var ctaEl = hero.querySelector('.cta');
  var TIP = [116 / 400, 566 / 984];                                       // кончик указательного пальца в кадре позы 3
  var DASH = [3.6, 2.7, 2.5, 3.0, 4.2, 2.8, 2.9, 3.2, 3.3, 2.6];
  var ptOn = false, ptAnim = [];
  function ptGeom() {
    var hr = hero.getBoundingClientRect(), fr = poseImgs[2].getBoundingClientRect(), br = ctaEl.getBoundingClientRect();
    var mob = G.mob;
    // кнопка и фигура подрастают на 8 px (наведение, подсказка): берём конечное положение, а не середину перехода
    var up = hero.classList.contains('hint') || (ctaHot && !mob && ctaEl.matches(':hover')) ? 8 : 0;
    var bTop = br.bottom - hr.top - (mob ? 60 : 64) - up;
    var sx = fr.left - hr.left + TIP[0] * fr.width, sy = fr.top - hr.top + TIP[1] * fr.height;
    var k = mob ? 1 : Math.min(1.25, fr.height / 620);
    var S = [sx - 1.5 * k, sy + 11 * k];
    var E, c1, c2, dy;
    if (mob) {
      // палец над штаниной, дуга сразу уходит влево от ноги и заходит в верх кнопки у левого угла
      E = [br.left - hr.left + 30, bTop - 5];
      dy = E[1] - S[1];
      c1 = [S[0] - 40, S[1] + dy * .2]; c2 = [E[0] - 4, E[1] - dy * .45];
    } else {
      // на десктопе дуга уходит влево от ноги и заходит на скруглённый угол кнопки сверху-слева
      E = [br.left - hr.left + 9, bTop - 3];
      dy = E[1] - S[1];
      c1 = [S[0] - 10 * k, S[1] + dy * .42]; c2 = [E[0] - 34 * k, E[1] - dy * .4];
    }
    var fmt = function (p) { return p.map(function (v) { return v.toFixed(1); }).join(','); };
    var d = 'M' + fmt(S) + 'C' + [c1, c2, E].map(fmt).join(' ');
    // наконечник: два штриха под углом к касательной в конце
    var ang = Math.atan2(E[1] - c2[1], E[0] - c2[0]), L = (mob ? 11 : 13) * k, sp = .5;
    var a1 = [E[0] - L * Math.cos(ang - sp), E[1] - L * Math.sin(ang - sp)], a2 = [E[0] - L * Math.cos(ang + sp), E[1] - L * Math.sin(ang + sp)];
    var h = 'M' + fmt(a1) + 'L' + fmt(E) + 'L' + fmt(a2);
    var w = (mob ? 2.1 : 2.5) * k;
    return { d: d, h: h, w: w };
  }
  var ptKey = '';
  function ptPlace() {
    var g = ptGeom();
    // каждый кадр зовётся из tick: перерисовываем svg (и фильтр туши) только если геометрия сдвинулась
    var key = g.d + g.h;
    if (key === ptKey) return;
    ptKey = key;
    [pL, pmL, rL].forEach(function (el) { el.setAttribute('d', g.d); }); [pH, pmH, rH].forEach(function (el) { el.setAttribute('d', g.h); });
    pL.style.strokeWidth = g.w; pH.style.strokeWidth = g.w * 1.06;
    rL.style.strokeWidth = rH.style.strokeWidth = g.w + 3.4;   // бумажная кромка: штрихи читаются и поверх карточек
    // неровный ритм штрихов, как рукой
    rL.style.strokeDasharray = pL.style.strokeDasharray = DASH.map(function (q) { return (q * g.w).toFixed(1); }).join(' ');
    pmL.style.strokeWidth = pmH.style.strokeWidth = (g.w * 5).toFixed(1);
  }
  function pointer(v) {
    if (v === ptOn) return;
    ptOn = v;
    ptAnim.forEach(function (a) { a.cancel(); }); ptAnim = [];
    if (v) {
      ptPlace(); ptSvg.classList.add('on');
      // линия "рисуется" от пальца вниз, потом наконечник
      pmL.style.strokeDashoffset = 1; pmH.style.strokeDashoffset = 1;
      ptAnim.push(pmL.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 430, delay: 70, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }));
      ptAnim.push(pmH.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 140, delay: 470, easing: 'ease-out', fill: 'forwards' }));
    } else ptSvg.classList.remove('on');
  }

  /* ---------- позы: 1 покой, 2 печатает, 3 показывает вниз на кнопку ---------- */
  var pose = 1;
  var poseReady = [true, false, false];
  var figs = hero.querySelector('#figs');
  var lastSwitch = 0;
  function showPose(p) {
    if (p === pose) return;
    var inc = poseImgs[p - 1];
    pose = p; lastSwitch = performance.now();
    hero.dataset.pose = p;
    pointer(p === 3);
    // как спрайт: кадр меняется сразу, фигура чуть подпрыгивает
    poseImgs.forEach(function (im) { im.style.transition = 'none'; im.style.opacity = im === inc ? 1 : 0; });
    figs.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: 0.4 }, { transform: 'translateY(0)' }],
      { duration: 210, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  function loadPoses() {
    if (dead) return;
    [2, 3].forEach(function (p) {
      var im = poseImgs[p - 1];
      im.width = PF.w; im.height = PF.h;
      im.sizes = me.sizes;
      im.srcset = PF.hs.map(function (h, j) { return IMG + PF.pre + p + '-' + h + '.webp ' + PF.ws[j] + 'w'; }).join(', ');
      im.src = IMG + PF.pre + p + '-780.webp';
      var ok = function () { if (dead) return; poseReady[p - 1] = true; };
      (im.decode ? im.decode() : Promise.reject()).then(ok, function () { im.addEventListener('load', ok, { once: true }); });
    });
  }
  var idle = 0;
  if (!reduce) {
    var go = function () { idle = (window.requestIdleCallback || setTimeout)(loadPoses, { timeout: 1200 }); };
    if (document.readyState === 'complete') go(); else on(window, 'load', go, { once: true });
  }
  // что сейчас просится: наведение на кнопку > тянут карусель > подсказка > "печатает" время от времени
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var ctaHot = false, burstUntil = 0, nextBurst = performance.now() + rnd(6500, 8000);
  var dragEndT = -1e9, swiped = false, hintAt = 0, hintUntil = 0, hintDone = false;
  function updatePose(now) {
    if (reduce) return;
    var spinning = (dragging && moved > 6) || (now - dragEndT < 2600 && Math.abs(vel) > 30);
    if (coarse && swiped && !hintDone && hintAt && now > hintAt && !spinning && !dragging) {
      hintUntil = now + 2300; hintDone = true;
    }
    if (pose === 1 && !spinning && !ctaHot && now > nextBurst && !document.hidden) {
      burstUntil = now + rnd(1700, 2300); nextBurst = 1e15;
    }
    var want = 1;
    if (now < burstUntil) want = 2;
    if (now < hintUntil) want = 3;
    if (spinning) want = 2;
    if (ctaHot) want = 3;
    if (!poseReady[want - 1]) want = 1;
    if (want === pose) return;
    // без дёрганья: кадр держится хотя бы 0.4 с (наведение на кнопку отвечает сразу)
    if (!(ctaHot && want === 3) && now - lastSwitch < 400) return;
    showPose(want);
    hero.classList.toggle('hint', want === 3 && !ctaHot);
    if (want === 1) { burstUntil = 0; nextBurst = now + rnd(7000, 9000); }
  }
  if (!reduce) {
    on(ctaEl, 'pointerenter', function (e) { if (e.pointerType === 'mouse') ctaHot = true; });
    on(ctaEl, 'pointerleave', function () { ctaHot = false; });
    // только фокус с клавиатуры: после тапа или клика фокус остаётся на ссылке и при возврате во вкладку поза 3 залипала бы
    on(ctaEl, 'focus', function () { ctaHot = ctaEl.matches(':focus-visible'); });
    on(ctaEl, 'blur', function () { ctaHot = false; });
  }

  /* ---------- движение ---------- */
  var FOG0 = matchMedia('(max-width: 699px)').matches ? 0.58 : 0.5;
  var AUTO = reduce ? 0 : -3.2;            // град/с, медленно сама
  var rot = reduce ? -STEP * 0.5 : 70;     // въезд при загрузке
  var vel = reduce ? 0 : -78;
  var target = null;                       // для тапа / фокуса
  var hovered = null, selected = null;
  var dragging = false, lastX = 0, lastT = 0, moved = 0, samples = [];

  var smooth = function (a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  var norm = function (a) { return ((a % 360) + 540) % 360 - 180; };

  function render() {
    var R = G.R, k = G.k;
    for (var n = 0; n < cards.length; n++) {
      var c = cards[n];
      var a = norm(c.i * STEP + rot);
      c.ang = a;
      var A = Math.abs(a);
      var vis = A < 112;
      if (vis !== c.vis) { c.el.style.visibility = vis ? '' : 'hidden'; c.vis = vis; }
      if (!vis) continue;
      var r = a * Math.PI / 180;
      var isOn = c === hovered || c === selected;
      c.lift += ((isOn ? 1 : 0) - c.lift) * 0.18;
      var X = R * Math.sin(r), Z = R * (1 - Math.cos(r)) + c.lift * R * 0.06;
      c.el.style.transform = 'translate3d(' + X.toFixed(1) + 'px,0,' + Z.toFixed(1) + 'px) rotateY(' + (-a * k).toFixed(2) + 'deg)';
      // пишем в стиль только то, что заметно изменилось
      var op = (1 - smooth(92, 112, A)).toFixed(2);
      if (op !== c.op) { c.el.style.opacity = op; c.op = op; }
      if (!isOn) {
        var fo = (FOG0 + 0.26 * smooth(14, 100, A)).toFixed(2);
        var so = smooth(G.mob ? 34 : 40, G.mob ? 62 : 74, A).toFixed(2);
        if (fo !== c.fo) { c.fog.style.opacity = fo; c.fo = fo; }
        if (so !== c.so) { c.soft.style.opacity = so; c.so = so; }
      } else { c.fo = c.so = null; }
    }
  }

  var prev = performance.now(), yaw = 0, yawShown = 0, heroOn = true, looping = true, raf = 0;
  function tick(now) {
    raf = 0;
    if (dead) return;
    var dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    if (!dragging) {
      if (target !== null) {
        var diff = target - rot;
        rot += diff * (1 - Math.exp(-dt * 7));
        vel = 0;
        if (Math.abs(diff) < 0.05) { rot = target; target = null; }
      } else {
        var goal = (hovered || selected || document.hidden) ? 0 : AUTO;
        vel += (goal - vel) * (1 - Math.exp(-dt * (Math.abs(vel) > 8 ? 0.9 : 2.2)));
        rot += vel * dt;
      }
    }
    render();
    updatePose(now);
    if (ptOn) ptPlace();
    // слово поворачивается вслед за каруселью, слабее, чем кольцо
    var YM = 3.5;
    yaw += (Math.max(-YM, Math.min(YM, -vel * 0.045)) - yaw) * (1 - Math.exp(-dt * 4));
    if (Math.abs(yaw - yawShown) > 0.01) { yawShown = yaw; wordEl.style.transform = 'rotateY(' + yaw.toFixed(2) + 'deg)'; }
    // герой ушёл с экрана: цикл встаёт, вернётся по IntersectionObserver ниже
    if (heroOn) raf = requestAnimationFrame(tick); else looping = false;
  }

  /* ---------- ввод ---------- */
  function cardAt(x, y) {
    if (overPortrait(x, y)) return null;
    var el = document.elementFromPoint(x, y);
    var a = el && el.closest && el.closest('.card');
    return a ? cards.find(function (c) { return c.el === a; }) : null;
  }
  var cap = hero.querySelector('#cap');
  var capT = 0;
  function showCap() {
    var c = hovered || selected;
    clearTimeout(capT);
    if (c) {
      cap.href = c.el.href; cap.querySelector('b').textContent = c.name; cap.querySelector('span').textContent = c.host;
      var right = c.ang >= 0; cap.classList.toggle('r', right); cap.classList.toggle('l', !right);
      cap.classList.add('show'); hero.classList.add('capon');
    } else capT = setTimeout(function () { cap.classList.remove('show'); hero.classList.remove('capon'); }, 260);
  }
  function setHover(c) {
    if (hovered === c) return;
    if (hovered && hovered !== selected) hovered.el.classList.remove('on');
    hovered = c;
    if (c) c.el.classList.add('on');
    hero.style.cursor = c ? 'pointer' : '';
    showCap();
  }
  function select(c) {
    if (selected && selected !== c) selected.el.classList.remove('on');
    selected = c;
    showCap();
    if (c) {
      c.el.classList.add('on');
      // ближайшая к центру сторона: карточку ставим рядом с плечом, чтобы было видно целиком
      var side = c.ang >= 0 ? 1 : -1;
      var want = side * STEP * (G.mob ? 1 : 1.5);
      target = rot + (want - c.ang);
    }
  }
  on(hero, 'pointerdown', function (e) {
    if (e.target.closest('.cta, .top, .cap')) return;
    dragging = true; moved = 0; lastX = e.clientX; lastT = performance.now(); samples = [];
    target = null; vel = 0;
    if (!hintDone) hintAt = 0;
    hero.setPointerCapture(e.pointerId);
  });
  on(hero, 'pointermove', function (e) {
    if (dragging) {
      var dx = e.clientX - lastX, now = performance.now();
      var degPerPx = G.mob ? 0.42 : 0.16;
      rot += dx * degPerPx;
      var dtm = Math.max(0.008, (now - lastT) / 1000);
      vel = vel * 0.75 + (dx * degPerPx / dtm) * 0.25;
      moved += Math.abs(dx);
      samples.push([now, dx * degPerPx]); while (samples.length && now - samples[0][0] > 90) samples.shift();
      lastX = e.clientX; lastT = now;
      if (moved > 6) { hero.classList.add('dragging'); setHover(null); }
    } else if (e.pointerType === 'mouse') {
      if (e.target.closest && e.target.closest('.cap')) return;
      setHover(cardAt(e.clientX, e.clientY));
    }
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false; hero.classList.remove('dragging');
    var span = samples.length ? (performance.now() - samples[0][0]) / 1000 : 1;
    var sum = samples.reduce(function (s, x) { return s + x[1]; }, 0);
    vel = reduce ? 0 : Math.max(-260, Math.min(260, span > 0 ? sum / Math.max(span, 0.016) : 0));
    if (moved > 6) { dragEndT = performance.now(); if (coarse) { swiped = true; if (!hintDone) hintAt = dragEndT + 3200; } }
    if (moved <= 6 && e.type === 'pointerup') {
      var c = cardAt(e.clientX, e.clientY);
      if (c) {
        if (e.pointerType === 'mouse' || selected === c) {
          window.open(c.el.href, '_blank', 'noopener');
          // цель Метрики: клик достался герою, а не ссылке, поэтому сообщаем сами (слушает components/v4/goals.tsx)
          hero.dispatchEvent(new CustomEvent('hero-open', { bubbles: true, detail: { host: c.host } }));
        }
        else { select(c); }
      } else if (selected) { select(null); }
    }
  }
  on(hero, 'pointerup', endDrag);
  on(hero, 'pointercancel', endDrag);
  on(hero, 'pointerleave', function (e) { if (e.pointerType === 'mouse' && !dragging) setHover(null); });
  // клики по ссылкам обрабатываем сами (иначе drag превращается в переход)
  on(ul, 'click', function (e) { if (e.detail !== 0) e.preventDefault(); });
  // клавиатура: фокус подводит карточку к плечу и показывает подпись
  on(ul, 'focusin', function (e) { var c = cards.find(function (x) { return x.el === e.target; }); if (c) select(c); });
  on(ul, 'focusout', function () { select(null); });

  /* ---------- смена первого слова ---------- */
  var swapT = 0, swapI = 0;
  if (!reduce) {
    var swap = function () { if (!document.hidden && heroOn) { wi = (wi + 1) % FIRST.length; buildWord(FIRST[wi], true); } };
    // первая смена скоро, пока человек ещё смотрит на заголовок: видно, что слово меняется
    swapT = setTimeout(function () { swap(); swapI = setInterval(swap, 3400); }, 1300);
  }

  var rz = 0;
  on(window, 'resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  document.fonts.load('900 120px ' + FAM, 'ДЕЛАЮ').then(function () { layout('font'); });
  // подписи меряются шрифтом Montserrat: пересчёт, когда догрузятся все шрифты
  document.fonts.ready.then(function () { layout('font'); });
  layout();
  raf = requestAnimationFrame(tick);
  // цикл кадров и смена слова живут, только пока герой в кадре
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) {
      heroOn = es[es.length - 1].isIntersecting;
      if (heroOn && !looping && !dead) { looping = true; prev = performance.now(); raf = requestAnimationFrame(tick); }
    });
    io.observe(hero);
  }

  /* ---------- очистка: всё снято, разметка как с сервера ---------- */
  return function destroy() {
    dead = true;
    cancelAnimationFrame(raf);
    clearTimeout(swapT); clearInterval(swapI); clearTimeout(capT); clearTimeout(rz);
    if (idle) (window.cancelIdleCallback || clearTimeout)(idle);
    if (io) io.disconnect();
    offs.forEach(function (f) { f(); }); offs = [];
    ptAnim.forEach(function (a) { a.cancel(); }); ptAnim = [];
    wordEl.textContent = ''; wordEl.removeAttribute('style');
    cards.forEach(function (c) {
      c.el.removeAttribute('style'); c.el.classList.remove('on');
      c.fog.removeAttribute('style'); c.soft.removeAttribute('style');
    });
    poseImgs.forEach(function (im) { im.removeAttribute('style'); });
    hero.classList.remove('hint', 'capon', 'dragging');
    hero.removeAttribute('data-pose');
    hero.style.cursor = '';
    cap.classList.remove('show', 'l', 'r');
    ptSvg.classList.remove('on');
  };
}
