from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
CLUSTER_MARKER = "listing-intent-v1"
LEGACY_PRICE_CLUSTER = "model-intent-v1"
LISTING_HUB_URL = "/ucretsiz-ilan-ver/"


def normalize(value: str) -> str:
    value = str(value or "").lower()
    value = value.translate(str.maketrans({"ı": "i", "ğ": "g", "ü": "u", "ş": "s", "ö": "o", "ç": "c"}))
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def meta(path: Path) -> dict:
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


def subject(data: dict, path: Path) -> str:
    crumbs = data.get("seo_breadcrumbs")
    if isinstance(crumbs, list) and len(crumbs) >= 4:
        brand = str(crumbs[-2].get("label", "")).strip()
        model = str(crumbs[-1].get("label", "")).strip()
        if brand and model:
            return model if normalize(brand) in normalize(model) else f"{brand} {model}"
    return path.parent.name.replace("-", " ").title()


def model_files():
    for root_name in DEVICE_ROOTS:
        base = ROOT / root_name
        if not base.exists():
            continue
        for path in sorted(base.glob("*/*/index.md")):
            data = meta(path)
            crumbs = data.get("seo_breadcrumbs")
            if data and (not crumbs or (isinstance(crumbs, list) and len(crumbs) == 4)):
                yield path, data


def main():
    errors = []
    rows = list(model_files())
    if not rows:
        print("SEO MODEL LISTING INTENT AUDIT: FAIL - no model pages found")
        return 1

    category_counts = {name: 0 for name in DEVICE_ROOTS}
    for path, data in rows:
        rel = path.relative_to(ROOT)
        category_counts[rel.parts[0]] += 1
        name = subject(data, path)
        sections = data.get("seo_sections") if isinstance(data.get("seo_sections"), list) else []
        links = data.get("seo_links") if isinstance(data.get("seo_links"), list) else []

        listing_clusters = [s for s in sections if isinstance(s, dict) and s.get("kg_intent_cluster") == CLUSTER_MARKER]
        if len(listing_clusters) != 1:
            errors.append(f"{rel}: expected exactly one {CLUSTER_MARKER} section, found {len(listing_clusters)}")
            continue

        cluster = listing_clusters[0]
        text = normalize(json.dumps(cluster, ensure_ascii=False))
        expected = [
            f"{name} ucretsiz ilan",
            f"{name} ilan",
            f"{name} ikinci el ilan",
            f"{name} satmak istiyorum",
            f"{name} fiyatini",
            f"{name} piyasa degerini",
        ]
        covered = sum(1 for phrase in expected if normalize(phrase) in text)
        if covered < 5:
            errors.append(f"{rel}: listing intent coverage too low ({covered}/6)")

        if "piyasa degeri sorgulamasi ucretsizdir" not in text:
            errors.append(f"{rel}: free valuation disclosure missing")
        if "ilan yayinlamak icin uyelik gerekir" not in text:
            errors.append(f"{rel}: listing membership disclosure missing")

        listing_links = [l for l in links if isinstance(l, dict) and l.get("kg_listing_link") == CLUSTER_MARKER]
        if len(listing_links) != 1:
            errors.append(f"{rel}: expected exactly one listing internal link, found {len(listing_links)}")
        elif listing_links[0].get("url") != LISTING_HUB_URL:
            errors.append(f"{rel}: listing internal link must point to {LISTING_HUB_URL}")

        old_clusters = [s for s in sections if isinstance(s, dict) and s.get("kg_intent_cluster") == LEGACY_PRICE_CLUSTER]
        if len(old_clusters) != 1:
            errors.append(f"{rel}: existing price-intent cluster was lost or duplicated")

    print(f"Model listing intent audit: {len(rows)} model page(s) checked")
    for category in DEVICE_ROOTS:
        print(f"  {category}: {category_counts[category]}")

    if errors:
        print(f"SEO MODEL LISTING INTENT AUDIT: FAIL ({len(errors)} issue(s))")
        for item in errors[:80]:
            print(" -", item)
        if len(errors) > 80:
            print(f" ... and {len(errors) - 80} more")
        return 1

    print("SEO MODEL LISTING INTENT AUDIT: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
