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

# Eski preview sunucusunu kapat, yenisini başlat.
pkill -f "python3 -m http.server 8000" >/dev/null 2>&1 || true
nohup python3 -m http.server 8000 --bind 0.0.0.0 >/tmp/kacagider-preview.log 2>&1 &
echo $! >/tmp/kacagider-preview.pid

sleep 1
if curl -fsS http://127.0.0.1:8000/ >/dev/null 2>&1; then
  echo "KaçaGider marketplace-test preview hazır: port 8000"
else
  echo "Preview sunucusu başlatılamadı. Log: /tmp/kacagider-preview.log"
fi
