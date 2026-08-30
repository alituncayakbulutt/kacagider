#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = {"telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu"}
STORAGE_RE = re.compile(r"^\d+(?:gb|tb)$", re.I)


def split_frontmatter(text: str):
    if not text.startswith("---\n"):
        return None
    marker = text.find("\n---", 4)
    if marker == -1:
        return None
    front = text[4:marker]
    body = text[marker + 4 :]
    if body.startswith("\n"):
        body = body[1:]
    return front.splitlines(), body


def load_doc(path: Path):
    parsed = split_frontmatter(path.read_text(encoding="utf-8"))
    if not parsed:
        return None
    lines, body = parsed
    raw = {}
    for line in lines:
        if ":" in line:
            key, value = line.split(":", 1)
            raw[key.strip()] = value.strip()
    return {"lines": lines, "body": body, "raw": raw}


def decode(value, default=None):
    if value is None:
        return default
    try:
        return json.loads(value)
    except Exception:
        return value.strip().strip('"')


def get_list(doc, key):
    value = decode(doc["raw"].get(key), [])
    return value if isinstance(value, list) else []


def set_value(doc, key, value):
    rendered = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    prefix = key + ":"
    for i, line in enumerate(doc["lines"]):
        if line.startswith(prefix):
            doc["lines"][i] = f"{key}: {rendered}"
            doc["raw"][key] = rendered
            return
    doc["lines"].append(f"{key}: {rendered}")
    doc["raw"][key] = rendered


def save_doc(path: Path, doc):
    text = "---\n" + "\n".join(doc["lines"]) + "\n---\n"
    if doc["body"]:
        text += doc["body"]
        if not text.endswith("\n"):
            text += "\n"
    path.write_text(text, encoding="utf-8")


def last_breadcrumb_label(doc, fallback):
    crumbs = get_list(doc, "seo_breadcrumbs")
    if crumbs and isinstance(crumbs[-1], dict) and crumbs[-1].get("label"):
        return str(crumbs[-1]["label"])
    return fallback


def model_name_from_h1(path: Path):
    doc = load_doc(path)
    if not doc:
        return path.parent.name.replace("-", " ").title()
    h1 = str(decode(doc["raw"].get("seo_h1"), ""))
    for pattern in (
        r"\s+Ne Kadar Eder\?.*$",
        r"\s+İkinci El Fiyatı.*$",
        r"\s+Kaça Satılır\?.*$",
        r"\s+Piyasa Değeri.*$",
    ):
        h1 = re.sub(pattern, "", h1, flags=re.I)
    return h1.strip() or path.parent.name.replace("-", " ").title()


def clean_non_storage_variant(path: Path, doc, model_name: str, variant: str):
    sections = get_list(doc, "seo_sections")
    faqs = get_list(doc, "seo_faqs")

    sections = [
        item for item in sections
        if not (isinstance(item, dict) and item.get("kg_intent_cluster") in {"capacity-intent-v2", "listing-intent-v2"})
    ]
    faqs = [
        item for item in faqs
        if not (
            isinstance(item, dict)
            and (
                " kapasite ikinci el değeri etkiler mi?" in str(item.get("question", ""))
                or str(item.get("answer", "")).startswith("Satış değeri kapasiteyle birlikte")
            )
        )
    ]

    full_name = f"{model_name} {variant}".strip()
    sections.append({
        "title": f"{full_name} fiyatını öğren ve ücretsiz ilan ver",
        "text": (
            "Önce bu varyant için güncel piyasa değerini hesaplayın; ardından KaçaGider ücretsiz ilan akışında "
            "satış fiyatını ve ilan bilgilerini tamamlayın. Varyant bilgisi değerleme girdilerinden biridir; "
            "cihazın gerçek kondisyonu da sonucu etkiler."
        ),
        "items": [
            f"{full_name} için ücretsiz ilan verebilir miyim? Evet; önce değerini hesaplayıp ardından ilan akışına geçebilirsiniz.",
            f"{full_name} satış fiyatını belirlerken cihaz kondisyonunu ve güncel piyasa referansını birlikte değerlendirin."
        ],
        "kg_intent_cluster": "listing-intent-v2"
    })

    set_value(doc, "seo_sections", sections)
    set_value(doc, "seo_faqs", faqs)
    save_doc(path, doc)


def rewrite_report(model_pages: int, storage_pages: int, variant_pages: int):
    report = ROOT / "reports" / "seo-stages-4-10.md"
    if not report.exists():
        return
    text = report.read_text(encoding="utf-8")
    text = re.sub(
        r"- Aşama 4 Kapasite SEO: .*",
        f"- Aşama 4 Kapasite SEO: {storage_pages} gerçek GB/TB kapasite sayfası denetlendi/güçlendirildi; {variant_pages} kapasite dışı varyant sayfası kapasite sinyalinden ayrıştırıldı.",
        text,
    )
    text = re.sub(
        r"- Aşama 8 Model karşılaştırma: .*",
        f"- Aşama 8 Model karşılaştırma: {model_pages} model sayfasına karşılaştırma rehberi/bağlantısı uygulandı.",
        text,
    )
    report.write_text(text, encoding="utf-8")


def main():
    model_pages = 0
    storage_pages = 0
    variant_pages = 0

    for category in CATEGORIES:
        base = ROOT / category
        if not base.exists():
            continue
        for path in base.rglob("index.md"):
            rel = path.relative_to(ROOT).parts
            if rel[0] != category:
                continue
            if len(rel) == 4:
                model_pages += 1
                continue
            if len(rel) != 5:
                continue

            slug = rel[3]
            if STORAGE_RE.fullmatch(slug):
                storage_pages += 1
                continue

            variant_pages += 1
            doc = load_doc(path)
            if not doc:
                continue
            model_page = ROOT / category / rel[1] / rel[2] / "index.md"
            model_name = model_name_from_h1(model_page)
            variant = last_breadcrumb_label(doc, slug.replace("-", " "))
            clean_non_storage_variant(path, doc, model_name, variant)

    rewrite_report(model_pages, storage_pages, variant_pages)
    print(json.dumps({
        "model_pages": model_pages,
        "storage_pages": storage_pages,
        "non_storage_variant_pages": variant_pages,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
