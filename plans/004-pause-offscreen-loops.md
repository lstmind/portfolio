# 004 — Остановить бесконечные анимации за пределами экрана

- **Status**: DONE
- **Commit**: 2023bf2
- **Severity**: MEDIUM
- **Category**: Purpose & frequency + Performance
- **Estimated scope**: 2 файла, ~25 строк

## Problem

На странице три анимации с `infinite`, ни одна не знает, видит ли её человек.

**Глитч заголовка** — `components/ClientFX.tsx:293`:

```tsx
// components/ClientFX.tsx:293 — current
if (!reduce && h1) {
  let glTimer: ReturnType<typeof setTimeout>;
  const gloop = () => {
    h1.classList.add("glitchon");
    setTimeout(() => h1.classList.remove("glitchon"), 240);
    glTimer = setTimeout(gloop, 2800 + ((Math.random() * 2800) | 0));
  };
  gloop();
```

Цикл сам себя перезапускает каждые 2.8–5.6 секунды и не останавливается никогда. Человек читает кейс на пятом экране, а в фоне продолжают дёргаться два псевдоэлемента с `animation: gl1 .5s steps(2) infinite` (`app/globals.css:79-80`). Рядом, в webgl-цикле, такая проверка сделана правильно — `heroVis` на `ClientFX.tsx:126`. Глитч её не использует. Вложенный `setTimeout` на снятие класса ещё и не попадает в cleanup.

**Две бегущие строки** — `app/globals.css:103` и `app/globals.css:203`:

```css
/* app/globals.css:103 — current */
.marq .track{display:flex;width:max-content;animation:scroll 15s linear infinite}
/* app/globals.css:203 — current */
.band .bt{display:flex;width:max-content;animation:scroll 20s linear infinite;font-size:clamp(50px,10vw,130px);...}
```

`.band .bt` — текст размером до 130px шириной `max-content`. Композитинг не прекращается, пока открыта вкладка, независимо от того, в кадре лента или нет. Пауза есть только на ховер (`app/globals.css:104`).

По каталогу это категория 1: бесконечная декоративная анимация вне зоны внимания не имеет назначения. Экономнее не «убрать», а «остановить, когда не видно».

## Target

```css
/* target — app/globals.css, рядом с .marq .track */
.marq .track,.band .bt{animation-play-state:paused}
.marq.vis .track,.band.vis .bt{animation-play-state:running}
.marq:hover .track{animation-play-state:paused}
```

```tsx
// target — components/ClientFX.tsx, вместо блока glitch
if (!reduce && h1) {
  let glTimer: ReturnType<typeof setTimeout> | undefined;
  let offTimer: ReturnType<typeof setTimeout> | undefined;
  let heroOn = true;
  const gloop = () => {
    if (heroOn && !document.hidden) {
      h1.classList.add("glitchon");
      offTimer = setTimeout(() => h1.classList.remove("glitchon"), 240);
    }
    glTimer = setTimeout(gloop, 2800 + ((Math.random() * 2800) | 0));
  };
  const heroIO = new IntersectionObserver(
    (es) => es.forEach((e) => {
      heroOn = e.isIntersecting;
      if (!heroOn) h1.classList.remove("glitchon");
    }),
    { threshold: 0.2 }
  );
  heroIO.observe(h1);
  gloop();
  cleanups.push(() => {
    clearTimeout(glTimer);
    clearTimeout(offTimer);
    heroIO.disconnect();
  });
}

// target — общий наблюдатель для бегущих строк
const loopIO = new IntersectionObserver(
  (es) => es.forEach((e) => e.target.classList.toggle("vis", e.isIntersecting)),
  { threshold: 0 }
);
document.querySelectorAll(".marq, .band").forEach((el) => loopIO.observe(el));
cleanups.push(() => loopIO.disconnect());
```

Ленты стартуют паузой и включаются, только попав в кадр. Класс `vis` вешается на контейнер, а не на трек, чтобы ховер-пауза (`.marq:hover .track`) продолжала перебивать его по каскаду.

## Repo conventions to follow

- IntersectionObserver уже используется дважды в этом же файле и рядом: `ClientFX.tsx:262` (reveal) и `WorksFeatured.tsx:45` (автопроезд лент), оба с `io.disconnect()` в cleanup — имитировать.
- Приём «пауза классом» уже применён в `app/globals.css:225-226`: `.auto{animation-play-state:paused}` / `.auto.play{animation-play-state:running}`. Здесь ровно тот же приём.

## Steps

1. `app/globals.css:103` — оставить объявление анимации, добавить рядом правила паузы и класса `.vis` из Target; правило `.marq:hover .track` должно идти после них.
2. `app/globals.css:203` — то же для `.band .bt` (само объявление не трогать, только добавить управление состоянием).
3. `components/ClientFX.tsx:293-300` — заменить блок глитча на вариант из Target.
4. `components/ClientFX.tsx` — добавить общий `loopIO` для `.marq` и `.band` рядом с существующим reveal-наблюдателем.

## Boundaries

- НЕ менять длительности 15s и 20s и саму кейфрейм-анимацию `scroll`.
- НЕ менять частоту глитча и его 240мс.
- НЕ трогать `@media (prefers-reduced-motion: reduce)` — там ленты уже глушатся насовсем.
- НЕ добавлять зависимости.

## Verification

- **Механически**: `npx tsc --noEmit` — без ошибок.
- **Проверка на глаз**:
  - открыть главную, не скроллить: заголовок глитчит как раньше, верхняя лента едет;
  - пролистать до секции контактов, подождать 15 секунд: заголовок не глитчит (проверить в Elements — класс `glitchon` не появляется);
  - DevTools → Performance, запись 10 секунд внизу страницы: нет периодических всплесков Composite от лент и псевдоэлементов;
  - вернуться наверх — обе ленты продолжают с того места, где остановились, без рывка;
  - ховер по верхней ленте по-прежнему её останавливает.
- **Готово когда**: ни одна `infinite`-анимация не проигрывается, пока её контейнер вне вьюпорта.

## Отклонение при исполнении

Правила паузы пришлось поставить **после** объявления `.band .bt`, а не рядом с `.marq .track`, как написано в Steps. Причина: шорткат `animation:scroll 20s linear infinite` сбрасывает `animation-play-state` в `running`, и объявленное выше правило паузы им перебивалось. При первой проверке `.marq` вставал на паузу, а `.band` продолжал крутиться. Оба правила теперь идут сразу под `.band .bt` с комментарием, объясняющим порядок.
