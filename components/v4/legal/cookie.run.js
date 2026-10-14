/* Плашка cookie: только уведомление, Метрика грузится своим порядком (app/layout.tsx).
   Показ: не раньше 3 с от начала загрузки и после первого скролла, касания или клавиши. Так она не попадает
   в замер скорости и не выскакивает раньше, чем человек начал смотреть страницу. Без действий плашка встаёт в очередь
   через 11 с, но показывается, только когда в кадре нет кнопки героя или финала (как и после касания).
   Плашка ездит вместе с язычком Telegram (#dock.is-on, runTongue в chrome.run.js): пока в кадре кнопка героя
   или финал со своей кнопкой, она уезжает вниз и их не закрывает, язычок выехал, выезжает и она.
   Нет язычка на странице (404): показ по общему правилу.
   "Понятно" запоминается в localStorage (lst_cookie: {t: когда, v: версия текста}) на 12 месяцев; новая версия текста
   показывает плашку заново. Esc прячет её до следующей страницы, ничего не запоминая. Нет localStorage
   (приватный режим, запрет): плашка показывается на каждой странице, это нормально. Возвращает очистку. */
var KEY = 'lst_cookie';
var YEAR = 365 * 24 * 3600 * 1000;
var EVS = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
var OPT = { capture: true, passive: true };

function accepted(v) {
  try {
    var r = JSON.parse(localStorage.getItem(KEY) || 'null');
    var now = Date.now();
    return !!r && r.v === v && typeof r.t === 'number' && r.t <= now + 864e5 && now - r.t < YEAR;
  } catch (e) {
    return false;
  }
}

export function runCookie(el) {
  var v = +el.dataset.v || 1;
  if (accepted(v)) return function () {};
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var ready = false, shown = false, parked = false, gone = false, tShow = 0, tOut = 0, tIdle = 0;
  var ok = el.querySelector('.ck-ok');
  var dock = document.getElementById('dock');
  var mo = dock ? new MutationObserver(onDock) : null;

  // язычок выехал: кнопки героя в кадре уже нет, а финала ещё нет. на странице без язычка не ждём
  function free() { return !dock || dock.classList.contains('is-on'); }

  function unarm() { clearTimeout(tIdle); EVS.forEach(function (e) { removeEventListener(e, arm, OPT); }); }
  function arm() {
    unarm();
    var wait = 3000 - performance.now();
    if (wait > 0) tShow = setTimeout(go, wait);
    else go();
  }
  // по тишине не перекрываем кнопку героя: ждём, как и после касания, пока выедет язычок
  function idle() { arm(); }
  function go() { ready = true; sync(); }
  function onDock() { sync(); }
  function sync() {
    if (!ready || gone) return;
    var want = free();
    if (want && !shown) {
      shown = true;
      el.hidden = false;
      if (!reduce.matches) el.classList.add('ck-in');
    } else if (shown && want === parked) {
      // въезд отыгрывается один раз, дальше плашка уезжает и возвращается переходом (анимация держала бы transform)
      parked = !want;
      el.classList.remove('ck-in');
      el.classList.toggle('ck-park', parked);
    }
  }
  function hide() {
    if (gone) return;
    gone = true;
    clearTimeout(tShow);
    if (mo) mo.disconnect();
    el.classList.remove('ck-in');
    if (reduce.matches || el.hidden || parked) el.hidden = true;
    else {
      el.classList.add('ck-out');
      tOut = setTimeout(function () { el.hidden = true; el.classList.remove('ck-out'); }, 320);
    }
  }
  function onOk() {
    try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), v: v })); } catch (e) { /* запомнить не вышло: покажется на следующей странице */ }
    hide();
  }
  function onKey(e) {
    if (e.key !== 'Escape' || !shown || parked || gone || e.defaultPrevented) return;
    // Esc в открытом листе меню закрывает лист, плашку не трогаем
    if (document.documentElement.classList.contains('ns-lock')) return;
    hide();
  }

  EVS.forEach(function (e) { addEventListener(e, arm, OPT); });
  tIdle = setTimeout(idle, Math.max(0, 11000 - performance.now()));
  if (mo) mo.observe(dock, { attributes: true, attributeFilter: ['class'] });
  ok.addEventListener('click', onOk);
  document.addEventListener('keydown', onKey);

  return function destroy() {
    unarm();
    if (mo) mo.disconnect();
    clearTimeout(tShow); clearTimeout(tOut);
    ok.removeEventListener('click', onOk);
    document.removeEventListener('keydown', onKey);
    el.hidden = true;
    el.classList.remove('ck-in', 'ck-out', 'ck-park');
  };
}
