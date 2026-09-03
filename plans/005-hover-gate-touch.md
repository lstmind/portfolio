# 005 — Закрыть ховер-эффекты от тач-устройств

- **Status**: DONE
- **Commit**: 2023bf2
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 файл, обёртка вокруг существующих правил

## Problem

Ни одно `:hover`-правило в `app/globals.css` не закрыто медиазапросом `(hover: hover)`. На тач-экране браузер выдаёт синтетический ховер по тапу и **оставляет его висеть** до тапа в другом месте.

Самое заметное — карточка работы (`app/globals.css:216-224`):

```css
/* app/globals.css:216 — current */
.work:hover{border-color:var(--line2);transform:translateY(-5px)}
.work:hover .shot img.tall{transform:translateY(calc(-100% + 100cqh));filter:grayscale(0) brightness(1);transition:transform 9s cubic-bezier(.3,.35,.4,.9),filter .5s,opacity .5s ease}
.work:hover .openbadge{opacity:1;transform:none}
```

Человек с телефона тапает по карточке, чтобы открыть кейс: карточка подпрыгивает на 5px и остаётся приподнятой, бейдж «Разбор проекта» проявляется и не гаснет. При этом на тач уже работает отдельный автопроезд лент через класс `.auto` (`WorksFeatured.tsx:42`), то есть ховер-вариант там лишний по определению.

Тот же эффект у `.pain .p:hover` (:159), `.svc .card:hover` (:165), `.step:hover` (:198), `.widx-list a:hover` (:262), `.rev:hover` (:281), `.fqsum:hover` (:310), `.contact .direct a:hover` (:341).

Что проблему уже ловили, видно по точечному костылю на `app/globals.css:167`:

```css
/* app/globals.css:167 — current */
@media(hover:none){.svc .card-go{opacity:1;transform:none}}
```

Он чинит один элемент из десяти, лечит следствие, а не причину.

## Target

Все правила, которые **двигают или проявляют** элемент по ховеру, уезжают в:

```css
@media (hover: hover) and (pointer: fine) {
  .work:hover{border-color:var(--line2);transform:translateY(-5px)}
  .work:hover .shot img.tall{...}
  .work:hover .openbadge{opacity:1;transform:none}
  .pain .p:hover .p-shot img{transform:scale(1.04)}
  .step:hover > *{transform:translateX(18px)}
  .widx-list a:hover > *:not(.ar){transform:translateX(14px)}
  .widx-list a:hover .ar{transform:translate(3px,-3px);color:var(--acc)}
  .rev:hover > *{transform:translateX(14px)}
  .fqsum:hover > span:first-child{transform:translateX(14px)}
  .contact .direct a:hover > *:not(.pull){transform:translateX(10px)}
  .ghost:hover .ar{transform:translate(4px,4px)}
  .logo:hover .sq{transform:rotate(135deg)}
  .svc .card:hover::after{transform:scaleX(1)}
  .svc .card:hover .card-bg{opacity:1;transform:scale(1.04)}
  .magnet:hover::before{transform:translateY(0)}
}
```

Смена **только цвета или фона** остаётся снаружи: на тапе она читается как отклик на нажатие и не залипает заметно (`.nav-r a.l:hover{color:var(--ink)}`, `.pain .p:hover{border-color:var(--acc)}`, `.step:hover{background:...}` и подобные).

После этого костыль `@media(hover:none){.svc .card-go{...}}` на строке 167 становится не нужен: базовое состояние `.card-go` можно сделать видимым, а скрытие перенести внутрь hover-блока. Проще и честнее оставить его как есть — он не мешает; решение за исполнителем, но если оставляешь, не дублируй логику.

## Repo conventions to follow

- Медиазапросы в файле пишутся без пробела после `@media` для коротких условий (`@media(hover:none)`, `@media(max-width:920px)`) и с пробелом для длинных (`@media (prefers-reduced-motion: reduce)`, `app/globals.css:426`). Для нового длинного условия использовать вариант с пробелом.
- Блок `@media (prefers-reduced-motion: reduce)` на строке 426 — образец того, как в этом файле группируют правила по условию: комментарий строкой выше, правила в одном блоке.

## Steps

1. В конце `app/globals.css`, **до** блока `@media (prefers-reduced-motion: reduce)`, добавить блок `@media (hover: hover) and (pointer: fine)` с комментарием на русском в стиле файла.
2. Перенести в него перечисленные в Target правила, вырезав их с исходных мест.
3. Проверить, что `.work:hover .shot img.tall` переехало целиком, вместе со своим переопределением `transition`.
4. Проверить, что в блоке `@media (prefers-reduced-motion: reduce)` строка `.work:hover .shot img.tall{transform:none!important}` (`:433`) осталась на месте и по-прежнему перебивает новый блок — она объявлена ниже и с `!important`.

## Boundaries

- НЕ менять сами значения transform, длительности и кривые — только область действия правил.
- НЕ переносить правила, меняющие только цвет, фон или border-color.
- НЕ трогать `@media(max-width:920px)` и мобильную вёрстку.
- НЕ трогать разметку компонентов.

## Verification

- **Механически**: `npm run build` — сборка проходит.
- **Проверка на глаз**:
  - DevTools → эмуляция iPhone (тач включён), тапнуть по карточке работы и вернуться назад: карточка не приподнята, бейдж не висит;
  - там же тапнуть по строке списка работ — текст не сдвинут вправо;
  - на десктопе все ховеры работают ровно как раньше;
  - на реальном телефоне пройти главную сверху донизу, тапая по карточкам боли, услуг и шагам процесса — ни один элемент не остаётся в сдвинутом состоянии.
- **Готово когда**: на устройстве без точного указателя ни одно css-правило не смещает элемент по `:hover`.
