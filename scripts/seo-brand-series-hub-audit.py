from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
MARKER = "brand-series-v1"
SERIES_PAGE_TYPE = "series_hub"
MIN_SERIES_MODELS = 3


def normalize(value: str) -> str:
    value = str(value or "").lower()
    value = value.translate(str.maketrans({"ı": "i", "ğ": "g", "ü": "u", "ş": "s", "ö": "o", "ç": "c"}))
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def read_meta(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}
    out = {}
    for line in text[4:end].splitlines():
        if ": " not in line:
            continue
        key, raw = line.split(": ", 1)
        try:
            out[key] = json.loads(raw)
        except json.JSONDecodeError:
            out[key] = raw.strip('"')
    return out


def visible_text(meta: dict) -> str:
    keys = (
        "seo_title", "seo_description", "seo_h1", "seo_intro", "seo_context_heading",
        "seo_context", "seo_sections", "seo_faqs", "seo_links_heading", "seo_guides_heading",
    )
    return normalize(" ".join(json.dumps(meta.get(k, ""), ensure_ascii=False) for k in keys))


def main() -> int:
    errors = []
    brand_count = Counter()
    series_count = Counter()
    series_model_count = Counter()
    series_urls = []
    model_pages = 0
    model_series_links = 0

    for category in DEVICE_ROOTS:
        base = ROOT / category
        if not base.exists():
            continue

        for brand_dir in sorted(p for p in base.iterdir() if p.is_dir()):
            brand_path = brand_dir / "index.md"
            if not brand_path.exists():
                continue
            meta = read_meta(brand_path)
            if not meta:
                errors.append(f"brand frontmatter okunamadı: {brand_path.relative_to(ROOT)}")
                continue
            if meta.get("seo_page_type") == SERIES_PAGE_TYPE:
                errors.append(f"brand page series olarak işaretlenmiş: {brand_path.relative_to(ROOT)}")
                continue

            brand_count[category] += 1
            sections = meta.get("seo_sections") if isinstance(meta.get("seo_sections"), list) else []
            faqs = meta.get("seo_faqs") if isinstance(meta.get("seo_faqs"), list) else []
            guides = meta.get("seo_guides") if isinstance(meta.get("seo_guides"), list) else []
            marked_sections = [s for s in sections if isinstance(s, dict) and s.get("kg_brand_series") == MARKER]
            marked_faqs = [f for f in faqs if isinstance(f, dict) and f.get("kg_brand_series") == MARKER]
            marked_guides = [g for g in guides if isinstance(g, dict) and g.get("kg_brand_series") == MARKER]
            if len(marked_sections) != 3:
                errors.append(f"brand section sayısı hatalı {brand_path.relative_to(ROOT)}: {len(marked_sections)}")
            if len(marked_faqs) != 3:
                errors.append(f"brand FAQ sayısı hatalı {brand_path.relative_to(ROOT)}: {len(marked_faqs)}")
            if len(marked_guides) < 2:
                errors.append(f"brand internal guide kapsamı düşük {brand_path.relative_to(ROOT)}")
            canonical = str(meta.get("seo_canonical", ""))
            expected_brand_canonical = f"https://kacagider.com.tr/{category}/{brand_dir.name}/"
            if canonical != expected_brand_canonical:
                errors.append(f"brand canonical değişmiş {brand_path.relative_to(ROOT)}: {canonical}")

        # Same path depth contains real model pages and new series pages.
        for path in sorted(base.glob("*/*/index.md")):
            meta = read_meta(path)
            if not meta:
                errors.append(f"frontmatter okunamadı: {path.relative_to(ROOT)}")
                continue
            rel = path.relative_to(ROOT)
            if meta.get("seo_page_type") == SERIES_PAGE_TYPE:
                series_count[category] += 1
                if meta.get("seo_hub_version") != MARKER:
                    errors.append(f"series hub marker eksik: {rel}")
                links = meta.get("seo_links") if isinstance(meta.get("seo_links"), list) else []
                if len(links) < MIN_SERIES_MODELS:
                    errors.append(f"thin series hub {rel}: {len(links)} model")
                for link in links:
                    if not isinstance(link, dict) or not link.get("url"):
                        errors.append(f"geçersiz model linki: {rel}")
                        continue
                    target = ROOT / str(link["url"]).strip("/") / "index.md"
                    if not target.exists():
                        errors.append(f"series model link hedefi yok {rel}: {link.get('url')}")
                series_model_count[category] += len(links)
                canonical = str(meta.get("seo_canonical", ""))
                expected = f"https://kacagider.com.tr/{'/'.join(rel.parts[:-1])}/"
                if canonical != expected:
                    errors.append(f"series canonical hatalı {rel}: {canonical} != {expected}")
                text = visible_text(meta)
                required = ("ikinci el fiyatlari", "piyasa degeri", "ne kadar eder", "kaca satilir")
                missing = [phrase for phrase in required if phrase not in text]
                if missing:
                    errors.append(f"series intent eksik {rel}: {', '.join(missing)}")
                series_urls.append(canonical)
                continue

            # Real model pages must stay real model pages and keep exactly zero/one series link.
            model_pages += 1
            links = meta.get("seo_links") if isinstance(meta.get("seo_links"), list) else []
            marked = [l for l in links if isinstance(l, dict) and l.get("kg_series_link") == MARKER]
            if len(marked) > 1:
                errors.append(f"modelde duplicate series link {rel}: {len(marked)}")
            if marked:
                model_series_links += 1
                target_url = str(marked[0].get("url", ""))
                target = ROOT / target_url.strip("/") / "index.md"
                target_meta = read_meta(target) if target.exists() else {}
                if target_meta.get("seo_page_type") != SERIES_PAGE_TYPE:
                    errors.append(f"model series link hedefi geçersiz {rel}: {target_url}")

    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    for url in series_urls:
        count = sitemap.count(f"<loc>{url}</loc>")
        if count != 1:
            errors.append(f"sitemap series URL sayısı hatalı {url}: {count}")

    if not series_urls:
        errors.append("hiç series hub oluşturulmadı")
    if model_pages != 632:
        errors.append(f"gerçek model sayısı değişti: {model_pages} (beklenen 632)")

    print("SEO BRAND + SERIES HUB AUDIT")
    print(f"Brand hub toplamı: {sum(brand_count.values())}")
    print(f"Series hub toplamı: {sum(series_count.values())}")
    print(f"Gerçek model sayfası: {model_pages}")
    print(f"Series hub'a bağlanan model: {model_series_links}")
    for category in DEVICE_ROOTS:
        print(
            f"  {category}: {brand_count[category]} brand | "
            f"{series_count[category]} series | {series_model_count[category]} series-member link"
        )
    print(f"Hata sayısı: {len(errors)}")

    if errors:
        print("SEO BRAND + SERIES HUB AUDIT: FAIL")
        for item in errors[:100]:
            print(" -", item)
        if len(errors) > 100:
            print(f" ... +{len(errors)-100} hata daha")
        return 1

    print("SEO BRAND + SERIES HUB AUDIT: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
