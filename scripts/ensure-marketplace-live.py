from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"

SCRIPTS = [
    '<script src="/assets/marketplace-details.js" defer></script>',
    '<script src="/assets/marketplace-nav-test.js" defer></script>',
    '<script src="/assets/marketplace-test.js" defer></script>',
]

text = INDEX.read_text(encoding="utf-8")

# Eski/dağınık aynı script referanslarını önce tekilleştir.
for tag in SCRIPTS:
    text = text.replace(tag + "\n", "").replace(tag, "")

marker = "</body>"
if marker not in text:
    raise SystemExit("index.html içinde </body> bulunamadı")

block = "\n<!-- KaçaGider Marketplace Production -->\n" + "\n".join(SCRIPTS) + "\n"
text = text.replace(marker, block + marker, 1)
INDEX.write_text(text, encoding="utf-8")

# Son doğrulama: üç üretim scripti tek kez bulunmalı.
final = INDEX.read_text(encoding="utf-8")
for tag in SCRIPTS:
    if final.count(tag) != 1:
        raise SystemExit(f"Marketplace script bağlantısı hatalı: {tag}")

print("Marketplace ana sayfa script bağlantıları hazır.")
