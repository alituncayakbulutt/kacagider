#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# Yalnızca çalışma ağacı temizse marketplace-test branch'ini güvenli biçimde güncelle.
if git diff --quiet && git diff --cached --quiet; then
  git fetch origin marketplace-test
  git checkout marketplace-test
  git pull --ff-only origin marketplace-test
fi

# Eski preview sunucusunu kapat, yenisini başlat.
pkill -f "python3 -m http.server 8000" >/dev/null 2>&1 || true
nohup python3 -m http.server 8000 --bind 0.0.0.0 >/tmp/kacagider-preview.log 2>&1 &
echo $! >/tmp/kacagider-preview.pid

echo "KaçaGider marketplace-test preview hazır: port 8000"
