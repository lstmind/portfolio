#!/usr/bin/env bash
#
# Деплой портфолио на VPS: релиз в свой каталог → атомарный симлинк →
# перезапуск службы → health-check → откат, если проверка не прошла.
#
# Схема на сервере (как было заведено раньше, не меняем):
#   /srv/lstmind/releases/<метка>/.next/standalone   — сборка целиком
#   /srv/lstmind/current -> releases/<метка>/.next/standalone
#   systemd: node server.js, WorkingDirectory=/srv/lstmind/current, PORT=3000
#
# ВАЖНО ПРО STANDALONE. next build кладёт в .next/standalone сервер и
# зависимости, но НЕ кладёт .next/static и public — их копируем руками, иначе
# сайт поднимется без стилей и без картинок. Это не наша прихоть, так устроен
# сам Next.
#
# Почему tar через ssh, а не rsync: рабочая машина — Windows с Git Bash, rsync
# там нет.
#
#   npm run deploy                 собрать и выложить
#   SKIP_BUILD=1 npm run deploy    выложить уже собранное
#   npm run deploy -- --rollback   вернуться на предыдущий релиз

set -euo pipefail

HOST="${LSTMIND_HOST:-lstmind}"
ROOT="${LSTMIND_ROOT:-/srv/lstmind}"
SERVICE="${LSTMIND_SERVICE:-lstmind}"
URL="${LSTMIND_URL:-https://lstmind.ru}"
KEEP=3

# Соседи на этой же машине: демо не имеют права упасть из-за портфолио.
NEIGHBOURS=("https://nega.lstmind.ru/" "https://stroy.lstmind.ru/")

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
sh_() { ssh -o BatchMode=yes "$HOST" "$@"; }
code_() { curl -s -m 25 -o /dev/null -w '%{http_code}' "$1" || true; }

# ── откат ────────────────────────────────────────────────────────────────
if [[ "${1:-}" == "--rollback" ]]; then
  say "откат на предыдущий релиз"
  sh_ bash -s <<EOF
set -euo pipefail
cd "$ROOT"
cur=\$(readlink current | sed 's#releases/##; s#/.next/standalone##')
prev=\$(ls -1t releases | grep -v "^\$cur\$" | head -1)
[ -n "\$prev" ] || { echo "нет предыдущего релиза"; exit 1; }
ln -sfn "releases/\$prev/.next/standalone" current.tmp && mv -Tf current.tmp current
systemctl restart "$SERVICE"
sleep 4
echo "current -> \$prev"
EOF
  [[ "$(code_ "$URL/")" == "200" ]] && echo "сайт отвечает" || { echo "сайт не отвечает после откáта"; exit 1; }
  exit 0
fi

STAMP="$(date +%Y%m%d-%H%M%S)"

if [[ "${SKIP_BUILD:-}" != "1" ]]; then
  say "сборка"
  npm run build
fi

[ -f .next/standalone/server.js ] || { echo ".next/standalone/server.js не найден — output: 'standalone' в next.config?"; exit 1; }

say "досбор standalone: static и public"
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
echo "  static: $(du -sh .next/standalone/.next/static | cut -f1), public: $(du -sh .next/standalone/public | cut -f1)"

say "выкладка релиза $STAMP ($(du -sh .next/standalone | cut -f1))"
tar -czf - -C .next/standalone . | sh_ "mkdir -p '$ROOT/releases/$STAMP/.next/standalone' && tar -xzf - -C '$ROOT/releases/$STAMP/.next/standalone' && echo распаковано: \$(find '$ROOT/releases/$STAMP' -type f | wc -l) файлов"

say "переключение и перезапуск"
sh_ bash -s <<EOF
set -euo pipefail
cd "$ROOT"
prev=\$(readlink current || true)
ln -sfn "releases/$STAMP/.next/standalone" current.tmp && mv -Tf current.tmp current
systemctl restart "$SERVICE"
sleep 5
systemctl is-active --quiet "$SERVICE" && echo "служба активна"
curl -s -m 10 -o /dev/null -w "  локально: %{http_code}\n" http://127.0.0.1:3000/
echo "current -> releases/$STAMP (было: \${prev:-нет})"
EOF

say "health-check"
fail=0
for p in "/" "/robots.txt" "/sitemap.xml" "/img/tall/stroy.jpg"; do
  c=$(code_ "$URL$p"); printf '  %-26s %s\n' "$p" "$c"
  [[ "$c" == "200" ]] || fail=1
done

say "соседи на этой же машине"
for u in "${NEIGHBOURS[@]}"; do
  c=$(code_ "$u"); printf '  %-26s %s\n' "$u" "$c"
  [[ "$c" == "200" ]] || fail=1
done

if [[ "$fail" == "1" ]]; then
  echo "проверка не прошла — откатываюсь"
  bash "$0" --rollback
  exit 1
fi

say "уборка старых релизов (держим $KEEP)"
sh_ bash -s <<EOF
set -euo pipefail
cd "$ROOT/releases"
cur=\$(readlink "$ROOT/current" | sed 's#releases/##; s#/.next/standalone##')
ls -1t | grep -v "^\$cur\$" | tail -n +$KEEP | xargs -r rm -rf
du -sh "$ROOT" | cut -f1
ls -1t
EOF

say "готово: $URL"
