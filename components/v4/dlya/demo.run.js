/* Мини-механики ниш (разметка: demo.tsx). Одна на страницу, работает мышью, пальцем и с клавиатуры.
   Сама показывает себя один раз, когда рамка доходит до экрана, если человек ещё ничего не трогал.
   Движение только transform и opacity. prefers-reduced-motion: сразу финальное состояние, без анимации.
   Возвращает полную очистку: обработчики, таймеры, кадры, наблюдатели. */

var fmt = function (n) { return n.toFixed(1).replace('.', ','); };

export function runDemo(root) {
  var k = root.getAttribute('data-k');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dead = false, offs = [], timers = [], autos = [], rafs = [];
  var ctx = {
    root: root,
    reduce: reduce,
    touched: false,
    vis: false,
    $: function (s) { return root.querySelector(s); },
    $$: function (s) { return [].slice.call(root.querySelectorAll(s)); },
    on: function (t, type, fn, opt) { t.addEventListener(type, fn, opt); offs.push(function () { t.removeEventListener(type, fn, opt); }); },
    later: function (fn, ms) { var id = setTimeout(function () { if (!dead) fn(); }, reduce ? 0 : ms); timers.push(id); return id; },
    // шаги самопоказа: отменяются, как только человек тронул механику
    auto: function (fn, ms) { if (ctx.touched) return; var id = setTimeout(function () { if (!dead && !ctx.touched) fn(); }, reduce ? 0 : ms); autos.push(id); },
    frame: function (fn) { var id = requestAnimationFrame(function (t) { if (!dead) fn(t); }); rafs.push(id); return id; },
    clear: function () { timers.forEach(clearTimeout); timers = []; },
    // подскок на 3px при смене кадра, как у поз героя
    hop: function (el) { if (!reduce && el.animate) el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 210, easing: 'cubic-bezier(.3,.7,.4,1)' }); },
    // группа кнопок-радио: aria-checked и колбэк со значением
    radios: function (g, fn) {
      var bs = [].slice.call(g.querySelectorAll('[role=radio]'));
      bs.forEach(function (b) {
        ctx.on(b, 'click', function () {
          if (b.disabled) return;
          bs.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
          fn(b.getAttribute('data-v'), b);
        });
      });
      return bs;
    },
  };
  var touch = function () {
    if (ctx.touched) return;
    ctx.touched = true;
    autos.forEach(clearTimeout); autos = [];
    if (api.stopAuto) api.stopAuto();
  };
  ctx.on(root, 'pointerdown', touch);
  ctx.on(root, 'keydown', touch);

  var api = (KINDS[k] || function () { return {}; })(ctx) || {};
  root.classList.add('dd-js');

  // самопоказ один раз при входе в кадр; is-vis для циклов; is-on (цвет) у середины экрана
  var played = false, io = null, io2 = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        ctx.vis = e.isIntersecting;
        if (api.vis) api.vis(ctx.vis);
        if (ctx.vis && e.intersectionRatio >= 0.45 && !played) { played = true; if (api.auto) api.auto(); }
      });
    }, { threshold: [0, 0.45] });
    io.observe(root);
    io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { root.classList.toggle('is-on', e.isIntersecting); });
    }, { rootMargin: '-28% 0px -28% 0px' });
    io2.observe(root);
  } else { ctx.vis = true; if (api.vis) api.vis(true); }

  return function destroy() {
    dead = true;
    offs.forEach(function (f) { f(); });
    timers.forEach(clearTimeout); autos.forEach(clearTimeout); rafs.forEach(cancelAnimationFrame);
    if (io) io.disconnect();
    if (io2) io2.disconnect();
    if (api.destroy) api.destroy();
    root.classList.remove('dd-js', 'is-on');
  };
}

var KINDS = {
  /* производство: чертёж в поле заявки. Тянуть пальцем или мышью; тап или Enter тоже прикрепляют */
  file: function (c) {
    var sheet = c.$('.dd-sheet'), drop = c.$('.dd-drop'), send = c.$('.dd-send'), done = c.$('.dd-done'), again = c.$('.dd-again');
    var x = 0, y = 0, drag = null, attached = false;
    function setT(sc) { sheet.style.transform = 'translate(' + x + 'px,' + y + 'px)' + (sc ? ' scale(' + sc + ')' : ''); }
    function attach() {
      if (attached) return;
      attached = true;
      var a = sheet.getBoundingClientRect(), b = drop.getBoundingClientRect();
      x += b.left + b.width / 2 - (a.left + a.width / 2);
      y += b.top + b.height / 2 - (a.top + a.height / 2);
      sheet.classList.add('is-fly', 'is-in');
      setT(0.22);
      sheet.tabIndex = -1;
      drop.classList.add('is-full');
      send.disabled = false;
    }
    function inside() {
      var a = sheet.getBoundingClientRect(), b = drop.getBoundingClientRect();
      var cx = a.left + a.width / 2, cy = a.top + a.height / 2;
      return cx > b.left - 24 && cx < b.right + 24 && cy > b.top - 24 && cy < b.bottom + 24;
    }
    c.on(sheet, 'pointerdown', function (e) {
      if (attached) return;
      drag = { id: e.pointerId, sx: e.clientX - x, sy: e.clientY - y, x0: e.clientX, y0: e.clientY, moved: false };
      sheet.setPointerCapture(e.pointerId);
      sheet.classList.remove('is-fly');
      sheet.classList.add('is-drag');
    });
    c.on(sheet, 'pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) > 5) drag.moved = true;
      x = e.clientX - drag.sx; y = e.clientY - drag.sy;
      setT();
      drop.classList.toggle('is-near', inside());
    });
    function up(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var moved = drag.moved;
      drag = null;
      sheet.classList.remove('is-drag');
      drop.classList.remove('is-near');
      if (!moved || inside()) { attach(); return; }
      sheet.classList.add('is-fly');
      x = 0; y = 0; setT();
    }
    c.on(sheet, 'pointerup', up);
    c.on(sheet, 'pointercancel', up);
    // клавиатура: click без указателя
    c.on(sheet, 'click', function (e) { if (e.detail === 0) attach(); });
    c.on(send, 'click', function () {
      send.disabled = true;
      send.textContent = 'Отправлено';
      done.textContent = 'Заявка у менеджера вместе с чертежом, искать письмо в почте не нужно';
      again.hidden = false;
    });
    c.on(again, 'click', function () {
      attached = false;
      sheet.classList.add('is-fly');
      sheet.classList.remove('is-in');
      x = 0; y = 0; setT();
      sheet.tabIndex = 0;
      drop.classList.remove('is-full');
      send.disabled = true;
      send.textContent = 'Отправить';
      done.textContent = '';
      again.hidden = true;
      sheet.focus({ preventScroll: true });
    });
    return {
      auto: function () {
        c.auto(function () { sheet.classList.add('is-hint'); }, 500);
        c.auto(function () { sheet.classList.remove('is-hint'); attach(); }, 1500);
        c.auto(function () { send.click(); }, 2700);
      },
    };
  },

  /* перевозки: куда, что везём, машина меняется; отправка ведёт машину по маршруту */
  route: function (c) {
    var truck = c.$('.dd-truck'), city = c.$('.dd-city'), send = c.$('.dd-send'), done = c.$('.dd-done');
    var svgs = c.$$('.dd-truck svg'), names = {}, cargo = 'box', anim = null, sent = false;
    c.$$('[data-g=cargo] [role=radio]').forEach(function (b) { names[b.getAttribute('data-v')] = b.textContent.toLowerCase(); });
    function reset() {
      if (anim) { anim.cancel(); anim = null; }
      sent = false;
      send.textContent = 'Отправить заявку';
      done.textContent = '';
    }
    c.radios(c.$('[data-g=city]'), function (v) { reset(); city.textContent = v; c.hop(city); });
    c.radios(c.$('[data-g=cargo]'), function (v) {
      reset();
      cargo = v;
      svgs.forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-t') === v); });
      c.hop(truck);
    });
    c.on(send, 'click', function () {
      if (sent) { reset(); return; }
      sent = true;
      var road = c.$('.dd-road'), d = road.clientWidth - truck.offsetWidth - truck.offsetLeft * 2;
      if (truck.animate) {
        anim = truck.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + d + 'px)' }],
          { duration: c.reduce ? 0 : 1500, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' });
      }
      done.textContent = 'Заявка ушла в почту и Telegram: ваш склад, ' + city.textContent + ', ' + names[cargo];
      send.textContent = 'Новая заявка';
    });
    return {
      auto: function () {
        c.auto(function () { c.$('[data-g=cargo] [data-v=pal]').click(); }, 700);
        c.auto(function () { send.click(); }, 1700);
      },
      destroy: function () { if (anim) anim.cancel(); },
    };
  },

  /* кафе: стол и время в два тапа, занятые столы на выбранное время недоступны */
  table: function (c) {
    var tbs = c.$$('.dd-tb'), done = c.$('.dd-done'), again = c.$('.dd-again'), hint = done.textContent;
    var tb = null, time = null, busy = [];
    function upd() {
      tbs.forEach(function (b) {
        var n = +b.getAttribute('data-n'), isB = busy.indexOf(n) >= 0;
        b.disabled = isB;
        b.classList.toggle('is-busy', isB);
        b.setAttribute('aria-pressed', b === tb ? 'true' : 'false');
        b.setAttribute('aria-label', 'Стол ' + n + ', мест: ' + b.style.getPropertyValue('--s') + (isB ? ', занят' : ''));
      });
      if (tb && time) {
        done.textContent = 'Стол ' + tb.getAttribute('data-n') + ' на ' + tb.style.getPropertyValue('--s') + ', сегодня в ' + time + '. Остался телефон, и заявка у администратора в Telegram';
        again.hidden = false;
      } else done.textContent = tb ? 'Теперь время' : time ? 'Теперь стол' : hint;
    }
    tbs.forEach(function (b) {
      c.on(b, 'click', function () { if (b.disabled) return; tb = tb === b ? null : b; c.hop(b); upd(); });
    });
    var times = c.radios(c.$('[data-g=time]'), function (v, b) {
      time = v;
      busy = (b.getAttribute('data-busy') || '').split(',').filter(Boolean).map(Number);
      if (tb && busy.indexOf(+tb.getAttribute('data-n')) >= 0) tb = null;
      upd();
    });
    c.on(again, 'click', function () {
      tb = null; time = null; busy = [];
      times.forEach(function (x) { x.setAttribute('aria-checked', 'false'); });
      again.hidden = true;
      upd();
    });
    return {
      auto: function () {
        c.auto(function () { c.$('[data-g=time] [data-v="19:00"]').click(); }, 700);
        c.auto(function () { c.$('.dd-tb[data-n="4"]').click(); }, 1700);
      },
    };
  },

  /* окна: длинный мобильный экран сам едет вниз, закреплённая кнопка замера стоит на месте.
     Мышью можно тянуть и крутить колесом, пальцем тап ставит на паузу (вертикальный жест листает страницу). */
  measure: function (c) {
    var scr = c.$('.dd-scr'), img = c.$('.dd-long');
    var y = 0, last = 0, hold = 0, paused = false, drag = null, raf = 0, idle = 0;
    function max() { return Math.max(0, img.offsetHeight - scr.clientHeight); }
    function set() { y = Math.max(0, Math.min(max(), y)); img.style.transform = 'translateY(' + (-y).toFixed(1) + 'px)'; }
    function tick(t) {
      raf = 0;
      if (!c.vis || c.reduce) return;
      var dt = last ? Math.min(64, t - last) : 16;
      last = t;
      if (!paused && !drag && t > idle) {
        if (y >= max() - 0.5) {
          if (!hold) hold = t + 1400;
          else if (t > hold) { hold = 0; y = 0; scr.classList.add('is-jump'); c.later(function () { scr.classList.remove('is-jump'); }, 260); }
        } else y += dt * 0.05 * (scr.clientWidth / 240);
        set();
      }
      raf = c.frame(tick);
    }
    function go() { if (!raf && c.vis && !c.reduce) { last = 0; raf = c.frame(tick); } }
    var fine = matchMedia('(hover: hover) and (pointer: fine)');
    c.on(scr, 'pointerdown', function (e) {
      if (e.pointerType === 'mouse' && fine.matches) {
        drag = { id: e.pointerId, y0: e.clientY, s: y };
        scr.setPointerCapture(e.pointerId);
        scr.classList.add('is-drag');
      }
    });
    c.on(scr, 'pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      y = drag.s - (e.clientY - drag.y0) * 1.6;
      set();
    });
    function up(e) { if (drag && e.pointerId === drag.id) { drag = null; scr.classList.remove('is-drag'); idle = performance.now() + 2200; } }
    c.on(scr, 'pointerup', up);
    c.on(scr, 'pointercancel', up);
    c.on(scr, 'click', function (e) {
      if (e.pointerType !== 'mouse') { paused = !paused; scr.classList.toggle('is-paused', paused); }
    });
    c.on(scr, 'wheel', function (e) {
      var m = max();
      if ((e.deltaY > 0 && y >= m) || (e.deltaY < 0 && y <= 0)) return;
      e.preventDefault();
      y += e.deltaY; set();
      idle = performance.now() + 2200;
    }, { passive: false });
    c.on(scr, 'keydown', function (e) {
      var d = { ArrowDown: 60, ArrowUp: -60, PageDown: 300, PageUp: -300, Home: -1e5, End: 1e5 }[e.key];
      if (d === undefined) return;
      e.preventDefault(); y += d; set(); idle = performance.now() + 3000;
    });
    c.on(window, 'resize', set);
    return { vis: function (v) { if (v) go(); }, destroy: function () { if (raf) cancelAnimationFrame(raf); } };
  },

  /* салон: услуга, мастер, день, время. Пройденный шаг можно открыть снова */
  book: function (c) {
    var box = c.$('.dd-book'), data = JSON.parse(box.getAttribute('data-book'));
    var steps = c.$$('.dd-step'), pane = c.$('.dd-pane'), done = c.$('.dd-done'), again = c.$('.dd-again');
    var NAMES = ['Услуга', 'Мастер', 'День', 'Время'], LBL = ['Выберите услугу', 'Выберите мастера', 'Выберите день', 'Выберите время'];
    var picks = [], step = 0;
    function svc() { return data.services.filter(function (s) { return s.v === picks[0]; })[0]; }
    function opts() {
      if (step === 0) return data.services.map(function (s) { return { v: s.v, t: s.t }; });
      if (step === 1) return [{ v: svc().m, t: 'мастер' }, { v: 'Любой свободный', t: '' }];
      if (step === 2) return data.days.map(function (d) { return { v: d, t: '' }; });
      var di = data.days.indexOf(picks[2]), si = data.services.indexOf(svc());
      return data.times.map(function (t, i) { return { v: t, t: '', busy: (di * 3 + i + si) % 3 === 0 }; });
    }
    function render() {
      steps.forEach(function (b, i) {
        b.disabled = i > picks.length;
        b.parentNode.classList.toggle('is-done', i < picks.length);
        b.parentNode.classList.toggle('is-cur', i === step && step < 4);
        b.querySelector('.dd-step-v').textContent = picks[i] || NAMES[i];
      });
      pane.textContent = '';
      if (step >= 4) {
        pane.hidden = true;
        done.textContent = 'Заявка у администратора в Telegram: ' + picks[0].toLowerCase() + ', ' + (picks[1] === svc().m ? 'мастер ' + picks[1] : 'любой свободный мастер') + ', ' + picks[2].toLowerCase() + ' в ' + picks[3] + '. Подтвердят за 15 минут, предоплаты нет';
        again.hidden = false;
        return;
      }
      pane.hidden = false;
      done.textContent = '';
      pane.setAttribute('aria-label', LBL[step]);
      pane.classList.toggle('dd-pane--times', step === 3);
      opts().forEach(function (o) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'dd-opt';
        b.textContent = o.v;
        if (o.t) { var s = document.createElement('span'); s.textContent = o.t; b.appendChild(s); }
        if (o.busy) { b.disabled = true; b.classList.add('is-busy'); b.setAttribute('aria-label', o.v + ', занято'); }
        b.addEventListener('click', function () { pick(o.v); });
        pane.appendChild(b);
      });
      c.hop(pane);
    }
    function pick(v) {
      picks = picks.slice(0, step); picks[step] = v; step++;
      render();
      var f = pane.querySelector('.dd-opt:not(:disabled)');
      if (f && root().contains(document.activeElement)) f.focus({ preventScroll: true });
    }
    function root() { return c.root; }
    steps.forEach(function (b, i) {
      c.on(b, 'click', function () { if (i <= picks.length) { step = i; picks = picks.slice(0, i); render(); } });
    });
    c.on(again, 'click', function () { picks = []; step = 0; again.hidden = true; render(); });
    // без скрипта в разметке уже стоят кнопки услуг; со скриптом они живые
    render();
    return {
      auto: function () {
        c.auto(function () { pick(data.services[0].v); }, 600);
        c.auto(function () { pick(data.services[0].m); }, 1400);
        c.auto(function () { pick(data.days[1]); }, 2200);
        c.auto(function () { var f = pane.querySelector('.dd-opt:not(:disabled)'); if (f) f.click(); }, 3000);
      },
    };
  },

  /* доставка: фраза печатается, бот собирает черновик, статусы приходят по одному, кухня видит заказ */
  chat: function (c) {
    var w = c.$('.dd-chatw'), msgs = c.$('.dd-msgs'), typed = c.$('.dd-typed'), kit = c.$('.dd-kitchen'), again = c.$('.dd-again');
    var phrase = w.getAttribute('data-phrase'), check = c.$('.dd-m--check').cloneNode(true), sts = w.getAttribute('data-st').split('|');
    check.classList.remove('dd-m--static');
    if (c.reduce) { kit.classList.add('is-hot'); return {}; }
    var playing = false;
    function add(el) { msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight; requestAnimationFrame(function () { el.classList.add('is-in'); }); return el; }
    function bubble(cls, text) { var p = document.createElement('p'); p.className = 'dd-m ' + cls; p.textContent = text; return p; }
    function play() {
      if (playing) return;
      playing = true;
      c.clear();
      msgs.textContent = '';
      kit.classList.remove('is-hot');
      again.hidden = true;
      typed.textContent = '';
      w.classList.add('is-typing');
      var t = 300;
      for (var i = 1; i <= phrase.length; i++) (function (i) { c.later(function () { typed.textContent = phrase.slice(0, i); }, t + i * 34); })(i);
      t += phrase.length * 34 + 450;
      c.later(function () { w.classList.remove('is-typing'); typed.textContent = ''; add(bubble('dd-m--me', phrase)); }, t);
      var dots;
      c.later(function () { dots = add(bubble('dd-m--bot dd-m--dots', '')); for (var j = 0; j < 3; j++) dots.appendChild(document.createElement('i')); }, t += 350);
      c.later(function () { dots.remove(); add(check.cloneNode(true)); }, t += 1100);
      sts.forEach(function (s, j) {
        c.later(function () { add(bubble('dd-m--bot dd-m--st', s)); if (j === 0) kit.classList.add('is-hot'); }, t += j === 0 ? 900 : 1300);
      });
      c.later(function () { playing = false; again.hidden = false; }, t + 300);
    }
    c.on(again, 'click', play);
    return { auto: function () { play(); }, stopAuto: function () {} };
  },

  /* ремонт: тянем угол комнаты, плитка раскладывается, считаются целые и подрезанные */
  tile: function (c) {
    var plan = c.$('.dd-plan'), floor = c.$('.dd-floor'), hd = c.$('.dd-handle');
    var cutR = c.$('.dd-cut-r'), cutB = c.$('.dd-cut-b'), dW = c.$('.dd-dim-w'), dH = c.$('.dd-dim-h');
    var out = {}; c.$$('[data-o]').forEach(function (o) { out[o.getAttribute('data-o')] = o; });
    var W = 3.2, H = 2.5, tw = 0.3, th = 0.6, MAXW = 6, MAXH = 4, drag = null, raf = 0;
    var e = 1e-9;
    function calc() {
      var k = plan.clientWidth / MAXW;
      plan.style.height = (MAXH * k) + 'px';
      floor.style.width = (W * k) + 'px';
      floor.style.height = (H * k) + 'px';
      floor.style.backgroundSize = (tw * k) + 'px ' + (th * k) + 'px';
      var fc = Math.floor(W / tw + e), fr = Math.floor(H / th + e);
      var cols = Math.ceil(W / tw - e), rows = Math.ceil(H / th - e);
      var rw = W - fc * tw, rh = H - fr * th;
      cutR.style.width = (rw > e ? rw * k : 0) + 'px';
      cutB.style.height = (rh > e ? rh * k : 0) + 'px';
      dW.textContent = fmt(W) + ' м';
      dH.textContent = fmt(H) + ' м';
      var area = W * H, total = cols * rows, full = fc * fr;
      out.area.textContent = fmt(area) + ' м²';
      out.naive.textContent = Math.ceil(area / (tw * th) - e) + ' шт';
      out.real.firstChild.textContent = total + ' шт';
      out.note.textContent = total === full
        ? 'Комната делится на плитку ровно, подрезки нет'
        : full + ' целых и ' + (total - full) + ' с подрезкой: края комнаты не делятся на плитку ровно';
      hd.setAttribute('aria-label', 'Комната ' + fmt(W) + ' на ' + fmt(H) + ' м: тяните угол или меняйте стрелками');
    }
    function setWH(w, h) {
      W = Math.round(Math.max(1.2, Math.min(MAXW, w)) * 10) / 10;
      H = Math.round(Math.max(1, Math.min(MAXH, h)) * 10) / 10;
      calc();
    }
    c.on(hd, 'pointerdown', function (ev) { drag = ev.pointerId; hd.setPointerCapture(ev.pointerId); hd.classList.add('is-drag'); });
    c.on(hd, 'pointermove', function (ev) {
      if (drag !== ev.pointerId) return;
      var r = floor.getBoundingClientRect(), k = plan.clientWidth / MAXW;
      setWH((ev.clientX - r.left) / k, (ev.clientY - r.top) / k);
    });
    function up(ev) { if (drag === ev.pointerId) { drag = null; hd.classList.remove('is-drag'); } }
    c.on(hd, 'pointerup', up);
    c.on(hd, 'pointercancel', up);
    c.on(hd, 'keydown', function (ev) {
      var s = ev.shiftKey ? 0.5 : 0.1, m = { ArrowRight: [s, 0], ArrowLeft: [-s, 0], ArrowDown: [0, s], ArrowUp: [0, -s] }[ev.key];
      if (!m) return;
      ev.preventDefault(); setWH(W + m[0], H + m[1]);
    });
    c.radios(c.$('[data-g=tile]'), function (v) {
      var p = v.split('×'); tw = +p[0] / 100; th = +p[1] / 100; calc(); c.hop(floor);
    });
    c.on(window, 'resize', calc);
    calc();
    return {
      auto: function () {
        if (c.reduce) return;
        var t0 = 0, from = [2, 1.6], to = [W, H];
        setWH(from[0], from[1]);
        function step(t) {
          if (c.touched) return;
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1400), q = 1 - Math.pow(1 - p, 3);
          setWH(from[0] + (to[0] - from[0]) * q, from[1] + (to[1] - from[1]) * q);
          if (p < 1) raf = c.frame(step);
        }
        raf = c.frame(step);
      },
    };
  },

  /* мебель: фильтр по типу (плитки переезжают на новые места) и кадр на всю рамку */
  gallery: function (c) {
    var grid = c.$('.dd-grid'), items = c.$$('.dd-grid li'), big = c.$('.dd-big'), bimg = big.querySelector('img'), cap = big.querySelector('.dd-big-cap'), x = big.querySelector('.dd-big-x');
    var open = null, anim = null;
    function flip(fn) {
      var vis = items.filter(function (li) { return !li.hidden; }), first = new Map();
      vis.forEach(function (li) { first.set(li, li.getBoundingClientRect()); });
      fn();
      items.forEach(function (li) {
        if (li.hidden || c.reduce || !li.animate) return;
        var a = first.get(li), b = li.getBoundingClientRect();
        if (a) li.animate([{ transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)' }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
        else li.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
      });
    }
    c.radios(c.$('[data-g=gal]'), function (v) {
      close(true);
      flip(function () { items.forEach(function (li) { var t = li.getAttribute('data-t'); li.hidden = !(v === 'all' || t === v || t === 'more'); }); });
    });
    function rectOf(th) {
      var g = big.getBoundingClientRect(), r = th.getBoundingClientRect();
      return 'translate(' + (r.left - g.left) + 'px,' + (r.top - g.top) + 'px) scale(' + (r.width / g.width) + ',' + (r.height / g.height) + ')';
    }
    function show(th) {
      open = th;
      bimg.src = th.querySelector('img').currentSrc || th.querySelector('img').src;
      bimg.alt = th.getAttribute('data-cap');
      cap.textContent = th.getAttribute('data-cap');
      big.hidden = false;
      if (anim) anim.cancel();
      if (!c.reduce && big.animate) anim = big.animate([{ transform: rectOf(th), borderRadius: '10px' }, { transform: 'none', borderRadius: '14px' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
      if (c.touched) x.focus({ preventScroll: true });
    }
    function close(now) {
      if (!open) return;
      var th = open; open = null;
      if (anim) anim.cancel();
      if (now || c.reduce || !big.animate) { big.hidden = true; return; }
      anim = big.animate([{ transform: 'none' }, { transform: rectOf(th) }], { duration: 320, easing: 'cubic-bezier(.4,0,.2,1)' });
      anim.onfinish = function () { big.hidden = true; anim = null; };
      if (root().contains(document.activeElement)) th.focus({ preventScroll: true });
    }
    function root() { return c.root; }
    c.$$('button.dd-th').forEach(function (th) { c.on(th, 'click', function () { show(th); }); });
    c.on(x, 'click', function () { close(); });
    c.on(bimg, 'click', function () { close(); });
    c.on(c.root, 'keydown', function (e) { if (e.key === 'Escape' && open) close(); });
    grid.setAttribute('data-ok', '1');
    return {
      auto: function () {
        c.auto(function () { var t = c.$('.dd-grid li:nth-child(3) .dd-th'); if (t) show(t); }, 900);
        c.auto(function () { close(); }, 3200);
      },
      destroy: function () { if (anim) anim.cancel(); },
    };
  },

  /* одежда: обхват груди подбирает российский размер (половина обхвата), "маломерит" сдвигает на размер вверх */
  size: function (c) {
    var range = c.$('input[type=range]'), outp = c.$('output'), chk = c.$('input[type=checkbox]'), tee = c.$('.dd-tee'), tag = c.$('.dd-tee-tag'), done = c.$('.dd-done');
    var chips = c.$$('[data-g=size] [role=radio]'), girth = c.$('.dd-girth'), raf = 0, lastI = -1;
    function idxFor(g) {
      for (var i = 0; i < chips.length; i++) if (+chips[i].getAttribute('data-v') * 2 >= g) return i;
      return chips.length - 1;
    }
    function upd() {
      var g = +range.value, base = idxFor(g), i = Math.min(chips.length - 1, base + (chk.checked ? 1 : 0));
      var b = chips[i], r = b.getAttribute('data-v'), l = b.textContent.replace(r, '');
      chips.forEach(function (x, j) { x.setAttribute('aria-checked', j === i ? 'true' : 'false'); });
      outp.textContent = g + ' см';
      tee.style.transform = 'scale(' + (0.78 + i * 0.05).toFixed(2) + ')';
      tag.textContent = r + ' · ' + l;
      var t = g + ' см: размер ' + chips[base].getAttribute('data-v') + ' (' + chips[base].textContent.replace(chips[base].getAttribute('data-v'), '') + ').';
      done.textContent = chk.checked && i !== base
        ? t + ' Модель маломерит, поэтому советуем ' + r + ' (' + l + ')'
        : t + ' Российский размер это половина обхвата груди';
      if (i !== lastI) { lastI = i; girth.classList.remove('is-ping'); void girth.getBoundingClientRect(); girth.classList.add('is-ping'); }
    }
    c.on(range, 'input', upd);
    c.on(chk, 'change', upd);
    chips.forEach(function (b) {
      c.on(b, 'click', function () { range.value = String(+b.getAttribute('data-v') * 2 - (chk.checked ? 4 : 0)); upd(); });
    });
    upd();
    return {
      auto: function () {
        if (c.reduce) return;
        var t0 = 0;
        function step(t) {
          if (c.touched) return;
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1800), q = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          range.value = String(Math.round(86 + (100 - 86) * q)); upd();
          if (p < 1) raf = c.frame(step);
        }
        raf = c.frame(step);
      },
    };
  },
};
