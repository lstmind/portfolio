# 003 — Магнитные кнопки: убрать reflow, добавить возврат, снять постоянный will-change

- **Status**: DONE
- **Commit**: 2023bf2
- **Severity**: HIGH
- **Category**: Performance + Missed opportunity
- **Estimated scope**: 2 файла, ~15 строк

## Problem

`components/ClientFX.tsx:183`:

```tsx
// components/ClientFX.tsx:183 — current
document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
  const s = 18;
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.transform = "translate(" + dx * s + "px," + dy * s + "px)";
  };
  const leave = () => (el.style.transform = "translate(0,0)");
```

1. `getBoundingClientRect()` вызывается на каждом `pointermove` — синхронный layout при каждом движении мыши над кнопкой. Прямоугольник кнопки при этом не меняется: достаточно замерить один раз на входе.
2. Запись в `style.transform` идёт прямо в обработчике события, а не в кадре.
3. `leave` возвращает кнопку в ноль мгновенно, потому что у `.magnet` нет `transition` на transform (`app/globals.css:87` — там только `will-change`). Кнопка плавно едет за курсором и щелчком телепортируется обратно. Это единственное место на сайте, где движение обрывается вместо того, чтобы закончиться.
4. `will-change:transform` висит постоянно, слой композитора удерживается всю жизнь страницы, хотя кнопка двигается только под курсором.

## Target

```css
/* target — app/globals.css:87 */
.magnet{position:relative;display:inline-flex;align-items:center;gap:11px;background:var(--accBtn);color:#fff;padding:18px 32px;font-weight:700;font-size:16px;overflow:hidden;transition:transform .4s cubic-bezier(.16,1,.3,1)}
.magnet.pulling{transition:none;will-change:transform}
```

Возврат едет 400мс по проектной кривой, слежение за курсором остаётся мгновенным: класс `pulling` отключает transition, пока мышь внутри. Асимметрия намеренная — намерение пользователя ведёт кнопку без задержки, отпускание разрешается плавно.

```tsx
// target — components/ClientFX.tsx
document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
  const s = 18;
  let r: DOMRect | null = null;
  let frame = 0;
  const enter = () => {
    r = el.getBoundingClientRect();
    el.classList.add("pulling");
  };
  const move = (e: PointerEvent) => {
    if (!r) r = el.getBoundingClientRect();
    const rect = r;
    if (frame) return;
    frame = raf(() => {
      frame = 0;
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      el.style.transform = "translate(" + dx * s + "px," + dy * s + "px)";
    });
  };
  const leave = () => {
    r = null;
    el.classList.remove("pulling");
    el.style.transform = "translate(0,0)";
  };
  el.addEventListener("pointerenter", enter);
  el.addEventListener("pointermove", move as EventListener);
  el.addEventListener("pointerleave", leave);
  cleanups.push(() => {
    el.removeEventListener("pointerenter", enter);
    el.removeEventListener("pointermove", move as EventListener);
    el.removeEventListener("pointerleave", leave);
  });
});
```

## Repo conventions to follow

- Проектная кривая `cubic-bezier(.16,1,.3,1)` — 14 использований, например `app/globals.css:88`: `.magnet::before{transition:transform .4s cubic-bezier(.16,1,.3,1)}`. Кнопка и её заливка получают одинаковые 400мс и одну кривую.
- Хелпер `raf()` из `ClientFX.tsx:11` сам складывает id в массив для отмены — использовать его, а не голый `requestAnimationFrame`.
- Снятие слушателей всегда идёт в `cleanups`.

## Steps

1. `app/globals.css:87` — убрать `will-change:transform` из `.magnet`, добавить `transition:transform .4s cubic-bezier(.16,1,.3,1)`.
2. `app/globals.css` — сразу после `.magnet` добавить правило `.magnet.pulling{transition:none;will-change:transform}`.
3. `components/ClientFX.tsx:183-197` — заменить блок на вариант из Target.
4. Блок должен остаться внутри `if (!reduce)` из плана 001 — выполнять 001 первым.

## Boundaries

- НЕ менять величину смещения `s = 18`.
- НЕ трогать `.magnet::before` и `.magnet .lab` — заливка при ховере работает верно.
- НЕ навешивать эффект на новые элементы: только существующие `[data-magnet]`.
- НЕ добавлять зависимости.

## Verification

- **Механически**: `npx tsc --noEmit` — без ошибок.
- **Проверка на глаз**:
  - навести на «Обсудить проект», поводить мышью — кнопка тянется за курсором так же мгновенно, как раньше;
  - увести мышь — кнопка возвращается плавно за 400мс, без щелчка;
  - быстро войти и выйти несколько раз подряд — возврат перехватывается новым входом, без рывка;
  - DevTools → Performance, водить мышью над кнопкой 5 секунд: в записи нет повторяющихся Layout-событий (раньше было по одному на каждый pointermove);
  - DevTools → Layers: слой у кнопки появляется на входе и исчезает после возврата.
- **Готово когда**: `getBoundingClientRect` не вызывается в `pointermove`, возврат анимирован.
