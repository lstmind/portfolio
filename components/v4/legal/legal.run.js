/* Документ: в оглавлении отмечается раздел, который сейчас читают (aria-current="location").
   Раздел текущий, если его заголовок уже прошёл верхнюю треть экрана. Считается по положению на кадре прокрутки,
   как язычок в chrome.run.js: прыжок по якорю тоже отмечается. На телефоне оглавление в details закрывается после выбора раздела.
   Возвращает очистку. */
export function runLegal(root) {
  var hs = [].slice.call(root.querySelectorAll('.lg-doc > h2[id]'));
  var links = [].slice.call(root.querySelectorAll('.lg-toc a[href^="#"]'));
  var det = root.querySelector('.lg-mtoc');
  var cur = null, rq = 0;
  function onScroll() {
    rq = 0;
    var line = innerHeight * .33, id = null;
    for (var i = 0; i < hs.length; i++) {
      if (hs[i].getBoundingClientRect().top <= line) id = hs[i].id;
      else break;
    }
    // дочитали до конца: последний раздел короткий и до линии не доезжает
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4 && hs.length) id = hs[hs.length - 1].id;
    if (id === cur) return;
    cur = id;
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }
  function req() { if (!rq) rq = requestAnimationFrame(onScroll); }
  function pick(e) { if (e.target.closest && e.target.closest('a[href^="#"]')) det.open = false; }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  if (det) det.addEventListener('click', pick);
  onScroll();
  return function destroy() {
    cancelAnimationFrame(rq);
    removeEventListener('scroll', req);
    removeEventListener('resize', req);
    if (det) det.removeEventListener('click', pick);
    links.forEach(function (a) { a.removeAttribute('aria-current'); });
  };
}
