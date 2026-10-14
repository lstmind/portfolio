/* Поведение раздела работ. Разметка приходит с сервера, здесь только классы, стили и обработчики.
   Каждая функция возвращает полную очистку: обработчики, наблюдатели, кадры, разбивку слов на буквы. */

type Off = () => void;

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
/** настоящий курсор: на нём цвет даёт наведение, без него карточка посреди экрана */
const finePointer = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

/** на телефоне цветная та карточка, что посреди экрана */
function liveInMiddle(targets: Element[], margin = "-36% 0px -36% 0px"): Off {
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-live", e.isIntersecting)), { rootMargin: margin });
  targets.forEach((t) => io.observe(t));
  return () => {
    io.disconnect();
    targets.forEach((t) => t.classList.remove("is-live"));
  };
}

/* ── витрина ── */

export function runHub(root: HTMLElement): Off {
  const offs: Off[] = [];
  const on = <K extends keyof HTMLElementEventMap>(t: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    t.addEventListener(type, fn);
    offs.push(() => t.removeEventListener(type, fn));
  };
  root.classList.add("is-js");

  const box = root.querySelector<HTMLElement>(".w-filters");
  const found = root.querySelector<HTMLElement>(".w-filters__found");
  const empty = root.querySelector<HTMLElement>(".w-empty");
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".w-site"));
  const all = Array.from(root.querySelectorAll<HTMLElement>("[data-site]"));
  const groups = Array.from(root.querySelectorAll<HTMLElement>(".w-filter"));
  const total = cards.length;
  const state: Record<string, string> = { cat: "", pf: "" };

  const match = (el: HTMLElement, cat: string, pf: string) =>
    (!cat || el.dataset.cat === cat || el.dataset.own === cat) && (!pf || el.dataset.pf === pf);

  function apply(animate: boolean) {
    let n = 0;
    all.forEach((el) => {
      const ok = match(el, state.cat, state.pf);
      const was = !el.hidden;
      el.hidden = !ok;
      if (ok && el.classList.contains("w-site")) {
        n++;
        if (animate && !reduced()) {
          el.classList.remove("is-in");
          void el.offsetWidth;
          el.classList.add("is-in");
          el.style.setProperty("--i", String(Math.min(n - 1, 12)));
        }
      }
      if (!ok && was) el.classList.remove("is-live");
    });
    // число на кнопке: сколько сайтов будет, если нажать её при выбранном во второй группе
    groups.forEach((g) => {
      const dim = g.dataset.dim!;
      g.querySelectorAll<HTMLButtonElement>("button").forEach((b) => {
        const v = b.dataset.v || "";
        const pressed = state[dim] === v;
        b.setAttribute("aria-pressed", String(pressed));
        const c = cards.filter((el) => (dim === "cat" ? match(el, v, state.pf) : match(el, state.cat, v))).length;
        const i = b.querySelector("i");
        if (i) i.textContent = String(c);
        b.disabled = !pressed && c === 0;
      });
    });
    if (found) found.textContent = state.cat || state.pf ? `Показано ${n} из ${total}` : "";
    if (empty) empty.hidden = n > 0;
  }

  if (box) {
    box.hidden = false;
    groups.forEach((g) =>
      on(g, "click", (e) => {
        const b = (e.target as HTMLElement).closest("button");
        if (!b || b.disabled) return;
        const dim = g.dataset.dim!;
        const v = b.dataset.v || "";
        state[dim] = state[dim] === v ? "" : v;
        apply(true);
      }),
    );
    const reset = root.querySelector<HTMLElement>(".w-empty__reset");
    if (reset)
      on(reset, "click", () => {
        state.cat = state.pf = "";
        apply(true);
      });
    apply(false);
  }

  if (!finePointer()) offs.push(liveInMiddle(cards.map((c) => c.querySelector(".w-card")!).filter(Boolean)));

  // сетка: первые 12, остальные по кнопке; любой фильтр показывает всё, что подходит
  const more = root.querySelector<HTMLElement>(".w-more");
  const moreBtn = more?.querySelector<HTMLButtonElement>("button");
  const extra = cards.filter((c) => c.hasAttribute("data-more"));
  function expand(focus: boolean) {
    if (!root.classList.contains("is-cut")) return;
    root.classList.remove("is-cut");
    if (more) more.hidden = true;
    if (!reduced()) {
      let n = 0;
      extra.forEach((el) => {
        if (el.hidden) return;
        el.classList.remove("is-in");
        void el.offsetWidth;
        el.classList.add("is-in");
        el.style.setProperty("--i", String(Math.min(n++, 12)));
      });
    }
    if (focus)
      extra
        .find((el) => !el.hidden)
        ?.querySelector<HTMLElement>(".w-site__name a")
        ?.focus({ preventScroll: true });
  }
  if (more && moreBtn && extra.length) {
    root.classList.add("is-cut");
    more.hidden = false;
    on(moreBtn, "click", () => expand(true));
    groups.forEach((g) => on(g, "click", () => (state.cat || state.pf) && expand(false)));
  }

  // список: миниатюры цветные посреди экрана (палец), превью сайта за курсором (мышь, широкий экран)
  const rows = Array.from(root.querySelectorAll<HTMLElement>(".w-row"));
  if (!finePointer()) offs.push(liveInMiddle(rows.map((r) => r.querySelector(".w-row__thumb")!).filter(Boolean), "-40% 0px -40% 0px"));
  offs.push(peek(root));

  return () => {
    offs.forEach((f) => f());
    root.classList.remove("is-js", "is-cut");
    if (more) more.hidden = true;
    if (box) box.hidden = true;
    all.forEach((el) => {
      el.hidden = false;
      el.classList.remove("is-in");
    });
  };
}

/** превью сайта у курсора над строками списка: один элемент, догоняет курсор с lerp 0.2, только пока есть мышь */
function peek(root: HTMLElement): Off {
  const box = root.querySelector<HTMLElement>(".w-peek");
  const img = box?.querySelector<HTMLImageElement>("img");
  const list = root.querySelector<HTMLElement>(".w-rows");
  const mq = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1100px)");
  if (!box || !img || !list) return () => {};
  const quick = reduced();
  let raf = 0;
  let on = false;
  let row: HTMLElement | null = null;
  let px = 0,
    py = 0,
    x = 0,
    y = 0;

  function place() {
    const w = box!.offsetWidth || 156;
    const h = w * (844 / 390);
    // справа от курсора, а если не влезает, слева; по высоте в пределах окна
    let tx = px + 28;
    if (tx + w > innerWidth - 16) tx = px - 28 - w;
    const ty = Math.min(Math.max(16, py - h * 0.42), innerHeight - h - 16);
    return [tx, ty];
  }
  function frame() {
    raf = 0;
    const [tx, ty] = place();
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    if (Math.abs(tx - x) < 0.3 && Math.abs(ty - y) < 0.3) {
      x = tx;
      y = ty;
    }
    box!.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    if (on && (x !== tx || y !== ty)) raf = requestAnimationFrame(frame);
  }
  function show(r: HTMLElement | null) {
    if (r === row) return;
    row = r;
    if (!r) {
      on = false;
      box!.classList.remove("is-on");
      return;
    }
    const base = r.dataset.img!;
    img!.srcset = `${base}-240.webp 240w, ${base}-400.webp 400w`;
    img!.sizes = "156px";
    img!.src = `${base}-240.webp`;
    if (!on) {
      // первый показ: сразу у курсора, без подлёта через весь экран
      [x, y] = place();
      box!.style.transform = `translate3d(${x}px,${y}px,0)`;
    }
    on = true;
    box!.classList.add("is-on");
  }
  const rowAt = (cx: number, cy: number) => (document.elementFromPoint(cx, cy)?.closest(".w-row") as HTMLElement | null) ?? null;
  const move = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !mq.matches) return;
    px = e.clientX;
    py = e.clientY;
    const r = (e.target as HTMLElement).closest<HTMLElement>(".w-row");
    show(r && !r.hidden ? r : null);
    if (on) {
      if (quick) {
        [x, y] = place();
        box!.style.transform = `translate3d(${x}px,${y}px,0)`;
      } else if (!raf) raf = requestAnimationFrame(frame);
    }
  };
  const leave = () => show(null);
  // прокрутка колесом двигает строки под неподвижным курсором
  const scroll = () => {
    if (on) show(rowAt(px, py));
  };
  list.addEventListener("pointermove", move);
  list.addEventListener("pointerleave", leave);
  addEventListener("scroll", scroll, { passive: true });
  return () => {
    cancelAnimationFrame(raf);
    list.removeEventListener("pointermove", move);
    list.removeEventListener("pointerleave", leave);
    removeEventListener("scroll", scroll);
    box.classList.remove("is-on");
    box.style.transform = "";
  };
}

/* ── разбор ── */

export function runCase(root: HTMLElement): Off {
  const offs: Off[] = [];
  const on = <T extends EventTarget>(t: T, type: string, fn: (e: Event) => void, opt?: AddEventListenerOptions) => {
    t.addEventListener(type, fn, opt);
    offs.push(() => t.removeEventListener(type, fn, opt));
  };
  root.classList.add("is-js");

  const aside = root.querySelector<HTMLElement>(".w-case__aside");
  const card = root.querySelector<HTMLElement>(".w-card--tall");
  const roll = card?.querySelector<HTMLElement>(".w-card__roll");
  const marks = Array.from(card?.querySelectorAll<HTMLElement>(".w-mark") ?? []);
  const items = Array.from(root.querySelectorAll<HTMLElement>(".w-done li.has-pt"));
  const ribbon = root.querySelector<HTMLElement>(".w-crops__list");
  const crops = Array.from(root.querySelectorAll<HTMLElement>(".w-crop"));
  const pinMQ = matchMedia("(min-width: 1000px) and (min-height: 600px)");
  const deskMQ = matchMedia("(min-width: 1000px)");
  const reduce = reduced();
  let pin = false;
  let raf = 0;
  let cur = 0;
  let dead = false;
  let flowOff: Off | null = null;
  /** пункт под мышью или в фокусе и пункт, закреплённый кликом */
  let hover = -1;
  let lock = -1;
  const active = () => (lock >= 0 ? lock : hover);

  /* длинная лента: сначала стоит лёгкий верхний кадр (постер, он и есть LCP), сама лента (сотни КБ)
     подставляется после загрузки страницы и показывается, когда уже разжата; до неё скрин не едет */
  let full = !roll?.dataset.src;
  let long: HTMLImageElement | null = null;
  function loadLong() {
    if (dead) return;
    if (!full && !long && roll) addLong(roll);
    // кадры ленты кропов: тот же файл, что у ленты, запрос один
    crops.forEach((c) => {
      const im = c.querySelector<HTMLImageElement>("img[data-src]");
      if (!im || im.getAttribute("src")) return;
      im.sizes = im.dataset.sizes || "";
      im.srcset = im.dataset.srcset || "";
      im.src = im.dataset.src || "";
    });
  }
  function addLong(roll: HTMLElement) {
    const d = roll.dataset;
    const im = (long = document.createElement("img"));
    im.className = "w-card__long";
    im.alt = "";
    im.decoding = "async";
    im.draggable = false;
    im.width = 390;
    im.height = Number(d.h) || 0;
    im.sizes = d.sizes || "";
    im.srcset = d.srcset || "";
    im.src = d.src || "";
    const done = () => {
      if (dead || full) return;
      full = true;
      card?.classList.add("is-full");
      // сдвиг пишем только там, где скрин ведёт скрипт; на телефоне его ведёт анимация w-roll
      if (pin || (deskMQ.matches && active() >= 0)) apply();
    };
    im.decode().then(done, () => {
      if (im.complete && im.naturalWidth) done();
      else on(im, "load", done, { once: true });
    });
    roll.prepend(im);
  }
  /* не сразу на load: тяжёлая лента не должна попадать в окно LCP (на быстром соединении load наступает
     раньше отрисовки, и PageSpeed считает её частью загрузки). первые ~2 с скрин всё равно стоит
     (пауза в начале w-roll), а прокрутка или касание подгружают ленту сразу */
  let longT = 0;
  const later = () => {
    if (!longT) longT = window.setTimeout(loadLong, 1500);
  };
  if (document.readyState === "complete") later();
  else on(window, "load", later, { once: true });
  on(window, "scroll", loadLong, { passive: true, once: true });
  on(window, "pointerdown", loadLong, { passive: true, once: true });
  offs.push(() => clearTimeout(longT));

  /** доля прокрутки скрина, при которой рамка пункта k стоит посреди карточки */
  function pointTarget(k: number) {
    if (!roll || !card) return 0;
    const m = marks[k];
    const shift = roll.offsetHeight - card.clientHeight;
    if (!m || shift <= 0) return 0;
    const mid = m.offsetTop + m.offsetHeight / 2;
    return Math.min(1, Math.max(0, (mid - card.clientHeight / 2) / shift));
  }
  function scrollTarget() {
    if (!aside || !card) return 0;
    const r = aside.getBoundingClientRect();
    const top = parseFloat(getComputedStyle(card).top) || 0;
    const span = r.height - card.offsetHeight;
    return span > 0 ? Math.min(1, Math.max(0, (top - r.top) / span)) : 0;
  }
  const target = () => (active() >= 0 ? pointTarget(active()) : scrollTarget());
  function apply() {
    if (!roll || !card || !full) return;
    const shift = roll.offsetHeight - card.clientHeight;
    roll.style.transform = `translate3d(0,${(-cur * Math.max(0, shift)).toFixed(1)}px,0)`;
  }
  function frame() {
    raf = 0;
    if (dead || !roll || !card) return;
    const t = target();
    cur += (t - cur) * 0.18;
    if (Math.abs(t - cur) < 0.0005) cur = t;
    apply();
    if (cur !== t) raf = requestAnimationFrame(frame);
  }
  const kick = () => {
    if (dead || raf) return;
    if (pin) raf = requestAnimationFrame(frame);
  };

  // пункт "Что сделано" показывает своё место на скрине: рамка, подпись, скрин доезжает до неё
  function show() {
    const k = active();
    const desk = deskMQ.matches;
    items.forEach((li) => li.classList.toggle("is-on", Number(li.dataset.pt) === k));
    // на телефоне карточка далеко вверху и едет сама: рамки только в ленте кропов
    marks.forEach((m, i) => m.classList.toggle("is-on", desk && i === k));
    root.classList.toggle("is-show", desk && k >= 0);
    if (!desk || !roll) return;
    if (pin) kick();
    else if (k >= 0) {
      // без закрепления (reduce или низкое окно) скрин встаёт на место сразу
      cur = pointTarget(k);
      apply();
    } else roll.style.transform = "";
  }
  /** на телефоне и планшете пункт листает ленту кропов к своему кадру */
  function toCrop(k: number) {
    const c = crops[k];
    if (!c || !ribbon) return;
    const left = c.offsetLeft - (ribbon.clientWidth - c.offsetWidth) / 2;
    ribbon.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
    const r = ribbon.getBoundingClientRect();
    if (r.top < 60 || r.bottom > innerHeight)
      c.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      });
  }
  items.forEach((li) => {
    const k = Number(li.dataset.pt);
    const b = li.querySelector<HTMLButtonElement>("button");
    if (!b) return;
    on(li, "pointerenter", (e) => {
      if ((e as PointerEvent).pointerType !== "mouse" || !deskMQ.matches) return;
      hover = k;
      show();
    });
    on(li, "pointerleave", (e) => {
      if ((e as PointerEvent).pointerType !== "mouse" || hover !== k) return;
      hover = -1;
      show();
    });
    on(b, "focus", () => {
      if (!deskMQ.matches || !b.matches(":focus-visible")) return;
      hover = k;
      show();
    });
    on(b, "blur", () => {
      if (hover !== k) return;
      hover = -1;
      show();
    });
    on(b, "click", () => {
      if (deskMQ.matches) {
        lock = lock === k ? -1 : k;
        b.setAttribute("aria-pressed", String(lock === k));
        items.forEach((x) => x !== li && x.querySelector("button")?.setAttribute("aria-pressed", "false"));
        show();
      } else {
        lock = k;
        show();
        toCrop(k);
      }
    });
  });

  // лента кропов: цветной тот кадр, что посреди ленты; пункт под ним подсвечен
  if (ribbon && crops.length) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          e.target.querySelector(".w-card")?.classList.toggle("is-live", e.isIntersecting);
          // кадр посреди ленты подсвечивает свой пункт в списке
          if (e.isIntersecting && !deskMQ.matches) {
            lock = crops.indexOf(e.target as HTMLElement);
            show();
          }
        }),
      { root: ribbon, rootMargin: "0px -32% 0px -32%" },
    );
    crops.forEach((c) => io.observe(c));
    offs.push(() => {
      io.disconnect();
      crops.forEach((c) => c.querySelector(".w-card")?.classList.remove("is-live"));
    });
  }

  function layout() {
    if (!card || !roll) return;
    pin = pinMQ.matches && !reduce;
    root.classList.toggle("is-pin", pin);
    if (!deskMQ.matches && lock >= 0) {
      // ушли с десктопа: закреплённый пункт ведёт уже ленту, а не карточку
      lock = hover = -1;
      show();
    }
    if (pin) {
      if (flowOff) {
        flowOff();
        flowOff = null;
      }
      card.classList.add("is-live");
      cur = target();
      apply();
    } else {
      roll.style.transform = "";
      if (deskMQ.matches) {
        card.classList.add("is-live");
        if (flowOff) {
          flowOff();
          flowOff = null;
        }
        if (active() >= 0) show();
      } else if (!flowOff) flowOff = liveInMiddle([card], "-22% 0px -22% 0px");
    }
  }

  // карточка проявляется из серого, как в карусели, когда страница уже показалась
  const t0 = window.setTimeout(layout, reduce ? 0 : 450);
  on(window, "scroll", kick, { passive: true });
  on(window, "resize", layout);
  on(pinMQ, "change", layout);
  on(deskMQ, "change", layout);
  offs.push(() => clearTimeout(t0));

  return () => {
    dead = true;
    cancelAnimationFrame(raf);
    offs.forEach((f) => f());
    if (flowOff) flowOff();
    root.classList.remove("is-js", "is-pin", "is-show");
    if (card) card.classList.remove("is-live", "is-full");
    if (roll) roll.style.transform = "";
    if (long) long.remove();
    items.forEach((li) => li.classList.remove("is-on"));
    marks.forEach((m) => m.classList.remove("is-on"));
  };
}
