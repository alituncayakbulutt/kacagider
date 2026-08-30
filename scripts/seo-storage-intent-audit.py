from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
CLUSTER_MARKER = "storage-intent-v1"
STORAGE_RE = re.compile(r"^\d+(?:gb|tb)$", re.I)
BASE_URL = "https://kacagider.com.tr/"


def normalize(value: str) -> str:
    value = str(value or "").lower()
    value = value.translate(str.maketrans({"ı": "i", "ğ": "g", "ü": "u", "ş": "s", "ö": "o", "ç": "c"}))
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def read_meta(path: Path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return text, {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return text, {}
    meta = {}
    for line in text[4:end].splitlines():
        if ": " not in line:
            continue
        key, raw = line.split(": ", 1)
        try:
            meta[key] = json.loads(raw)
        except json.JSONDecodeError:
            meta[key] = raw.strip('"')
    return text, meta


def is_storage_page(path: Path, meta: dict) -> bool:
    rel = path.relative_to(ROOT)
    if len(rel.parts) != 5 or rel.parts[-1] != "index.md":
        return False
    if rel.parts[0] not in DEVICE_ROOTS or not STORAGE_RE.fullmatch(rel.parts[-2]):
        return False
    crumbs = meta.get("seo_breadcrumbs")
    return not crumbs or (isinstance(crumbs, list) and len(crumbs) == 5)


def display_subject(meta: dict, path: Path) -> str:
    crumbs = meta.get("seo_breadcrumbs")
    if isinstance(crumbs, list) and len(crumbs) >= 5:
        brand = str(crumbs[-3].get("label", "")).strip()
        model = str(crumbs[-2].get("label", "")).strip()
        storage = str(crumbs[-1].get("label", "")).strip()
        model_subject = model if normalize(brand) in normalize(model) else f"{brand} {model}".strip()
        return f"{model_subject} {storage}".strip()
    h1 = str(meta.get("seo_h1", "")).strip()
    return h1.split(" Ne Kadar Eder?", 1)[0].strip() if " Ne Kadar Eder?" in h1 else path.parent.name


def visible(meta: dict) -> str:
    keys = (
        "seo_title", "seo_description", "seo_h1", "seo_intro", "seo_context_heading",
        "seo_context", "seo_sections", "seo_faqs", "seo_links_heading",
    )
    return normalize(" ".join(json.dumps(meta[key], ensure_ascii=False) for key in keys if key in meta))


def phrases(subject: str):
    return {
        "core": [
            f"{subject} ne kadar eder",
            f"{subject} kaça satılır",
            f"{subject} piyasa değeri",
            f"{subject} ikinci el fiyatı",
        ],
        "expanded": [
            f"{subject} kaç para eder",
            f"{subject} kaça satarım",
            f"{subject} kaça satabilirim",
            f"{subject} satsam ne kadar eder",
            f"{subject} ikinci el fiyatları",
            f"{subject} güncel ikinci el fiyatı",
        ],
    }


def main():
    errors = []
    pages = []
    counts = Counter()

    for root_name in DEVICE_ROOTS:
        base = ROOT / root_name
        if not base.exists():
            continue
        for path in sorted(base.glob("*/*/*/index.md")):
            _text, meta = read_meta(path)
            if not meta or not is_storage_page(path, meta):
                continue
            pages.append(path)
            rel = path.relative_to(ROOT)
            counts[rel.parts[0]] += 1
            subject = display_subject(meta, path)
            text = visible(meta)

            parent = path.parent.parent / "index.md"
            if not parent.exists():
                errors.append(f"{rel}: parent model page missing")
            else:
                parent_text, _parent_meta = read_meta(parent)
                storage_url = "/" + "/".join(rel.parts[:-1]) + "/"
                if storage_url not in parent_text:
                    errors.append(f"{rel}: parent model page does not link storage URL {storage_url}")

            expected_canonical = BASE_URL + "/".join(rel.parts[:-1]) + "/"
            if meta.get("seo_canonical") != expected_canonical:
                errors.append(f"{rel}: canonical mismatch ({meta.get('seo_canonical')!r})")

            title = normalize(meta.get("seo_title", ""))
            h1 = normalize(meta.get("seo_h1", ""))
            storage_token = normalize(str(meta.get("seo_breadcrumbs", [{}])[-1].get("label", path.parent.name)))
            if storage_token and storage_token not in title:
                errors.append(f"{rel}: storage label missing from title")
            if storage_token and storage_token not in h1:
                errors.append(f"{rel}: storage label missing from H1")

            sections = meta.get("seo_sections")
            if not isinstance(sections, list):
                errors.append(f"{rel}: seo_sections missing or invalid")
                continue
            clusters = [s for s in sections if isinstance(s, dict) and s.get("kg_intent_cluster") == CLUSTER_MARKER]
            if len(clusters) != 1:
                errors.append(f"{rel}: expected exactly 1 {CLUSTER_MARKER} cluster, found {len(clusters)}")

            intent = phrases(subject)
            core_hits = sum(1 for phrase in intent["core"] if normalize(phrase) in text)
            expanded_hits = sum(1 for phrase in intent["expanded"] if normalize(phrase) in text)
            if core_hits != len(intent["core"]):
                errors.append(f"{rel}: core storage intent coverage {core_hits}/{len(intent['core'])}")
            if expanded_hits < 5:
                errors.append(f"{rel}: expanded storage intent coverage only {expanded_hits}/{len(intent['expanded'])}")

    print(f"Storage intent audit: {len(pages)} real storage page(s) checked")
    for category in DEVICE_ROOTS:
        if counts[category]:
            print(f"  {category}: {counts[category]}")

    if not pages:
        raise SystemExit("SEO STORAGE INTENT AUDIT: FAIL - no storage pages found")
    if errors:
        print(f"SEO STORAGE INTENT AUDIT: FAIL - {len(errors)} issue(s)")
        for issue in errors[:100]:
            print(f"  - {issue}")
        if len(errors) > 100:
            print(f"  ... and {len(errors) - 100} more")
        raise SystemExit(1)

    print("SEO STORAGE INTENT AUDIT: PASS")


if __name__ == "__main__":
    main()
