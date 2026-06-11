# lstmind — сайт-портфолио

Личный сайт веб-разработчика Алексея (lstmind). Next.js 16 (App Router, SSG), тёмная тема, WebGL-герой, форма заявки в Telegram.

## Запуск локально

```bash
npm install
cp .env.example .env.local   # впиши токен бота и chat_id
npm run dev                  # http://localhost:3000
```

## Переменные окружения

| Переменная | Зачем |
|------------|-------|
| `TELEGRAM_BOT_TOKEN` | токен бота от @BotFather — форма шлёт заявки в Telegram |
| `TELEGRAM_CHAT_ID` | твой chat_id (куда приходят заявки) |
| `NEXT_PUBLIC_SITE_URL` | боевой URL сайта (для OG/мета/sitemap). Напр. `https://lstmind.ru` |

`.env.local` в гит не коммитится (секреты).

## Контент

Весь текст, услуги, кейсы и FAQ — в одном файле `lib/content.ts`. Меняешь там — меняется на сайте. Скриншоты кейсов — в `public/img/`.

## Деплой на Vercel

1. Запушить репозиторий на GitHub.
2. На [vercel.com](https://vercel.com) → New Project → импортировать репозиторий.
3. В Project Settings → Environment Variables добавить три переменные из таблицы выше.
4. Deploy. Vercel сам определит Next.js.

После выдачи домена — выставить `NEXT_PUBLIC_SITE_URL` на боевой адрес и сделать redeploy.

## Структура

- `app/` — layout, page, globals.css, OG-картинка, sitemap/robots, `api/contact` (форма → Telegram)
- `components/` — `ClientFX` (весь интерактив: WebGL, курсор, прелоадер), секционные клиент-компоненты
- `lib/content.ts` — контент проекта
- `design-concepts/` — исходные статичные макеты (черновики направления)
