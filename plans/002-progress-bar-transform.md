# 002 — Прогресс-бар: width → transform, убрать reflow на скролле

- **Status**: DONE
- **Commit**: 2023bf2
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 2 файла, ~12 строк

## Problem

`components/ClientFX.tsx:203`:

```tsx
// components/ClientFX.tsx:203 — current
on("scroll", () => {
  hdr?.classList.toggle("solid", scrollY > 40);
  if (prog) {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (scrollY / h) * 100 + "%";
  }
});
```

Три проблемы в шести строках:

1. `width` анимируется на каждом событии скролла — это layout + paint + composite вместо одного composite у `transform`.
2. `document.documentElement.scrollHeight` читается внутри обработчика скролла — форсированный синхронный layout на каждое событие, прямо перед записью в стиль. Классический layout thrashing: чтение → запись → чтение → запись.
3. Обработчик зарегистрирован без `{ passive: true }` — хелпер `on` на `ClientFX.tsx:19` не передаёт опции, браузер обязан ждать возможного `preventDefault`.

Сайт заявляет скорость частью продукта (`PRODUCT.md`), а это самый горячий обработчик на странице.

## Target

```css
/* target — app/globals.css:37 */
.progress{position:fixed;top:0;left:0;height:2px;width:100%;background:var(--ink);opacity:.55;z-index:70;transform:scaleX(0);transform-origin:0 50%;will-change:transform}
```

```tsx
// target — components/ClientFX.tsx
let docH = Math.max(1, document.documentElement.scrollHeight - innerHeight);
const measure = () => {
  docH = Math.max(1, document.documentElement.scrollHeight - innerHeight);
};
on("resize", measure);
const ro = new ResizeObserver(measure);
ro.observe(document.body);
cleanups.push(() => ro.disconnect());

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  raf(() => {
    ticking = false;
    hdr?.classList.toggle("solid", scrollY > 40);
    if (prog) prog.style.transform = "scaleX(" + Math.min(scrollY / docH, 1) + ")";
  });
};
window.addEventListener("scroll", onScroll, { passive: true });
cleanups.push(() => window.removeEventListener("scroll", onScroll));
onScroll();
```

`will-change:transform` здесь оправдан и постоянен: элемент меняется на каждом скролле всю жизнь страницы, в отличие от `.magnet` (см. план 003).

## Repo conventions to follow

- `passive: true` уже применяется правильно в `components/MobileNav.tsx:31` — имитировать этот стиль.
- rAF-троттлинг с флагом уже используется в webgl-цикле, `ClientFX.tsx:130` (`now - last < 33`).
- Все слушатели складывают снятие в `cleanups` — сохранить.

## Steps

1. `app/globals.css:37` — заменить `width:0` на `width:100%`, добавить `transform:scaleX(0);transform-origin:0 50%;will-change:transform`.
2. `components/ClientFX.tsx:203-209` — заменить обработчик на вариант из Target.
3. Убедиться, что `ro.disconnect()` и снятие слушателя попали в `cleanups`.

## Boundaries

- НЕ трогать второй scroll-обработчик на `ClientFX.tsx:126` (`heroVis`) — он в плане 004.
- НЕ менять внешний вид полосы: та же высота 2px, тот же цвет, та же прозрачность.
- НЕ добавлять зависимости.

## Verification

- **Механически**: `npx tsc --noEmit` — без ошибок.
- **Проверка на глаз**:
  - полоса вверху растёт слева направо как раньше, в конце страницы доходит до края;
  - DevTools → Performance, запись прокрутки главной: в записи нет Layout-событий от scroll-обработчика, только Composite;
  - раскрыть список работ кнопкой «Показать ещё» — полоса пересчитывается под новую высоту документа.
- **Готово когда**: в обработчике скролла нет ни одного чтения геометрии документа.
