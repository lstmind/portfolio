/* Отзывы: ванильный код статики (design-concepts/v4/karusel/sections/reviews/section.html).
   Десктоп: смена цитаты по имени, стрелкам, клавишам и свайпу, счётчик барабаном. Телефон: лента карточек на scroll-snap.
   Вход: общее число выкатывается барабаном. Возвращает полную очистку. */
export function runReviews(root) {
  var dead = false, offs = [];
  var on = function (t, type, fn, opt) { t.addEventListener(type, fn, opt); offs.push(function () { t.removeEventListener(type, fn, opt); }); };
  var cards = [].slice.call(root.querySelectorAll('.reviews-card'));
  var who = [].slice.call(root.querySelectorAll('.reviews-who'));
  var ticks = [].slice.call(root.querySelectorAll('.reviews-ticks i'));
  var track = root.querySelector('.reviews-track');
  var ctr = root.querySelector('.reviews-ctr-n');
  var live = root.querySelector('#reviews-live');
  var mq = matchMedia('(max-width:760px)');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var n = cards.length, cur = 0;

  /* крупные слова: режем на буквы для барабана. короткий предлог не висит в конце строки, едет вместе со следующим словом */
  var words = [].slice.call(root.querySelectorAll('.reviews-word'));
  var orig = words.map(function (w) { return w.textContent; });
  words.forEach(function (w) {
    var k = 0, groups = [];
    w.textContent.trim().split(/\s+/).forEach(function (word) {
      var last = groups[groups.length - 1];
      if (last && last.glue) { last.w.push(word); last.glue = false; }
      else groups.push({ w: [word], glue: word.length <= 2 });
    });
    w.innerHTML = groups.map(function (g) {
      return '<span class="reviews-wd">' + g.w.map(function (word) {
        return word.split('').map(function (ch) {
          return '<span class="reviews-c" style="--reviews-i:' + Math.min(k++, 12) + '">' + ch + '</span>';
        }).join('');
      }).join('<span class="reviews-gap"></span>') + '</span>';
    }).join(' ');
  });

  /* самое длинное слово должно влезть в строку: на узком телефоне все крупные слова уменьшаются одинаково */
  function fit() {
    if (dead) return;
    root.style.removeProperty('--reviews-wk');
    var k = 1;
    words.forEach(function (w) {
      var avail = w.clientWidth;
      if (!avail) return;
      [].forEach.call(w.children, function (s) { if (s.offsetWidth > avail) k = Math.min(k, avail / s.offsetWidth); });
    });
    if (k < 1) root.style.setProperty('--reviews-wk', (k * .97).toFixed(3));
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  var rz = 0;
  on(window, 'resize', function () { cancelAnimationFrame(rz); rz = requestAnimationFrame(fit); });

  function pad(i) { return (i < 9 ? '0' : '') + (i + 1); }

  var timers = [];
  function roll(text, dir) {
    var old = ctr.lastElementChild;
    if (old && old.textContent === text) return;
    if (reduce) { ctr.innerHTML = '<span>' + text + '</span>'; return; }
    var el = document.createElement('span');
    el.textContent = text;
    el.className = 'pre';
    if (dir < 0) el.style.transformOrigin = '50% 55% .42em';
    ctr.appendChild(el);
    if (old) { old.className = 'out'; timers.push(setTimeout(function () { old.remove(); }, 320)); }
    el.getBoundingClientRect();
    el.className = '';
  }

  function mark(i, dir) {
    for (var k = 0; k < n; k++) {
      var c = cards[k];
      c.classList.toggle('is-on', k === i);
      c.classList.toggle('is-off', k !== i && k === cur);
      if (who[k]) who[k].setAttribute('aria-current', k === i ? 'true' : 'false');
      if (ticks[k]) ticks[k].classList.toggle('is-on', k === i);
    }
    roll(pad(i), dir);
    live.textContent = 'Отзыв ' + (i + 1) + ' из ' + n;
    cur = i;
  }

  function go(i, dir) {
    i = (i + n) % n;
    if (i === cur) return;
    if (!dir) dir = i > cur ? 1 : -1;
    if (mq.matches) {
      var c = cards[i];
      track.scrollTo({ left: c.offsetLeft - cards[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      return; /* активную карточку на телефоне ставит прокрутка */
    }
    mark(i, dir);
  }

  root.querySelectorAll('[data-reviews-step]').forEach(function (b) {
    on(b, 'click', function () {
      var s = +b.getAttribute('data-reviews-step');
      if (mq.matches && (cur + s < 0 || cur + s >= n)) return go(s > 0 ? 0 : n - 1);
      go(cur + s, s);
    });
  });
  who.forEach(function (b, i) { on(b, 'click', function () { go(i); }); });

  /* клавиши: стрелки, когда фокус внутри блока */
  on(root, 'keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (!root.contains(document.activeElement)) return;
    e.preventDefault();
    var s = e.key === 'ArrowRight' ? 1 : -1;
    var onWho = who.indexOf(document.activeElement) > -1;
    go(cur + s, s);
    if (onWho && !mq.matches) who[cur].focus();
  });

  /* десктоп и планшет: свайп по цитате пальцем или пером */
  var sx = null, sy = 0;
  on(track, 'pointerdown', function (e) {
    if (mq.matches || e.pointerType === 'mouse') return;
    sx = e.clientX; sy = e.clientY;
  });
  on(track, 'pointerup', function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { var s = dx < 0 ? 1 : -1; go(cur + s, s); }
  });

  /* телефон: активная карточка та, что стоит у левого края ленты */
  var raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      if (dead || !mq.matches) return;
      var x = track.scrollLeft, best = 0, bd = 1e9, base = cards[0].offsetLeft;
      for (var k = 0; k < n; k++) {
        var d = Math.abs(cards[k].offsetLeft - base - x);
        if (d < bd) { bd = d; best = k; }
      }
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) best = n - 1;
      if (best !== cur) mark(best, best > cur ? 1 : -1);
    });
  }
  on(track, 'scroll', onScroll, { passive: true });

  function layout() {
    if (mq.matches) {
      track.removeAttribute('tabindex');
      cards.forEach(function (c) { c.classList.remove('is-off'); });
      onScroll();
    } else {
      track.setAttribute('tabindex', '0');
      mark(cur, 1);
    }
  }
  on(mq, 'change', layout);

  /* вход: число выкатывается барабаном, когда блок подходит к экрану */
  var io = null, r2 = 0;
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('reviews-pre');
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.disconnect();
        root.classList.add('reviews-in');
        r2 = requestAnimationFrame(function () { root.classList.remove('reviews-pre'); });
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(root.querySelector('.reviews-num'));
  }

  return function destroy() {
    dead = true;
    cancelAnimationFrame(rz); cancelAnimationFrame(raf); cancelAnimationFrame(r2);
    timers.forEach(clearTimeout);
    if (io) io.disconnect();
    offs.forEach(function (f) { f(); }); offs = [];
    words.forEach(function (w, i) { w.textContent = orig[i]; });
    root.classList.remove('reviews-pre', 'reviews-in');
    root.style.removeProperty('--reviews-wk');
    cards.forEach(function (c, k) { c.classList.toggle('is-on', k === 0); c.classList.remove('is-off'); });
    who.forEach(function (b, k) { b.setAttribute('aria-current', k === 0 ? 'true' : 'false'); });
    ticks.forEach(function (t, k) { t.classList.toggle('is-on', k === 0); });
    ctr.innerHTML = '<span>01</span>';
    live.textContent = 'Отзыв 1 из ' + n;
    track.setAttribute('tabindex', '0');
  };
}
