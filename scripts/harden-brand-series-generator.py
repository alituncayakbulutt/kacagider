from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "scripts/expand-brand-series-hubs.py"

PATCHES = [
    (
        '("apple-watch-se-serisi", "Apple Watch SE Serisi", r"^Apple Watch SE"),',
        '("apple-watch-se-serisi", "Apple Watch SE Serisi", r"^Apple Watch SE(?:\\s|$)"),',
        "Apple Watch SE boundary",
    ),
    (
        '    series_name = f"{brand} {series[\'label\']}"\n',
        '    series_label = series["label"]\n    series_name = series_label if series_label.casefold().startswith(brand.casefold()) else f"{brand} {series_label}"\n',
        "series display name de-duplication",
    ),
    (
        '            "label": f"{brand} {item[\'label\']} ikinci el fiyatları",\n',
        '            "label": f"{item[\'label\'] if item[\'label\'].casefold().startswith(brand.casefold()) else brand + \' \' + item[\'label\']} ikinci el fiyatları",\n',
        "brand guide label de-duplication",
    ),
    (
        '        "label": f"{brand} {series[\'label\']} fiyatlarını karşılaştır",\n',
        '        "label": f"{series[\'label\'] if series[\'label\'].casefold().startswith(brand.casefold()) else brand + \' \' + series[\'label\']} fiyatlarını karşılaştır",\n',
        "model-to-series label de-duplication",
    ),
]


def main():
    text = TARGET.read_text(encoding="utf-8")
    changed = False
    print("SEO3 GENERATOR HARDENING")
    for old, new, label in PATCHES:
        if new in text:
            print(f"  {label}: already-safe")
            continue
        if old not in text:
            raise RuntimeError(f"Expected generator patch anchor missing: {label}")
        text = text.replace(old, new, 1)
        changed = True
        print(f"  {label}: patched")
    if changed:
        TARGET.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
