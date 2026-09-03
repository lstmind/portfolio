# 006 — Кривые и длительности: токены, вход на ease-out, выход прелоадера

- **Status**: DONE
- **Commit**: 2023bf2
- **Severity**: MEDIUM
- **Category**: Easing & duration + Cohesion
- **Estimated scope**: 1 файл, ~8 правок

## Problem

**1. Выход прелоадера стартует медленно** — `app/globals.css:41`:

```css
/* app/globals.css:41 — current */
.pre.done{transform:translateY(-100%);transition:transform .9s cubic-bezier(.76,0,.24,1)}
```

`cubic-bezier(.76,0,.24,1)` — симметричная кривая с медленным началом. Это **выход**, а выход всегда идёт `ease-out`: он должен стартовать быстро. Сейчас первое движение на сайте начинается вязко, и это первое, что видит человек на первом визите.

**2. Четыре входные анимации едут на голом `ease`** — `app/globals.css:83, 86, 94, 134`:

```css
/* current */
.sub{...;animation:fade 1s ease .55s forwards}
.cta-row{...;animation:fade 1s ease .68s forwards}
.facts{...;animation:fade 1s ease .82s forwards}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s cubic-bezier(.16,1,.3,1)}
```

Вход — это `ease-out`. У `.reveal` при этом transform уже едет по правильной кривой, а opacity рядом по встроенной `ease`: две половины одного движения расходятся.

**3. Стаггер строк заголовка по 100мс** — `app/globals.css:75`:

```css
/* app/globals.css:75 — current */
h1 .ln:nth-child(1) i{animation-delay:.05s}h1 .ln:nth-child(2) i{animation-delay:.15s}h1 .ln:nth-child(3) i{animation-delay:.25s}
```

Рабочий диапазон стаггера 30–80мс. На 100мс три строки читаются как три отдельных события вместо одного движения.

**4. Курсор меняет размер за 250мс** — `app/globals.css:378`:

```css
/* app/globals.css:378 — current */
.cursor::before{...;transition:transform .25s,background .25s}
```

Это ховер-фидбек, который человек вызывает десятки раз за визит. Бюджет для такого — 100–160мс.

**5. Кривая `cubic-bezier(.16,1,.3,1)` продублирована 14 раз** руками. Разошедшиеся копии одной кривой — типовая причина рассинхрона при правках.

## Target

```css
/* target — app/globals.css, в :root */
:root{
  ...
  --ease-out:cubic-bezier(.16,1,.3,1);
  --ease-exit:cubic-bezier(.32,.72,0,1);
}
```

```css
/* target */
.pre.done{transform:translateY(-100%);transition:transform .9s var(--ease-exit)}
.sub{...;animation:fade 1s var(--ease-out) .55s forwards}
.cta-row{...;animation:fade 1s var(--ease-out) .68s forwards}
.facts{...;animation:fade 1s var(--ease-out) .82s forwards}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .8s var(--ease-out),transform .8s var(--ease-out)}
h1 .ln:nth-child(1) i{animation-delay:.04s}h1 .ln:nth-child(2) i{animation-delay:.08s}h1 .ln:nth-child(3) i{animation-delay:.12s}
.cursor::before{...;transition:transform .14s,background .14s}
```

`--ease-out` намеренно берёт уже принятую в проекте `cubic-bezier(.16,1,.3,1)`, а не подставляет новую: правка про консолидацию, а не про смену характера движения. `--ease-exit: cubic-bezier(.32,.72,0,1)` — iOS-подобная кривая для уезда шторки, стартует сразу.

## Repo conventions to follow

- Токены живут в `:root` в начале `app/globals.css:5-10`, значения без пробелов, комментарий на русском рядом (см. `--accBtn` со строкой про контраст) — добавлять туда же и в том же стиле.
- `cubic-bezier(.16,1,.3,1)` — де-факто стандарт проекта, 14 использований, например `app/globals.css:88`.

## Steps

1. `app/globals.css:5-10` — добавить в `:root` два токена из Target с коротким комментарием.
2. `app/globals.css:41` — заменить кривую прелоадера на `var(--ease-exit)`.
3. `app/globals.css:83, 86, 94` — заменить `ease` на `var(--ease-out)` в трёх `animation: fade`.
4. `app/globals.css:134` — в `.reveal` заменить обе кривые на `var(--ease-out)`.
5. `app/globals.css:75` — задержки на .04s / .08s / .12s.
6. `app/globals.css:378` — `.25s` → `.14s` в обоих свойствах.
7. Заменить оставшиеся вхождения `cubic-bezier(.16,1,.3,1)` на `var(--ease-out)` по всему файлу. Проверить: `grep -c "cubic-bezier(.16,1,.3,1)" app/globals.css` должно вернуть 0.

## Boundaries

- НЕ трогать `cubic-bezier(.3,.35,.4,.9)` на `app/globals.css:223` — это отдельная кривая девятисекундного проезда по скриншоту, у неё своя задача.
- НЕ менять длительности, кроме курсора (шаг 6): 800мс у `.reveal`, 900мс у прелоадера и 1s у `fade` остаются.
- НЕ трогать `app/doc.css` в этом плане.
- НЕ добавлять зависимости.

## Verification

- **Механически**: `npm run build` — проходит. `grep -c "cubic-bezier(.16,1,.3,1)" app/globals.css` → 0.
- **Проверка на глаз**:
  - очистить sessionStorage, перезагрузить главную: сплэш уезжает вверх, начиная движение сразу, без вязкого старта;
  - три строки заголовка читаются как одно движение, а не как три отдельных;
  - DevTools → Animations, замедлить до 10%: у `.reveal` прозрачность и сдвиг идут синхронно, не расходясь к концу;
  - навести на карточку работы — красный кружок курсора увеличивается заметно резче, чем раньше, без задержки.
- **Готово когда**: в `app/globals.css` нет кривой `ease` на входных анимациях и нет захардкоженной `cubic-bezier(.16,1,.3,1)`.
