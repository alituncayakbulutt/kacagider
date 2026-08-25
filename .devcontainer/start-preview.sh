#!/usr/bin/env bash
set -u

cd "$(git rev-parse --show-toplevel)"

# Codespaces ortamında git-lfs kurulu olmayabildiği için hook'ları bu otomatik güncellemede devre dışı bırak.
# Çalışma ağacı temizse marketplace-test branch'ini güvenli biçimde güncelle.
if git diff --quiet && git diff --cached --quiet; then
  git fetch origin marketplace-test || true
  current_branch="$(git branch --show-current 2>/dev/null || true)"
  if [ "$current_branch" != "marketplace-test" ]; then
    git -c core.hooksPath=/dev/null checkout marketplace-test || true
  fi
  git -c core.hooksPath=/dev/null pull --ff-only origin marketplace-test || true
fi

# Eski preview sunucusunu kapat.
pkill -f "http.server 8000" >/dev/null 2>&1 || true
pkill -f "http-server.*8000" >/dev/null 2>&1 || true
pkill -f "php -S 0.0.0.0:8000" >/dev/null 2>&1 || true

LOG=/tmp/kacagider-preview.log
: > "$LOG"

# Ortamda bulunan ilk uygun statik sunucuyu kullan.
if command -v python3 >/dev/null 2>&1; then
  nohup python3 -m http.server 8000 --bind 0.0.0.0 >"$LOG" 2>&1 &
elif command -v python >/dev/null 2>&1; then
  nohup python -m http.server 8000 --bind 0.0.0.0 >"$LOG" 2>&1 &
elif command -v php >/dev/null 2>&1; then
  nohup php -S 0.0.0.0:8000 -t . >"$LOG" 2>&1 &
elif command -v npx >/dev/null 2>&1; then
  nohup npx --yes http-server . -p 8000 -a 0.0.0.0 >"$LOG" 2>&1 &
else
  echo "Uygun statik sunucu bulunamadı." | tee -a "$LOG"
  exit 1
fi

echo $! >/tmp/kacagider-preview.pid

for i in 1 2 3 4 5; do
  if curl -fsS http://127.0.0.1:8000/ >/dev/null 2>&1; then
    echo "KaçaGider marketplace-test preview hazır: port 8000"
    exit 0
  fi
  sleep 1
done

echo "Preview sunucusu başlatılamadı. Log: $LOG"
cat "$LOG" || true
exit 1
