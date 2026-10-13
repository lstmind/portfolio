/* Сквозное поведение страницы (статика sections/_page.html): шапка получает фон после начала прокрутки,
   нижний язычок Telegram на телефоне выезжает, когда кнопка героя ушла вверх, и уезжает перед финалом.
   Считается по положению на каждом кадре прокрутки, а не по событиям IntersectionObserver: при прыжке (якорь, "наверх",
   перезагрузка в середине) наблюдатель не срабатывает, если элемент перескочил экран целиком. */

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
