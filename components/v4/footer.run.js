/* Подвал: ванильный код статики (design-concepts/v4/karusel/sections/footer/section.html).
   Буквы вордмарка переворачиваются на место при въезде, потом персонаж садится на ствол d. "Наверх" плавно.
   Возвращает полную очистку. */
export function runFooter(root) {
  var dead = false, offs = [], timers = [];
  var on = function (t, type, fn, opt) { t.addEventListener(type, fn, opt); offs.push(function () { t.removeEventListener(type, fn, opt); }); };
  var word = root.querySelector('.footer-word'), fig = root.querySelector('#footer-fig');
  // буквы по одной, чтобы перевернуть их на въезде (фигура остаётся внутри второй строки)
  var lines = [].slice.call(root.querySelectorAll('.footer-l1, .footer-l2'));
  var orig = [];
  lines.forEach(function (line) {
    [].slice.call(line.childNodes).forEach(function (n) {
      if (n.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      var made = [];
      n.textContent.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'footer-ch'; s.textContent = c; frag.appendChild(s); made.push(s); });
      orig.push([n, made]);
      line.replaceChild(frag, n);
    });
  });
  var chars = [].slice.call(root.querySelectorAll('.footer-ch')), dCh = chars[chars.length - 1];

  on(root.querySelector('#footer-up'), 'click', function (e) { e.preventDefault(); scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });

  var anims = [];
  function restore() {
    anims.forEach(function (a) { a.cancel(); });
    timers.forEach(clearTimeout);
    root.classList.remove('footer-pre');
    orig.forEach(function (o) { var first = o[1][0]; if (first && first.parentNode) { first.parentNode.insertBefore(o[0], first); o[1].forEach(function (s) { s.remove(); }); } });
  }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window) || !Element.prototype.animate) {
    return function destroy() { dead = true; offs.forEach(function (f) { f(); }); restore(); };
  }
  // прячем только если вордмарк ещё ниже экрана: то, что уже видно, не мигает
  var io = null;
  if (word.getBoundingClientRect().top >= innerHeight) {
    root.classList.add('footer-pre');
    var play = function () {
      if (dead) return;
      var ease = 'cubic-bezier(.16,1,.3,1)';
      chars.forEach(function (c, i) {
        anims.push(c.animate([{ opacity: 0, transform: 'perspective(900px) rotateX(-78deg)' }, { opacity: 1, transform: 'perspective(900px) rotateX(0deg)' }],
          { duration: 700, delay: i * 45, easing: ease, fill: 'both' }));
      });
      var land = chars.length * 45 + 380;
      // садится: кадр появляется сразу, подскок на 3px, ствол d чуть проседает под весом
      timers.push(setTimeout(function () {
        anims.push(fig.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, fill: 'both' }));
        fig.animate([{ transform: 'translateY(-3px)' }, { transform: 'translateY(0)', offset: .55 }, { transform: 'translateY(-1px)', offset: .8 }, { transform: 'translateY(0)' }],
          { duration: 240, easing: 'cubic-bezier(.3,.7,.4,1)' });
        dCh.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.985)', offset: .4 }, { transform: 'scaleY(1)' }], { duration: 240, easing: 'ease-out' });
      }, land));
      timers.push(setTimeout(function () { root.classList.remove('footer-pre'); }, land + 260));
    };
    io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      // фигуре надо успеть загрузиться: ленивая картинка уже запрошена на подходе
      if (fig.complete && fig.naturalWidth) play();
      else { on(fig, 'load', play, { once: true }); on(fig, 'error', play, { once: true }); }
    }, { rootMargin: '0px 0px -18% 0px' });
    io.observe(word);
  }
  return function destroy() {
    dead = true;
    if (io) io.disconnect();
    offs.forEach(function (f) { f(); }); offs = [];
    restore();
  };
}
