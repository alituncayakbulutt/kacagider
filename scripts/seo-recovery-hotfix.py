#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = {"telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu"}
PRIMARY_PHONE_LANDING = "https://kacagider.com.tr/telefonum-ne-kadar-eder/"
CANONICAL_DUPLICATES = {
    "telefonum-kac-para/index.md",
    "telefonum-kaca-gider/index.md",
}

CATEGORY = {
    "telefon": {
        "name": "Telefon",
        "factors": "hafıza, ekran, batarya ve genel cihaz durumu",
        "context": "hafıza ve kondisyon",
    },
    "tablet": {
        "name": "Tablet",
        "factors": "kapasite, ekran, batarya ve genel cihaz durumu",
        "context": "kapasite ve kondisyon",
    },
    "bilgisayar": {
        "name": "Bilgisayar",
        "factors": "işlemci, RAM, depolama, pil ve genel cihaz durumu",
        "context": "donanım, depolama ve kondisyon",
    },
    "akilli-saat": {
        "name": "Akıllı Saat",
        "factors": "kasa boyutu, ekran, batarya ve genel cihaz durumu",
        "context": "kasa boyutu ve kondisyon",
    },
    "oyun-konsolu": {
        "name": "Oyun Konsolu",
        "factors": "depolama, aksesuarlar, çalışma durumu ve genel kondisyon",
        "context": "depolama, aksesuar ve kondisyon",
    },
}

AGGRESSIVE_CLUSTER_PREFIXES = (
    "model-intent",
    "capacity-intent",
    "listing-intent",
    "comparison-intent",
)


def split_doc(text: str):
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---\n", 4)
    if end < 0:
        return None
    front = text[4:end].splitlines()
    body = text[end + 5 :]
    raw = {}
    for line in front:
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        raw[key.strip()] = value.strip()
    return {"lines": front, "raw": raw, "body": body}


def decode(raw: str | None, default=None):
    if raw is None:
        return default
    try:
        return json.loads(raw)
    except Exception:
        return raw.strip().strip('"')


def set_value(doc, key: str, value):
    rendered = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    prefix = key + ":"
    for i, line in enumerate(doc["lines"]):
        if line.startswith(prefix):
            doc["lines"][i] = f"{key}: {rendered}"
            doc["raw"][key] = rendered
            return
    doc["lines"].append(f"{key}: {rendered}")
    doc["raw"][key] = rendered


def save(path: Path, doc):
    text = "---\n" + "\n".join(doc["lines"]) + "\n---\n" + doc["body"]
    path.write_text(text, encoding="utf-8")


def clean_text(value: str) -> str:
    value = re.sub(r"\s+", " ", str(value or "")).strip()
    value = re.sub(r"\s+ve\s*$", "", value, flags=re.I)
    return value.strip(" -|?")


def add_brand(brand: str, model: str) -> str:
    brand = clean_text(brand)
    model = clean_text(model)
    if not brand:
        return model
    if brand.lower() in model.lower():
        return model
    if brand.lower() == "apple" and model.lower().startswith(("iphone", "ipad", "macbook", "apple watch")):
        return model
    return f"{brand} {model}".strip()


def breadcrumb_subject(meta: dict, variant: bool = False) -> str:
    crumbs = meta.get("seo_breadcrumbs")
    if not isinstance(crumbs, list) or len(crumbs) < 4:
        return ""
    brand = str(crumbs[2].get("label", "")) if len(crumbs) >= 3 and isinstance(crumbs[2], dict) else ""
    if variant and len(crumbs) >= 5:
        model = str(crumbs[-2].get("label", ""))
        option = str(crumbs[-1].get("label", ""))
        return clean_text(f"{add_brand(brand, model)} {option}")
    model = str(crumbs[-1].get("label", ""))
    return clean_text(add_brand(brand, model))


def clean_sections(doc):
    sections = decode(doc["raw"].get("seo_sections"), [])
    if not isinstance(sections, list):
        return 0
    kept = []
    removed = 0
    for section in sections:
        marker = ""
        if isinstance(section, dict):
            marker = str(section.get("kg_intent_cluster", ""))
        if marker and marker.startswith(AGGRESSIVE_CLUSTER_PREFIXES):
            removed += 1
            continue
        kept.append(section)
    if removed:
        set_value(doc, "seo_sections", kept)
    return removed


def recover_series(path: Path, doc, category: str):
    meta = {k: decode(v) for k, v in doc["raw"].items()}
    crumbs = meta.get("seo_breadcrumbs")
    if not isinstance(crumbs, list) or not crumbs:
        return False
    subject = clean_text(str(crumbs[-1].get("label", "")))
    if not subject:
        return False
    profile = CATEGORY[category]
    set_value(doc, "seo_title", f"{subject} İkinci El Fiyatları ve Piyasa Değeri | KaçaGider")
    set_value(doc, "seo_description", f"{subject} ikinci el fiyatları ve piyasa değeri için gerçek modelinizi seçin; cihaz durumuna göre güncel satış değeri referansını KaçaGider ile ücretsiz kontrol edin.")
    set_value(doc, "seo_h1", f"{subject} İkinci El Fiyatları ve Piyasa Değeri")
    set_value(doc, "seo_intro", f"{subject} modellerinin ne kadar ettiğini, kaça satılabileceğini ve güncel ikinci el piyasa değerini öğrenmek için modelinizi seçin. Değerleme cihazın gerçek özellikleri ve kondisyonuna göre yapılır.")
    set_value(doc, "seo_context_heading", f"{subject} için ikinci el değerleme")
    set_value(doc, "seo_context", f"{subject} ailesindeki gerçek modelleri tek merkezde inceleyin. Modelinizi seçerek {profile['context']} bilgileriyle güncel ikinci el piyasa değeri referansını kontrol edin.")
    clean_sections(doc)
    set_value(doc, "kg_seo_stage", "recovery-2026-09")
    return True


def recover_model(path: Path, doc, category: str, variant: bool):
    meta = {k: decode(v) for k, v in doc["raw"].items()}
    subject = breadcrumb_subject(meta, variant=variant)
    if not subject:
        return False
    profile = CATEGORY[category]

    if variant:
        title = f"{subject} Ne Kadar Eder? İkinci El Fiyatı | KaçaGider"
        h1 = f"{subject} İkinci El Fiyatı"
    else:
        title = f"{subject} Ne Kadar Eder? Güncel İkinci El Fiyatı | KaçaGider"
        h1 = f"{subject} Ne Kadar Eder?"

    set_value(doc, "seo_title", title)
    set_value(doc, "seo_description", f"{subject} ne kadar eder? {profile['factors']} dikkate alınarak güncel ikinci el piyasa değerini KaçaGider ile ücretsiz hesaplayın.")
    set_value(doc, "seo_h1", h1)
    set_value(doc, "seo_intro", f"{subject} için güncel ikinci el değerini gerçek cihaz bilgileri ve kondisyon ayrıntılarıyla KaçaGider üzerinden inceleyin.")
    set_value(doc, "seo_context_heading", f"{subject} değeri nasıl hesaplanır?")
    set_value(doc, "seo_context", f"{subject} ikinci el değeri; {profile['factors']} ile güncel piyasa koşulları birlikte değerlendirilerek belirlenir. Sonuç sabit satış garantisi değil, satış kararına yardımcı güncel bir piyasa referansıdır.")
    clean_sections(doc)
    set_value(doc, "kg_seo_stage", "recovery-2026-09")
    return True


def recover_device_pages():
    changed = 0
    removed_clusters = 0
    for category in sorted(DEVICE_ROOTS):
        base = ROOT / category
        if not base.exists():
            continue
        for path in sorted(base.rglob("index.md")):
            rel = path.relative_to(ROOT)
            parts = rel.parts
            if len(parts) not in (4, 5):
                continue
            original = path.read_text(encoding="utf-8")
            doc = split_doc(original)
            if not doc:
                continue
            meta = {k: decode(v) for k, v in doc["raw"].items()}
            before_sections = decode(doc["raw"].get("seo_sections"), [])
            before_count = len(before_sections) if isinstance(before_sections, list) else 0

            is_series = meta.get("seo_page_type") == "series_hub"
            if is_series:
                touched = recover_series(path, doc, category)
            else:
                crumbs = meta.get("seo_breadcrumbs")
                if not isinstance(crumbs, list) or len(crumbs) < 4:
                    continue
                touched = recover_model(path, doc, category, variant=(len(parts) == 5))

            if not touched:
                continue
            after_sections = decode(doc["raw"].get("seo_sections"), [])
            after_count = len(after_sections) if isinstance(after_sections, list) else 0
            removed_clusters += max(0, before_count - after_count)
            rebuilt = "---\n" + "\n".join(doc["lines"]) + "\n---\n" + doc["body"]
            if rebuilt != original:
                path.write_text(rebuilt, encoding="utf-8")
                changed += 1
    return changed, removed_clusters


def consolidate_phone_landings():
    changed = 0
    for rel in sorted(CANONICAL_DUPLICATES):
        path = ROOT / rel
        if not path.exists():
            continue
        original = path.read_text(encoding="utf-8")
        doc = split_doc(original)
        if not doc:
            continue
        set_value(doc, "seo_canonical", PRIMARY_PHONE_LANDING)
        set_value(doc, "kg_seo_stage", "recovery-2026-09-canonical")
        rebuilt = "---\n" + "\n".join(doc["lines"]) + "\n---\n" + doc["body"]
        if rebuilt != original:
            path.write_text(rebuilt, encoding="utf-8")
            changed += 1

    sitemap = ROOT / "sitemap.xml"
    if sitemap.exists():
        original = sitemap.read_text(encoding="utf-8")
        updated = original
        for route in ("telefonum-kac-para", "telefonum-kaca-gider"):
            url = f"https://kacagider.com.tr/{route}/"
            updated = re.sub(
                rf"\s*<url>\s*<loc>{re.escape(url)}</loc>.*?</url>",
                "",
                updated,
                flags=re.DOTALL,
            )
        updated = re.sub(r"\n{3,}", "\n\n", updated)
        if updated != original:
            sitemap.write_text(updated, encoding="utf-8")
            changed += 1
    return changed


def main():
    device_changes, removed_clusters = recover_device_pages()
    canonical_changes = consolidate_phone_landings()
    print(
        "SEO recovery complete: "
        f"{device_changes} device SEO page(s) normalized; "
        f"{removed_clusters} synthetic intent section(s) removed; "
        f"{canonical_changes} canonical/sitemap file(s) consolidated."
    )


if __name__ == "__main__":
    main()
