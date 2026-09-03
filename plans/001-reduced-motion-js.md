# 001 — Погасить js-движение при prefers-reduced-motion

- **Status**: DONE
- **Commit**: 2023bf2
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 файл, ~4 строки

## Problem

Блок `@media (prefers-reduced-motion: reduce)` в `app/globals.css:426` глушит css-анимации,
но два эффекта пишут `transform` напрямую в `element.style`, и css их не перебивает.

**Магнитные кнопки** — `components/ClientFX.tsx:183`:

```tsx
// components/ClientFX.tsx:183 — current
document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
  const s = 18;
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    ...
    el.style.transform = `translate(${dx * s}px,${dy * s}px)`;
  };
```

Переменная `reduce` в этом файле уже вычислена на строке 8, но здесь не используется.
Человек, попросивший систему убрать анимации, всё равно получает кнопку, которая ездит за курсором.

**Кастомный курсор** — `components/ClientFX.tsx:154`:

```tsx
// components/ClientFX.tsx:154 — current
const cur = document.getElementById("cursor");
if (cur && !matchMedia("(max-width:920px)").matches) {
```

При reduce css прячет элемент (`globals.css:434`), но rAF-луп `cloop` продолжает вечно
писать transform в невидимый div — расход батареи без единого пикселя на экране.

## Target

```tsx
// target — components/ClientFX.tsx:154
const cur = document.getElementById("cursor");
if (cur && !reduce && !matchMedia("(max-width:920px)").matches) {

// target — components/ClientFX.tsx:183
if (!reduce) {
  document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
    ...
  });
}
```

Ничего больше не меняется: при reduce кнопка остаётся кликабельной, ховер-заливка
`.magnet::before` продолжает работать (css сам сокращает её до .15s), пропадает только
слежение за курсором.

## Repo conventions to follow

- Флаг уже есть: `const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;` — `ClientFX.tsx:8`
- Экземпляр правильного гейта: Lenis на `ClientFX.tsx:26` — `if (!reduce && !coarse)`
- Второй экземпляр: автопроезд лент в `WorksFeatured.tsx:42` — `if (matchMedia("(pointer: coarse)").matches && !reduce ...)`

## Steps

1. `components/ClientFX.tsx:155` — добавить `!reduce &&` в условие блока кастомного курсора.
2. `components/ClientFX.tsx:183` — обернуть весь блок `[data-magnet]` в `if (!reduce) { ... }`, сохранив регистрацию cleanup-функций внутри.

## Boundaries

- НЕ трогать блок `@media (prefers-reduced-motion: reduce)` в css — он корректен.
- НЕ убирать эффекты для обычного режима.
- НЕ добавлять зависимости.

## Verification

- **Механически**: `npx tsc --noEmit` — без ошибок.
- **Проверка на глаз**: DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce, перезагрузить:
  - кнопка "Обсудить проект" не смещается при движении мыши над ней;
  - нативный курсор виден, красный кружок отсутствует;
  - в Performance-профиле нет непрерывного rAF-таска, пока страница простаивает.
- **Готово когда**: при reduce ни один `style.transform` не пишется из ClientFX.
