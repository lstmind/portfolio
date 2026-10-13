/* Сквозное поведение страницы (статика sections/_page.html): шапка получает фон после начала прокрутки,
   нижний язычок Telegram на телефоне выезжает, когда кнопка героя ушла вверх, и уезжает перед финалом.
   Считается по положению на каждом кадре прокрутки, а не по событиям IntersectionObserver: при прыжке (якорь, "наверх",
   перезагрузка в середине) наблюдатель не срабатывает, если элемент перескочил экран целиком. */
import { ymGoal } from '../../lib/metrika';

export function runHeader(top) {
  var solid = null, rq = 0;
  function onScroll() {
    rq = 0;
    var s = scrollY > 8;
    if (s !== solid) { solid = s; top.classList.toggle('is-solid', s); }
  }
  function req() { if (!rq) rq = requestAnimationFrame(onScroll); }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  onScroll();
  return function destroy() {
    cancelAnimationFrame(rq);
    removeEventListener('scroll', req);
    removeEventListener('resize', req);
    top.classList.remove('is-solid');
  };
}

/* Пришли по ссылке с якорем с другой страницы (/#final, /#process): браузер сразу ставит блок наверх, а потом
   секции выше меняют высоту (сцены прокрутки вырастают, когда запускается их код), и блок уезжает на экраны вниз.
   Пока человек сам ничего не трогал, первые секунды возвращаем блок на место. При перезагрузке и "назад"
   браузер восстанавливает свою позицию, тогда не вмешиваемся */
export function runHashHold() {
  var h = location.hash, t = null;
  try { t = h.length > 1 ? document.getElementById(decodeURIComponent(h.slice(1))) : null; } catch (e) { t = null; }
  var nav = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
  if (!t || !('ResizeObserver' in window) || (nav && nav.type !== 'navigate')) return function () {};
  var done = false, rq = 0;
  var evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  var ro = new ResizeObserver(function () { if (!rq) rq = requestAnimationFrame(fix); });
  function fix() { rq = 0; if (!done) t.scrollIntoView({ block: 'start' }); }
  function stop() {
    if (done) return;
    done = true;
    cancelAnimationFrame(rq); clearTimeout(end); ro.disconnect();
    evs.forEach(function (e) { removeEventListener(e, stop, true); });
  }
  var end = setTimeout(stop, 4000);
  evs.forEach(function (e) { addEventListener(e, stop, { capture: true, passive: true }); });
  ro.observe(document.documentElement);
  return stop;
}

/* after: после какой кнопки язычок появляется (нет на странице: после первого экрана);
   until: перед каким заголовком уезжает (нет: перед подвалом) */
export function runTongue(dock, after, until) {
  var heroCta = after ? document.querySelector(after) : null;
  var title = (until && document.querySelector(until)) || document.getElementById('footer');
  var on = null, rq = 0;
  function onScroll() {
    rq = 0;
    var passed = heroCta ? heroCta.getBoundingClientRect().bottom < 0 : scrollY > innerHeight * .6;
    // кнопка героя целиком выше экрана, а вопрос "СКОЛЬКО?" финала ещё не показался (дальше только подвал):
    // язычок не ложится на цифры калькулятора и не дублирует кнопку финала
    var v = passed && !(title && title.getBoundingClientRect().top < innerHeight);
    if (v === on) return;
    on = v;
    dock.classList.toggle('is-on', v);
    if (v) { dock.removeAttribute('aria-hidden'); dock.removeAttribute('tabindex'); }
    else { dock.setAttribute('aria-hidden', 'true'); dock.setAttribute('tabindex', '-1'); }
  }
  function req() { if (!rq) rq = requestAnimationFrame(onScroll); }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  onScroll();
  return function destroy() {
    cancelAnimationFrame(rq);
    removeEventListener('scroll', req);
    removeEventListener('resize', req);
    dock.classList.remove('is-on');
    dock.setAttribute('aria-hidden', 'true'); dock.setAttribute('tabindex', '-1');
  };
}

/* Меню шапки.
   Десктоп: Услуги и Ниши раскрывают панель под строкой шапки. Мышью по наведению с задержкой (проход курсора мимо не мигает
   панелью), кликом и с клавиатуры (Enter, пробел). Закрывается по Esc, клику мимо, уходу курсора и фокуса.
   Телефон: кнопка "Меню" открывает лист на весь экран. Закрывается крестиком, свайпом вниз, Esc и кнопкой "назад"
   (лист кладёт свою запись в историю). Страница под листом не прокручивается, фокус ходит только внутри листа. */
export function runMenu(top) {
  var off = [];
  function on(el, ev, fn, opt) { el.addEventListener(ev, fn, opt); off.push(function () { el.removeEventListener(ev, fn, opt); }); }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var wide = matchMedia('(min-width: 700px)');
  var norm = function (p) { return p.replace(/\/+$/, '') || '/'; };
  var here = norm(location.pathname);

  // ссылка на ту самую страницу, где человек сейчас, отмечена "page" (сервер ставит разделу "true": он знает раздел, но не адрес)
  var marked = [];
  top.querySelectorAll('.top-nav > a, .np a, .ns-big a, .ns-pills a').forEach(function (a) {
    var u = new URL(a.getAttribute('href'), location.href);
    if (u.origin === location.origin && !u.hash && norm(u.pathname) === here) {
      marked.push([a, a.getAttribute('aria-current')]);
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ── панели десктопа ── */
  var trs = [].slice.call(top.querySelectorAll('.top-tr'));
  var cur = null, by = '', at = 0, tOpen = 0, tClose = 0, warmed = false, gone = 0;
  var goaled = {};
  var panelOf = function (tr) { return document.getElementById(tr.getAttribute('aria-controls')); };

  // картинки панели ниш ленивые и лежат в скрытом блоке: качаем их при первом намерении, а не на каждой странице сразу
  function warm() {
    if (warmed) return;
    warmed = true;
    top.querySelectorAll('.np img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
  }
  function hideP(tr) {
    var p = panelOf(tr);
    p.hidden = true;
    p.classList.remove('is-in');
    tr.setAttribute('aria-expanded', 'false');
  }
  // quiet: без проявления (смена раздела или возврат курсора сразу после закрытия)
  function show(tr, how, quiet) {
    clearTimeout(tOpen); clearTimeout(tClose);
    if (cur === tr) return;
    var was = cur;
    if (was) hideP(was);
    warm();
    var p = panelOf(tr);
    p.hidden = false;
    // проявляется только из закрытого состояния; между Услугами и Нишами смена без анимации
    if (!was && !quiet && !reduce.matches) p.classList.add('is-in');
    p.scrollTop = 0;
    tr.setAttribute('aria-expanded', 'true');
    cur = tr; by = how; at = Date.now();
    top.classList.add('is-open');
    // цель Метрики: панель раскрылась (кликом, наведением или с клавиатуры), по разу на панель за страницу
    var g = tr.getAttribute('aria-controls') === 'np-dlya' ? 'nav_niches' : 'nav_services';
    if (!goaled[g]) { goaled[g] = 1; ymGoal(g); }
  }
  function close(back) {
    clearTimeout(tOpen); clearTimeout(tClose);
    if (!cur) return;
    var tr = cur;
    hideP(tr);
    cur = null;
    top.classList.remove('is-open');
    if (back) tr.focus();
  }
  var mouse = function (e) { return e.pointerType === 'mouse'; };
  // закрытие по уходу курсора. Запоминаем время: если курсор тут же вернулся на раздел (срезал путь с Услуг на Ниши
  // через Работы чуть медленнее таймера), панель открывается сразу, без задержки и проявления, и не мигает
  function leave(ms) {
    clearTimeout(tClose);
    tClose = setTimeout(function () { close(false); gone = Date.now(); }, ms);
  }

  trs.forEach(function (tr) {
    on(tr, 'click', function () {
      if (cur !== tr) { show(tr, 'click'); return; }
      // панель только что раскрылась наведением, и человек по привычке кликнул: оставляем открытой
      if (by === 'hover' && Date.now() - at < 700) { by = 'click'; return; }
      close(false);
    });
    on(tr, 'pointerenter', function (e) {
      if (!mouse(e)) return;
      clearTimeout(tClose); clearTimeout(tOpen);
      warm();
      if (cur) { if (cur !== tr) show(tr, 'hover'); return; }
      if (Date.now() - gone < 400) { show(tr, 'hover', true); return; }
      tOpen = setTimeout(function () { show(tr, 'hover'); }, 140);
    });
    on(tr, 'pointerleave', function () { clearTimeout(tOpen); });
    // стрелка вниз: открыть и сразу встать на первую ссылку панели
    on(tr, 'keydown', function (e) {
      if (e.key !== 'ArrowDown') return;
      e.preventDefault();
      show(tr, 'click');
      var first = panelOf(tr).querySelector('a[href]');
      if (first) first.focus();
    });
    // вернулся в панель после ухода: остаётся открытой
    on(panelOf(tr), 'pointerenter', function () { clearTimeout(tClose); });
  });
  // курсор ушёл на Работы, Цены или Telegram: панель закрывается, но не сразу (по пути с Услуг на Ниши он проходит Работы,
  // и панель на этом пути не должна гаснуть и загораться снова)
  top.querySelectorAll('.top-nav > a, .top-r > .tg').forEach(function (a) {
    on(a, 'pointerenter', function (e) {
      if (!mouse(e) || !cur) return;
      leave(380);
    });
  });
  on(top, 'pointerleave', function (e) {
    if (!mouse(e)) return;
    clearTimeout(tOpen);
    if (cur) leave(260);
  });
  on(document, 'pointerdown', function (e) { if (cur && !top.contains(e.target)) close(false); });
  on(document, 'focusin', function (e) {
    if (cur && !cur.contains(e.target) && !panelOf(cur).contains(e.target)) close(false);
  });

  /* ── лист телефона ── */
  var btn = top.querySelector('.top-menu');
  var sheet = document.getElementById('ns');
  var body = sheet.querySelector('.ns-body');
  var x = sheet.querySelector('.ns-x');
  var open = false, pushed = false, tHide = 0, hash = '';

  function lock(v) { document.documentElement.classList.toggle('ns-lock', v); }
  function openSheet() {
    if (open) return;
    open = true;
    clearTimeout(tHide);
    sheet.hidden = false;
    body.scrollTop = 0;
    if (!reduce.matches) void sheet.offsetHeight;
    sheet.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    lock(true);
    // фокус на сам лист, а не на крестик: после касания на кнопке не загорается рамка, а Tab ведёт по листу сверху
    sheet.focus({ preventScroll: true });
    try { history.pushState({ nsMenu: 1 }, ''); pushed = true; } catch (err) { pushed = false; }
  }
  // fromHistory: запись листа уже снята кнопкой "назад", сами history не трогаем
  function closeSheet(fromHistory, focusBtn) {
    if (!open) return;
    open = false;
    sheet.classList.remove('is-drag', 'is-open');
    sheet.style.transform = '';
    btn.setAttribute('aria-expanded', 'false');
    lock(false);
    clearTimeout(tHide);
    if (reduce.matches) sheet.hidden = true;
    else tHide = setTimeout(function () { sheet.hidden = true; }, 260);
    if (focusBtn !== false) btn.focus({ preventScroll: true });
    if (pushed && !fromHistory) { pushed = false; history.back(); }
    else pushed = false;
  }

  on(btn, 'click', openSheet);
  on(x, 'click', function () { closeSheet(false); });
  // якорь на этой же странице. Не через location.hash: смена хеша рождает второй popstate, и роутер Next на нём
  // возвращает прокрутку к началу. Адрес меняем без нового шага истории, к блоку едем сами
  function jump(h) {
    setTimeout(function () {
      var t = document.getElementById(decodeURIComponent(h.slice(1)));
      try { history.replaceState(history.state, '', h); } catch (err) { /* адрес не главное */ }
      if (t) t.scrollIntoView();
    }, 0);
  }
  on(window, 'popstate', function () {
    if (open) closeSheet(true);
    // запись листа уже снята: теперь можно к якорю, иначе история собьётся
    if (hash) { var h = hash; hash = ''; jump(h); }
  });

  // ссылки листа: запись листа подменяется новой страницей, чтобы "назад" со следующей страницы не возвращал в пустой шаг
  on(sheet, 'click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a || a.target === '_blank' || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var u = new URL(a.getAttribute('href'), location.href);
    if (u.origin !== location.origin) return;
    e.preventDefault();
    if (norm(u.pathname) === here && u.hash) {
      if (pushed) { hash = u.hash; closeSheet(false, false); }
      else { closeSheet(false, false); jump(u.hash); }
      return;
    }
    if (pushed) location.replace(u.href);
    else location.href = u.href;
  });

  // фокус не выходит из листа
  on(sheet, 'keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeSheet(false); return; }
    if (e.key !== 'Tab') return;
    var f = [].slice.call(sheet.querySelectorAll('a[href], button')).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === sheet)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // свайп вниз: лист тянется за пальцем, если список уже в самом верху или палец на строке с крестиком
  var y0 = 0, t0 = 0, dy = 0, drag = false, can = false;
  on(sheet, 'touchstart', function (e) {
    if (e.touches.length !== 1) { can = false; return; }
    can = body.scrollTop <= 0 || !body.contains(e.target);
    y0 = e.touches[0].clientY; t0 = Date.now(); dy = 0; drag = false;
  }, { passive: true });
  on(sheet, 'touchmove', function (e) {
    if (!can) return;
    var d = e.touches[0].clientY - y0;
    if (!drag) {
      if (d < 6) { if (d < 0) can = false; return; }
      drag = true;
      sheet.classList.add('is-drag');
    }
    dy = Math.max(0, d);
    sheet.style.transform = 'translateY(' + dy + 'px)';
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  function endDrag() {
    if (!drag) return;
    drag = false;
    var v = dy / Math.max(1, Date.now() - t0);
    if (dy > 110 || (dy > 40 && v > .6)) closeSheet(false);
    else { sheet.classList.remove('is-drag'); sheet.style.transform = ''; }
  }
  on(sheet, 'touchend', endDrag);
  on(sheet, 'touchcancel', endDrag);

  /* ── общее ── */
  on(document, 'keydown', function (e) {
    if (e.key === 'Escape' && cur) close(top.contains(document.activeElement));
  });
  on(wide, 'change', function () {
    if (wide.matches) closeSheet(false, false);
    else close(false);
  });
  // страница вернулась из кеша "назад/вперёд" с открытым меню: закрываем без шагов по истории
  on(window, 'pageshow', function (e) {
    if (!e.persisted) return;
    pushed = false;
    closeSheet(true, false);
    close(false);
  });

  return function destroy() {
    off.forEach(function (f) { f(); });
    clearTimeout(tOpen); clearTimeout(tClose); clearTimeout(tHide);
    close(false);
    if (open) {
      open = false;
      lock(false);
      sheet.classList.remove('is-open', 'is-drag');
      sheet.style.transform = '';
      btn.setAttribute('aria-expanded', 'false');
    }
    sheet.hidden = true;
    marked.forEach(function (m) { if (m[1] === null) m[0].removeAttribute('aria-current'); else m[0].setAttribute('aria-current', m[1]); });
  };
}
