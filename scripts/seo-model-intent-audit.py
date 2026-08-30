from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
CLUSTER_MARKER = "model-intent-v1"
MIN_EXPANDED_COVERAGE = 5


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
    meta = {}
    for line in text[4:end].splitlines():
        if ": " not in line:
            continue
        key, raw = line.split(": ", 1)
        try:
            meta[key] = json.loads(raw)
        except json.JSONDecodeError:
            meta[key] = raw.strip('"')
    return meta


def subject_from(meta: dict, path: Path) -> str:
    breadcrumbs = meta.get("seo_breadcrumbs")
    if isinstance(breadcrumbs, list) and len(breadcrumbs) >= 4:
        brand = str(breadcrumbs[-2].get("label", "")).strip()
        model = str(breadcrumbs[-1].get("label", "")).strip()
        if brand and model:
            return model if normalize(brand) in normalize(model) else f"{brand} {model}"
        return model or brand
    h1 = str(meta.get("seo_h1", "")).strip()
    return h1.split(" Ne Kadar Eder?", 1)[0].strip() or path.parent.name.replace("-", " ").title()


def searchable_text(meta: dict) -> str:
    keys = (
        "seo_title", "seo_description", "seo_h1", "seo_intro", "seo_context_heading",
        "seo_context", "seo_sections", "seo_faqs", "seo_links_heading",
    )
    return normalize(" ".join(json.dumps(meta.get(key, ""), ensure_ascii=False) for key in keys))


def phrases(subject: str):
    core = [
        f"{subject} ne kadar eder",
        f"{subject} kaça satılır",
        f"{subject} piyasa değeri",
        f"{subject} ikinci el fiyatı",
    ]
    expanded = [
        f"{subject} kaç para eder",
        f"{subject} kaça satarım",
        f"{subject} kaça satabilirim",
        f"{subject} satsam ne kadar eder",
        f"{subject} ikinci el fiyatları",
        f"{subject} güncel ikinci el fiyatı",
        f"{subject} ikinci el piyasa değeri",
        f"{subject} piyasa fiyatı",
        f"{subject} fiyat sorgulama",
        f"{subject} değer sorgulama",
    ]
    return core, expanded


def main() -> int:
    rows = []
    failures = []
    category_counts = Counter()
    category_expansion = defaultdict(int)
    total_clusters = 0

    for root_name in DEVICE_ROOTS:
        base = ROOT / root_name
        if not base.exists():
            continue
        for path in sorted(base.glob("*/*/index.md")):
            meta = read_meta(path)
            if not meta:
                failures.append(f"frontmatter okunamadı: {path.relative_to(ROOT)}")
                continue
            if meta.get("seo_page_type") == "series_hub":
                continue
            breadcrumbs = meta.get("seo_breadcrumbs")
            if isinstance(breadcrumbs, list) and len(breadcrumbs) != 4:
                continue

            subject = subject_from(meta, path)
            text = searchable_text(meta)
            core, expanded = phrases(subject)
            core_missing = [phrase for phrase in core if normalize(phrase) not in text]
            expanded_present = [phrase for phrase in expanded if normalize(phrase) in text]
            sections = meta.get("seo_sections") if isinstance(meta.get("seo_sections"), list) else []
            clusters = [s for s in sections if isinstance(s, dict) and s.get("kg_intent_cluster") == CLUSTER_MARKER]

            category_counts[root_name] += 1
            category_expansion[root_name] += len(expanded_present)
            total_clusters += len(clusters)
            rel = str(path.relative_to(ROOT))

            if core_missing:
                failures.append(f"core intent eksik {rel}: {', '.join(core_missing)}")
            if len(expanded_present) < MIN_EXPANDED_COVERAGE:
                failures.append(
                    f"genişletilmiş intent kapsamı düşük {rel}: {len(expanded_present)}/{len(expanded)}"
                )
            if len(clusters) > 1:
                failures.append(f"duplicate intent cluster {rel}: {len(clusters)}")

            rows.append((root_name, rel, len(core) - len(core_missing), len(expanded_present), len(clusters)))

    total_models = len(rows)
    if total_models == 0:
        failures.append("hiç model sayfası bulunamadı")

    print("SEO MODEL INTENT AUDIT")
    print(f"Toplam model sayfası: {total_models}")
    for category in DEVICE_ROOTS:
        count = category_counts[category]
        if count:
            avg = category_expansion[category] / count
            print(f"  {category}: {count} model | ort. genişletilmiş intent {avg:.1f}")
    print(f"Intent cluster sayısı: {total_clusters}")
    print(f"Hata sayısı: {len(failures)}")

    if failures:
        print("\nİlk hatalar:")
        for item in failures[:80]:
            print(f"- {item}")
        if len(failures) > 80:
            print(f"- ... +{len(failures)-80} hata daha")
        return 1

    print("SEO MODEL INTENT AUDIT: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
