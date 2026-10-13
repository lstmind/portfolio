/* Финал: ванильный код статики (design-concepts/v4/karusel/sections/final/section.html).
   Калькулятор (та же логика, что CostCalc.tsx и бот: цифры в тыс ₽, срочно ×1.25 с округлением), позы 3 и 2,
   стрелка к кнопке, запасная форма на /api/contact, аккордеон вопросов. Данные калькулятора приходят из lib через data-calc.
   Возвращает полную очистку. */
export function runFinal(root) {
  var dead = false, offs = [];
  var on = function (t, type, fn, opt) { t.addEventListener(type, fn, opt); offs.push(function () { t.removeEventListener(type, fn, opt); }); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CALC = JSON.parse(root.dataset.calc);
  var IMG = CALC.img;

  var st = { type: CALC.start.type, scale: CALC.start.scale, urg: CALC.start.urg };
  var $ = function (id) { return root.querySelector('#' + id); };
  var digits = $('final-digits'), numEl = $('final-num'), termEl = $('final-term'), hintEl = $('final-hint'), msgEl = $('final-msg');
  var cta = $('final-cta'), scene = $('final-scene'), figs = $('final-figs'), urgEl = $('final-urg');
  var lastText = digits.textContent;

  /* ---------- чипы: разметка с сервера ---------- */
  function chips(box, key) {
    var all = [].slice.call(box.querySelectorAll('.final-chip'));
    all.forEach(function (b) {
      on(b, 'click', function () {
        var v = b.dataset.v;
        if (st[key] === v) return;
        st[key] = v;
        all.forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
        update(true);
      });
    });
  }
  chips(root.querySelector('[data-final-k="type"]'), 'type');
  chips(root.querySelector('[data-final-k="scale"]'), 'scale');
  on(urgEl, 'change', function () { st.urg = urgEl.checked ? 'u' : 'n'; update(true); });

  /* ---------- цифры: изменившиеся знаки перекатываются барабаном, как слово в герое ---------- */
  function setDigits(text, animate) {
    var old = lastText; lastText = text;
    digits.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement('span'); s.className = 'final-d'; s.textContent = text[i];
      digits.appendChild(s);
      if (animate && !reduce && s.animate && (old[i] !== text[i] || old.length !== text.length)) {
        s.animate([{ transform: 'rotateX(-78deg)', opacity: 0 }, { transform: 'rotateX(0)', opacity: 1 }],
          { duration: 560, delay: i * 28, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      }
    }
  }

  var typeOf = function () { return CALC.types.filter(function (x) { return x[0] === st.type; })[0]; };
  function calc() {
    var idx = st.scale === 's' ? 0 : st.scale === 'm' ? 1 : 2;
    var p = CALC.prices[st.type][idx], mult = st.urg === 'u' ? 1.25 : 1;
    var low = Math.round(p[0] * mult), high = Math.round(p[1] * mult);
    var term = (st.urg === 'u' ? CALC.termsUrgent : CALC.terms)[st.type][idx];
    return { idx: idx, low: low, high: high, term: term, hint: CALC.hints[st.type][idx] };
  }
  function draft(r) {
    var t = typeOf()[2];
    var sc = CALC.scales[r.idx][1].toLowerCase();
    return 'Здравствуйте! Калькулятор на сайте: ' + t + ', ' + sc + (st.urg === 'u' ? ', срочно' : '') +
      '. Вышло ≈ ' + r.low + '–' + r.high + ' тыс ₽, срок ' + r.term + '. Хочу обсудить задачу.';
  }
  function summary(r) {
    return typeOf()[2] + ', ' + CALC.scales[r.idx][1].toLowerCase() + (st.urg === 'u' ? ', срочно' : '') + ', ≈ ' + r.low + '–' + r.high + ' тыс ₽';
  }
  function update(animate) {
    var r = calc();
    setDigits(r.low + '–' + r.high, animate);
    numEl.setAttribute('aria-label', 'примерно ' + r.low + '–' + r.high + ' тысяч рублей');
    termEl.textContent = r.term;
    hintEl.textContent = r.hint;
    var text = draft(r);
    msgEl.innerHTML = '';
    var parts = text.split(/(≈ [^,]+ тыс ₽)/);
    parts.forEach(function (p, i) { if (i % 2) { var b = document.createElement('b'); b.textContent = p; msgEl.appendChild(b); } else msgEl.appendChild(document.createTextNode(p)); });
    cta.href = CALC.telegram + '?text=' + encodeURIComponent(text);
    cta.dataset.finalText = text;
    if (animate && !reduce && msgEl.animate) {
      msgEl.animate([{ transform: 'scale(.965)', opacity: .55 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    if (animate) think();
    if (!form.hidden) $('final-calcline').textContent = summary(r);
  }

  /* ---------- фигура: стоит в позе 3 и показывает на кнопку; пока пересчитываете, печатает (поза 2) ---------- */
  var imgs = [].slice.call(figs.querySelectorAll('.final-me'));
  var HS = [560, 780, 984, 1400, 1600, 1968], WS = [228, 317, 400, 569, 650, 800];
  var loaded = false, pose = 3, poseT = 0, idle = 0, ready = { 3: false, 2: false };
  function sizesNow() { return Math.ceil(figs.getBoundingClientRect().width || 300) + 'px'; }
  function load(im) {
    if (dead) return;
    var p = im.dataset.finalPose;
    im.sizes = sizesNow();
    im.srcset = HS.map(function (h, j) { return IMG + 'pose-j' + p + '-' + h + '.webp ' + WS[j] + 'w'; }).join(', ');
    im.src = IMG + 'pose-j' + p + '-780.webp';
    var ok = function () {
      if (dead) return;
      ready[p] = true;
      if (p === '3') { ready[3] = true; var r = cta.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0 && !drawn) ptDraw(); }
    };
    if (im.decode) im.decode().then(ok, function () { im.addEventListener('load', ok, { once: true }); });
    else im.addEventListener('load', ok, { once: true });
  }
  function loadAll() {
    if (loaded) return; loaded = true;
    load(imgs[0]);
    if (!reduce) { var l2 = function () { load(imgs[1]); }; idle = window.requestIdleCallback ? requestIdleCallback(l2, { timeout: 1500 }) : setTimeout(l2, 600); }
  }
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { loadAll(); io.disconnect(); } }, { rootMargin: '900px 0px' });
    io.observe(root);
  } else loadAll();

  function showPose(p) {
    if (p === pose || !ready[p]) return;
    pose = p;
    imgs.forEach(function (im) { im.classList.toggle('final-on', +im.dataset.finalPose === p); });
    ptSvg.classList.toggle('final-off', p !== 3);
    if (figs.animate) figs.animate([{ translate: '0 0' }, { translate: '0 -3px', offset: .4 }, { translate: '0 0' }], { duration: 210, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  var hot = false;
  function think() {
    if (reduce) return;
    clearTimeout(poseT);
    if (!hot) showPose(2);
    poseT = setTimeout(function () { showPose(3); }, 1100);
  }
  function setHot(v) {
    hot = v; scene.classList.toggle('final-hot', v);
    if (v && !reduce) { clearTimeout(poseT); showPose(3); }
  }
  on(cta, 'pointerenter', function (e) { if (e.pointerType === 'mouse') setHot(true); });
  on(cta, 'pointerleave', function () { setHot(false); });
  on(cta, 'focus', function () { setHot(cta.matches(':focus-visible')); });
  on(cta, 'blur', function () { setHot(false); });

  /* ---------- стрелка: геометрия от кадра позы 3 и кнопки, рисуется один раз при входе в кадр ---------- */
  var ptSvg = $('final-point'), TIP = [116 / 400, 566 / 984], DASH = [3.6, 2.7, 2.5, 3.0, 4.2, 2.8, 2.9, 3.2, 3.3, 2.6], drawn = false, ptAnims = [];
  function ptPlace() {
    var sr = scene.getBoundingClientRect(), fr = figs.getBoundingClientRect(), br = cta.getBoundingClientRect();
    if (!fr.width) return;
    var mob = innerWidth < 700, up = 0;
    var k = mob ? 1 : Math.min(1.25, fr.height / 620);
    var fx = fr.left - sr.left + fr.width * .03, fy = fr.top - sr.top + up;
    var S = [fx + TIP[0] * fr.width - 1.5 * k, fy + TIP[1] * fr.height + 11 * k];
    var E = [br.left - sr.left + (mob ? 22 : 9), br.top - sr.top + up - (mob ? 5 : 3)];
    var dy = E[1] - S[1];
    var c1 = [S[0] - (mob ? 22 : 10 * k), S[1] + dy * .42], c2 = [E[0] - (mob ? 14 : 34 * k), E[1] - dy * .4];
    var f = function (pt) { return pt[0].toFixed(1) + ',' + pt[1].toFixed(1); };
    var d = 'M' + f(S) + 'C' + f(c1) + ' ' + f(c2) + ' ' + f(E);
    var ang = Math.atan2(E[1] - c2[1], E[0] - c2[0]), L = (mob ? 11 : 13) * k, sp = .5;
    var h = 'M' + f([E[0] - L * Math.cos(ang - sp), E[1] - L * Math.sin(ang - sp)]) + 'L' + f(E) + 'L' + f([E[0] - L * Math.cos(ang + sp), E[1] - L * Math.sin(ang + sp)]);
    var w = (mob ? 2.1 : 2.5) * k;
    ['final-pL', 'final-pmL', 'final-rL'].forEach(function (id) { $(id).setAttribute('d', d); });
    ['final-pH', 'final-pmH', 'final-rH'].forEach(function (id) { $(id).setAttribute('d', h); });
    $('final-pL').style.strokeWidth = w; $('final-pH').style.strokeWidth = w * 1.06;
    $('final-rL').style.strokeWidth = $('final-rH').style.strokeWidth = w + 3.4;
    $('final-rL').style.strokeDasharray = $('final-pL').style.strokeDasharray = DASH.map(function (q) { return (q * w).toFixed(1); }).join(' ');
    $('final-pmL').style.strokeWidth = $('final-pmH').style.strokeWidth = (w * 5).toFixed(1);
  }
  function ptDraw() {
    if (drawn || dead) return; drawn = true; ptPlace();
    var a = $('final-pmL'), b = $('final-pmH');
    if (reduce || !a.animate) { a.style.strokeDashoffset = 0; b.style.strokeDashoffset = 0; return; }
    ptAnims.push(a.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 520, delay: 120, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }));
    ptAnims.push(b.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 160, delay: 620, easing: 'ease-out', fill: 'forwards' }));
  }
  var io2 = null;
  if ('IntersectionObserver' in window) {
    io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && ready[3]) { ptDraw(); io2.disconnect(); } });
    }, { threshold: .25 });
    io2.observe(cta);
  }
  var rzT = 0;
  on(window, 'resize', function () { clearTimeout(rzT); rzT = setTimeout(function () { if (drawn && !dead) ptPlace(); }, 120); });

  /* текст расчёта подставляется в чат через ?text=, на всякий случай ещё и копируется */
  var copiedEl = $('final-copied'), copT = 0;
  on(cta, 'click', function () {
    var t = cta.dataset.finalText;
    if (t && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () {
        if (dead) return;
        copiedEl.textContent = 'текст скопирован'; copiedEl.classList.add('final-show');
        clearTimeout(copT); copT = setTimeout(function () { copiedEl.classList.remove('final-show'); }, 4000);
      }, function () {});
    }
  });

  /* ---------- запасной путь: форма ---------- */
  var alt = $('final-alt'), form = $('final-form'), status = $('final-status'), send = form.querySelector('.final-send');
  on(alt, 'click', function () {
    var open = form.hidden;
    form.hidden = !open;
    alt.setAttribute('aria-expanded', String(open));
    alt.textContent = open ? 'Свернуть' : 'Нет Telegram? Оставьте контакт';
    root.querySelector('.final-body').hidden = open;
    if (open) $('final-calcline').textContent = summary(calc());
    if (open) $('final-name').focus();
  });
  on(form, 'submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    if (fd.get('company')) return;
    var name = String(fd.get('name') || '').trim(), contact = String(fd.get('contact') || '').trim();
    var cEl = $('final-contact'), nEl = $('final-name');
    nEl.setAttribute('aria-invalid', String(name.length < 2));
    if (name.length < 2) { status.textContent = 'Напишите, как к вам обращаться.'; nEl.focus(); return; }
    if (!/@|\+?[\d\s().-]{7,}/.test(contact)) {
      cEl.setAttribute('aria-invalid', 'true');
      status.textContent = 'Похоже на опечатку: оставьте телефон, почту или @ник.'; cEl.focus(); return;
    }
    cEl.setAttribute('aria-invalid', 'false');
    var r = calc();
    send.disabled = true; send.textContent = 'Отправляю…'; status.textContent = '';
    fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, contact: contact, task: String(fd.get('task') || ''),
        budget: 'калькулятор: ' + summary(r),
        page: location.pathname + location.search, from: document.referrer || '' })
    }).then(function (res) {
      if (!res.ok) throw new Error('bad');
      form.reset();
      status.textContent = 'Дошло. Уже читаю, отвечаю сам.';
      send.textContent = 'Отправлено';
      if (!reduce) { clearTimeout(poseT); showPose(2); }
    }).catch(function () {
      send.disabled = false; send.textContent = 'Отправить';
      status.innerHTML = 'Не отправилось, текст в полях остался. Напишите на <a href="mailto:' + CALC.email + '">' + CALC.email + '</a>.';
    });
  });

  /* ---------- вопросы: аккордеон, ответы в разметке и в FAQPage ---------- */
  var qs = [].slice.call(root.querySelectorAll('.final-q'));
  qs.forEach(function (li) {
    var b = li.querySelector('.final-qb'), a = li.querySelector('.final-a');
    a.inert = true;
    on(b, 'click', function () {
      var open = !li.classList.contains('final-open');
      li.classList.toggle('final-open', open); b.setAttribute('aria-expanded', String(open)); a.inert = !open;
    });
  });

  update(false);

  return function destroy() {
    dead = true;
    clearTimeout(poseT); clearTimeout(rzT); clearTimeout(copT);
    if (idle) (window.cancelIdleCallback || clearTimeout)(idle);
    if (io) io.disconnect(); if (io2) io2.disconnect();
    ptAnims.forEach(function (x) { x.cancel(); });
    offs.forEach(function (f) { f(); }); offs = [];
    qs.forEach(function (li) { li.classList.remove('final-open'); li.querySelector('.final-qb').setAttribute('aria-expanded', 'false'); li.querySelector('.final-a').inert = false; });
    scene.classList.remove('final-hot');
  };
}
