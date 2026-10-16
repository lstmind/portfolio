/* Механики услуг (components/v4/uslugi/Demos.tsx). Ванильный код на готовой разметке, каждая функция чистит за собой.
   Ход механики: на десктопе по пунктам списка "Что входит" рядом (механика липнет слева), на телефоне сама при входе в кадр.
   prefers-reduced-motion: сразу финальный кадр. Двигаются только transform и opacity. */

var $ = function (s, r) { return r.querySelector(s); };
var $$ = function (s, r) { return [].slice.call(r.querySelectorAll(s)); };

/** помощники одной механики: обработчики, таймеры и наблюдатели снимаются разом */
function kit(el) {
  var offs = [], timers = [];
  var K = {
    reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
    re: $('[data-re]', el),
    add: function (f) { offs.push(f); },
    on: function (t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(function () { t.removeEventListener(ev, fn, o); }); },
    at: function (ms, fn) { timers.push(setTimeout(fn, ms)); },
    clear: function () { timers.forEach(clearTimeout); timers = []; },
    /** текст узла вернётся как был: разметку рисовал React */
    keep: function () { [].forEach.call(arguments, function (n) { if (!n) return; var t = n.textContent; offs.push(function () { n.textContent = t; }); }); },
    /** один раз, когда механика почти целиком в кадре */
    seen: function (fn) {
      if (!('IntersectionObserver' in window)) { fn(); return; }
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); fn(); }
      }, { threshold: 0.45 });
      io.observe(el);
      offs.push(function () { io.disconnect(); });
    },
    off: function () { K.clear(); offs.forEach(function (f) { f(); }); offs = []; }
  };
  return K;
}

/**
 * Шаги механики 0..n. Десктоп: шаг по тому, сколько пунктов списка блока прошло 60% высоты экрана.
 * Телефон или нет списка: при входе в кадр шаги идут сами. Кнопка повтора проигрывает заново.
 */
function stepper(el, K, n, apply, opt) {
  opt = opt || {};
  var cur = -1, auto = 0, mode = 'auto';
  function set(x) { x = Math.max(0, Math.min(n, x)); if (x === cur) return; cur = x; apply(x); }
  function stop() { clearInterval(auto); auto = 0; }
  function play(from) {
    stop(); mode = 'auto'; set(from || 0);
    auto = setInterval(function () { if (cur >= n) { stop(); return; } set(cur + 1); }, opt.ms || 650);
  }
  K.add(stop);
  var api = { set: function (x) { stop(); mode = 'manual'; set(x); }, get: function () { return cur; }, play: play };
  if (K.reduce) { set(n); return api; }
  var block = el.closest('.u-block');
  var items = block ? $$('.u-body li', block) : [];
  var desk = matchMedia('(min-width: 700px)');
  mode = desk.matches && items.length > 2 ? 'scroll' : 'auto';
  var rq = 0;
  function byScroll() {
    rq = 0;
    if (mode !== 'scroll') return;
    var y = innerHeight * 0.6, c = 0;
    items.forEach(function (li) { if (li.getBoundingClientRect().top < y) c++; });
    set(Math.round((c * n) / items.length));
  }
  set(0);
  if (items.length > 2) K.on(window, 'scroll', function () { if (!rq) rq = requestAnimationFrame(byScroll); }, { passive: true });
  K.add(function () { cancelAnimationFrame(rq); });
  K.seen(function () { if (mode === 'scroll') byScroll(); else play(0); });
  if (K.re && opt.re !== false) K.on(K.re, 'click', function () { play(0); });
  return api;
}

/** подскок на 3px, как смена позы в герое */
function hop(node) {
  if (node.animate) node.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
}

var KINDS = {
  fix: function (el, K) {
    var strips = $$('.u-fix-s', el), box = $('.u-fix', el);
    stepper(el, K, strips.length, function (k) {
      strips.forEach(function (s, i) { s.classList.toggle('ok', i < k); });
      box.classList.toggle('done', k >= strips.length);
    }, { ms: 420 });
  },

  speed: function (el, K) {
    var lh = $('.u-sp-lh', el);
    function run() { el.classList.remove('run'); void el.offsetWidth; el.classList.add('run'); }
    if (K.reduce) { if (lh) lh.classList.add('on'); return; }
    K.seen(function () { run(); if (lh) lh.classList.add('on'); });
    if (K.re) K.on(K.re, 'click', run);
  },

  serp: function (el, K) {
    var items = $$('.u-sn', el), you = $('.u-sn--you', el), steps = $$('.u-serp-steps li', el), base = +you.getAttribute('data-base');
    stepper(el, K, steps.length, function (k) {
      var p = base - k;
      items.forEach(function (it) {
        var b = +it.getAttribute('data-base');
        it.style.setProperty('--pos', it === you ? p : b < base && b >= p ? b + 1 : b);
      });
      you.classList.toggle('rich', k >= 3);
      steps.forEach(function (s, i) { s.classList.toggle('ok', i < k); });
    }, { ms: 900 });
  },

  chat: function (el, K) {
    var me = $('.u-msg--me', el), t = $('.u-msg-t', me), txt = me.getAttribute('data-type'), dots = $('.u-msg--dots', el);
    var rest = $$('.u-msg--bot', el);
    K.keep(t);
    function show(all) { [me].concat(rest).forEach(function (m) { m.classList.toggle('in', all); }); }
    if (K.reduce) { show(true); return; }
    function play() {
      K.clear(); show(false); dots.classList.remove('in');
      t.textContent = ''; me.classList.add('in', 'typing');
      var T = 300;
      for (var i = 1; i <= txt.length; i++) (function (i) { K.at(T + i * 38, function () { t.textContent = txt.slice(0, i); }); })(i);
      T += txt.length * 38 + 350;
      K.at(T, function () { me.classList.remove('typing'); dots.classList.add('in'); });
      T += 1000;
      rest.forEach(function (m, i) {
        K.at(T + i * 1200, function () { dots.classList.remove('in'); m.classList.add('in'); if (i && i < rest.length - 1) K.at(500, function () { dots.classList.add('in'); }); });
      });
    }
    show(true);
    K.seen(play);
    if (K.re) K.on(K.re, 'click', play);
    K.on($('.u-chat', el), 'click', play);
  },

  kanban: function (el, K) { runKanban($('.u-kb', el), K); },

  shop: function (el, K) {
    var shop = $('.u-shop', el), views = $$('.u-shop-v', el), btns = $$('.u-shop-line button', el), last = btns.length - 1;
    var st = stepper(el, K, last, function (k) {
      views.forEach(function (v, i) { v.classList.toggle('on', i === k); });
      btns.forEach(function (b, i) { b.classList.toggle('on', i <= k); if (i === k) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      shop.style.setProperty('--p', String(k / last));
      shop.classList.toggle('has-cart', k >= 2);
    }, { ms: 1100 });
    btns.forEach(function (b, i) { K.on(b, 'click', function () { st.set(i); hop($('.u-shop-scr', el)); }); });
  },

  layers: function (el, K) {
    var ls = $$('.u-lay-l', el), n = ls.length - 1;
    K.keep(K.re);
    var st = stepper(el, K, n, function (k) {
      ls.forEach(function (l, i) { l.classList.toggle('flat', i < k || k === n); });
      el.classList.toggle('built', k === n);
      if (K.re) K.re.textContent = k === n ? 'Разобрать' : 'Собрать';
    }, { ms: 700, re: false });
    if (K.re) K.on(K.re, 'click', function () { if (st.get() === n) st.set(0); else st.play(st.get()); });
  },

  move: function (el, K) {
    var mv = $('.u-mv', el), ck = $$('.u-mv-ck li', el);
    stepper(el, K, ck.length, function (k) {
      mv.style.setProperty('--p', String(k / ck.length));
      ck.forEach(function (c, i) { c.classList.toggle('ok', i < k); });
    }, { ms: 650 });
  },

  flow: function (el, K) {
    var map = $('.u-fl', el), dot = $('.u-fl-dot', el), nodes = $$('.u-fl-n', el), st = $('.u-fl-st', el), run = $('.u-fl-run', el);
    var P = [[20, 22.2], [80, 22.2], [80, 77.8], [20, 77.8]], anim = null, an2 = null;
    function done() { nodes.forEach(function (n) { n.classList.remove('hit'); n.classList.add('done'); }); st.classList.add('on'); dot.style.opacity = '0'; }
    if (K.reduce) { done(); run.style.strokeDashoffset = '0'; return; }
    function go() {
      K.clear(); if (anim) anim.cancel(); if (an2) an2.cancel();
      st.classList.remove('on'); nodes.forEach(function (n) { n.classList.remove('hit', 'done'); });
      var w = map.clientWidth, h = map.clientHeight, D = 2400;
      dot.style.opacity = '1';
      nodes[0].classList.add('hit');
      anim = dot.animate(P.map(function (p, i) { return { transform: 'translate(' + (p[0] * w) / 100 + 'px,' + (p[1] * h) / 100 + 'px)', offset: i / (P.length - 1) }; }), { duration: D, easing: 'linear', fill: 'forwards' });
      an2 = run.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: D, easing: 'linear', fill: 'forwards' });
      [1, 2, 3].forEach(function (i) { K.at((i * D) / 3, function () { nodes[i - 1].classList.remove('hit'); nodes[i - 1].classList.add('done'); nodes[i].classList.add('hit'); }); });
      K.at(D + 200, done);
    }
    K.seen(go);
    if (K.re) K.on(K.re, 'click', go);
    K.add(function () { if (anim) anim.cancel(); if (an2) an2.cancel(); });
  },

  parse: function (el, K) {
    var cmd = $('.u-pr-cmd', el), txt = cmd.getAttribute('data-type'), rows = $$('.u-pr-r', el), n = $('.u-pr-n b', el);
    K.keep(cmd, n);
    if (K.reduce) { rows.forEach(function (r) { r.classList.add('in'); }); return; }
    function go() {
      K.clear(); cmd.textContent = ''; n.textContent = '0';
      rows.forEach(function (r) { r.classList.remove('in'); });
      for (var i = 1; i <= txt.length; i++) (function (i) { K.at(i * 36, function () { cmd.textContent = txt.slice(0, i); }); })(i);
      var T = txt.length * 36 + 450;
      rows.forEach(function (r, i) { K.at(T + i * 240, function () { r.classList.add('in'); n.textContent = String(i + 1); }); });
    }
    rows.forEach(function (r) { r.classList.add('in'); });
    K.seen(go);
    if (K.re) K.on(K.re, 'click', go);
  },

  tree: function (el, K) {
    var ns = $$('.u-tr-n', el);
    stepper(el, K, ns.length, function (k) { ns.forEach(function (n, i) { var was = n.classList.contains('nw'); n.classList.toggle('nw', i < k); if (!was && i < k) hop($('.u-tr-th', n)); }); }, { ms: 800 });
  },

  month: function (el, K) {
    var ds = $$('.u-mo li', el);
    stepper(el, K, ds.length, function (k) { ds.forEach(function (d, i) { d.classList.toggle('in', i < k); d.classList.toggle('now', i === k - 1 && k < ds.length); }); }, { ms: 95 });
  },

  build: function (el, K) {
    var bd = $('.u-bd', el), lis = $$('.u-steps-mini li', el), n = lis.length;
    stepper(el, K, n, function (k) {
      for (var i = 1; i <= n; i++) bd.classList.toggle('s' + i, i <= k);
      lis.forEach(function (l, i) { l.classList.toggle('ok', i < k); });
    }, { ms: 850 });
  },

  fan: function (el, K) {
    var fan = $('.u-fan', el), cs = $$('.u-fan-c', el), host = $('.u-fan-host', el);
    K.keep(host);
    function top(c) { cs.forEach(function (x) { x.classList.toggle('top', x === c); }); if (host) host.textContent = c.getAttribute('data-host'); }
    cs.forEach(function (c) {
      K.on(c, 'click', function () {
        if (!fan.classList.contains('open')) fan.classList.add('open');
        else if (c.classList.contains('top')) fan.classList.remove('open');
        top(c); hop(c);
      });
    });
    top(cs[0]);
    if (K.reduce) { fan.classList.add('open'); return; }
    K.seen(function () { K.at(350, function () { fan.classList.add('open'); }); });
  },

  path: function (el, K) {
    var box = $('.u-pt', el), page = $('.u-pt-page', el), ss = $$('.u-pt-s', el), line = $('.u-pt-line path', el), n = ss.length - 1;
    stepper(el, K, n, function (k) {
      var max = Math.max(0, page.offsetHeight - box.clientHeight);
      var y = Math.min(max, Math.max(0, ss[k].offsetTop - 14));
      page.style.transform = 'translateY(' + -y + 'px)';
      ss.forEach(function (s, i) { s.classList.toggle('cur', i === k); });
      line.style.strokeDashoffset = String(100 - (k / n) * 100);
    }, { ms: 950 });
  },

  corp: function (el, K) {
    var ul = $('.u-cp-ns', el), ns = $$('li', ul);
    stepper(el, K, ns.length, function (k) {
      ns.forEach(function (x, i) { x.classList.toggle('on', i < k); });
      ul.style.setProperty('--g', String(k / ns.length));
    }, { ms: 420 });
  },

  catalog: function (el, K) {
    var root = $('.u-ct', el), sets = JSON.parse(root.getAttribute('data-sets')), fb = $$('.u-ct-f button', el), tiles = $$('.u-ct-g li', el);
    var env = $('.u-ct-env', el), cnt = $('b', env), f = 0, sent = 0, ghosts = [];
    K.keep.apply(null, [cnt].concat(tiles.map(function (t) { return $('button', t); })));
    function filt(x) {
      f = f === x ? 0 : x;
      fb.forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-f') === f)); });
      tiles.forEach(function (t, i) { t.classList.toggle('off', sets[f].indexOf(i) < 0); });
    }
    function send(t) {
      if (t.classList.contains('sent') || t.classList.contains('off')) return;
      t.classList.add('sent');
      $('button', t).textContent = 'в заявке';
      var pic = $('.u-ct-pic', t), a = pic.getBoundingClientRect(), e = $('svg', env).getBoundingClientRect();
      function land() { cnt.textContent = String(++sent); hop(env); }
      if (K.reduce || !pic.animate) { land(); return; }
      var gh = pic.cloneNode(true);
      gh.classList.add('u-ct-ghost');
      gh.style.cssText = 'position:fixed;left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px;z-index:60;pointer-events:none;margin:0';
      document.body.appendChild(gh); ghosts.push(gh);
      var dx = e.left + e.width / 2 - (a.left + a.width / 2), dy = e.top + e.height / 2 - (a.top + a.height / 2);
      gh.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.1)', opacity: 0.5 }], { duration: 620, easing: 'cubic-bezier(.5,0,.2,1)' }).onfinish = function () { gh.remove(); land(); };
    }
    fb.forEach(function (b) { K.on(b, 'click', function () { filt(+b.getAttribute('data-f')); }); });
    tiles.forEach(function (t) { K.on($('button', t), 'click', function () { send(t); }); });
    K.add(function () { ghosts.forEach(function (g) { g.remove(); }); });
    if (K.reduce) return;
    K.seen(function () { K.at(700, function () { filt(1); }); K.at(1700, function () { send(tiles[sets[1][1]]); }); });
  },

  /** WordPress: переключатель "все / сайты / магазины" гасит лишние адреса; сам листает, пока не нажали */
  wp: function (el, K) {
    var bs = $$('.u-wp-f button', el), li = $$('.u-wp-l li', el), cur = 'all', user = false, timer = 0;
    function set(k) {
      cur = k;
      bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === k)); });
      li.forEach(function (x) { x.classList.toggle('off', k !== 'all' && x.getAttribute('data-k') !== k); });
    }
    K.add(function () { clearInterval(timer); set('all'); });
    bs.forEach(function (b) { K.on(b, 'click', function () { user = true; clearInterval(timer); set(b.getAttribute('data-f')); }); });
    if (K.reduce) return;
    K.seen(function () {
      timer = setInterval(function () {
        if (user || document.hidden) return;
        var ks = bs.map(function (b) { return b.getAttribute('data-f'); });
        set(ks[(ks.indexOf(cur) + 1) % ks.length]);
      }, 2400);
    });
  },
  lang: function (el, K) {
    var sw = $$('.u-lg-sw button', el), imgs = $$('.u-lg-scr img', el), url = $('.u-lg-url b', el), code = $('.u-lg-code b', el), scr = $('.u-lg-scr', el);
    var hero = $$('.u-screen--lang img', document);
    var cur = sw[0].getAttribute('data-l'), user = false, timer = 0;
    K.keep(url, code);
    function drum(node, txt) {
      node.textContent = '';
      for (var i = 0; i < txt.length; i++) { var s = document.createElement('span'); s.textContent = txt[i]; s.style.setProperty('--i', i); node.appendChild(s); }
    }
    function set(l) {
      if (l === cur) return;
      cur = l;
      var b = sw.filter(function (x) { return x.getAttribute('data-l') === l; })[0];
      sw.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      imgs.concat(hero).forEach(function (im) { im.classList.toggle('on', im.getAttribute('data-l') === l); });
      drum(url, b.getAttribute('data-path'));
      code.textContent = b.getAttribute('data-lang');
      hop(scr);
    }
    sw.forEach(function (b) { K.on(b, 'click', function () { user = true; clearInterval(timer); set(b.getAttribute('data-l')); }); });
    K.add(function () { clearInterval(timer); });
    if (K.reduce) return;
    K.seen(function () {
      timer = setInterval(function () {
        if (user || document.hidden) return;
        var i = (sw.map(function (x) { return x.getAttribute('data-l'); }).indexOf(cur) + 1) % sw.length;
        set(sw[i].getAttribute('data-l'));
      }, 2600);
    });
  }
};

/**
 * Доска заказов: раз в 1.5 с самый дальний заказ едет в следующую колонку (из последней обратно в первую, как новый).
 * Тап по карточке двигает её сразу. Перестановка FLIP: запомнить места, переставить, вернуть сдвигом и отпустить.
 */
function runKanban(board, K) {
  var cols = $$('.u-kb-col ul', board), tap = board.getAttribute('data-kb') === 'tap', auto = 0, pause = 0, vis = false;
  function cards() { return $$('.u-kb-card', board); }
  // разметку рисовал React: при уходе карточки возвращаются в свои колонки
  var home = cards().map(function (c) { return [c, c.parentNode]; });
  K.add(function () { home.forEach(function (h) { h[1].appendChild(h[0]); }); });
  function move(card) {
    var all = cards(), first = all.map(function (c) { return c.getBoundingClientRect(); });
    var to = cols.indexOf(card.parentNode) + 1;
    if (to >= cols.length) cols[0].insertBefore(card, cols[0].firstChild);
    else cols[to].appendChild(card);
    if (K.reduce) return;
    all.forEach(function (c, i) {
      var r = c.getBoundingClientRect(), dx = first[i].left - r.left, dy = first[i].top - r.top;
      if (dx || dy) c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
    card.classList.add('hot');
    K.at(700, function () { card.classList.remove('hot'); });
  }
  function tick() {
    if (!vis || document.hidden || Date.now() < pause) return;
    var best = null, bc = -1;
    cards().forEach(function (c) { var ci = cols.indexOf(c.parentNode); if (ci > bc) { bc = ci; best = c; } });
    if (best) move(best);
  }
  if (tap) cards().forEach(function (c) { K.on($('button', c), 'click', function () { pause = Date.now() + 4000; move(c); }); });
  if (K.reduce) return;
  auto = setInterval(tick, 1500);
  K.add(function () { clearInterval(auto); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { vis = es[es.length - 1].isIntersecting; }, { threshold: 0.2 });
    io.observe(board);
    K.add(function () { io.disconnect(); });
  } else vis = true;
}

/** все механики страницы и цвет у карточки в середине экрана */
export function runDemos(page) {
  var offs = [];
  var all = $$('.u-demo', page);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-on', e.isIntersecting); });
    }, { rootMargin: '-26% 0px -26% 0px' });
    all.forEach(function (d) { io.observe(d); });
    offs.push(function () { io.disconnect(); all.forEach(function (d) { d.classList.remove('is-on'); }); });
  }
  all.forEach(function (el) {
    var f = KINDS[el.getAttribute('data-demo')];
    if (!f) return;
    el.classList.add('is-js');
    var K = kit(el);
    f(el, K);
    offs.push(function () { K.off(); el.classList.remove('is-js', 'run', 'built'); });
  });
  // поза 6 рядом с "Когда это нужно": сайт в ноутбуке едет, только пока виден
  if ('IntersectionObserver' in window) {
    var shots = $$('.u-shot-fig', page);
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('u-live', e.isIntersecting); }); });
    shots.forEach(function (x) { so.observe(x); });
    offs.push(function () { so.disconnect(); shots.forEach(function (x) { x.classList.remove('u-live'); }); });
  }
  // доска в экране планшета на первом экране: только сама
  $$('.u-hero .u-kb', page).forEach(function (b) {
    var K = kit(b);
    runKanban(b, K);
    offs.push(K.off);
  });
  return function destroy() { offs.forEach(function (f) { f(); }); };
}
