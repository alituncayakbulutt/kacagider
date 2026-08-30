from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")

REPLACEMENTS = [
    (re.compile(r"KaçaGider marka merkezi, \d+ gerçek model sayfasını"), "KaçaGider marka merkezi, mevcut gerçek model sayfalarını"),
    (re.compile(r"Bu merkezde \d+ gerçek ([^;\"]+?) modeli bulunur;"), r"Bu merkezde gerçek \1 modelleri birlikte incelenebilir;"),
    (re.compile(r"ailesindeki \d+ gerçek modeli"), "ailesindeki gerçek modelleri"),
    (re.compile(r"Bu sayfadaki \d+ gerçek modelden"), "Bu sayfadaki gerçek modellerden"),
]


def sanitize(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    updated = text
    for pattern, replacement in REPLACEMENTS:
        updated = pattern.sub(replacement, updated)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main():
    changed = []
    for category in DEVICE_ROOTS:
        base = ROOT / category
        if not base.exists():
            continue
        for path in sorted(base.glob("*/index.md")):
            if sanitize(path):
                changed.append(path.relative_to(ROOT))
        for path in sorted(base.glob("*/*/index.md")):
            text = path.read_text(encoding="utf-8")
            if 'seo_page_type: "series_hub"' not in text:
                continue
            if sanitize(path):
                changed.append(path.relative_to(ROOT))
    print(f"Evergreen copy sanitizer: {len(changed)} file(s) updated")


if __name__ == "__main__":
    main()
