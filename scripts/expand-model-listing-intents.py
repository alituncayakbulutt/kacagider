from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
CLUSTER_MARKER = "listing-intent-v1"
LISTING_HUB_URL = "/ucretsiz-ilan-ver/"
MAX_NEW_INTENTS = 6

CATEGORY_PROFILES = {
    "telefon": {"label": "telefon", "factors": "hafıza, ekran, batarya, cihaz kayıt durumu ve genel kondisyon"},
    "tablet": {"label": "tablet", "factors": "kapasite, ekran, batarya ve genel kondisyon"},
    "bilgisayar": {"label": "bilgisayar", "factors": "işlemci, RAM, depolama, pil ve genel kondisyon"},
    "akilli-saat": {"label": "akıllı saat", "factors": "kasa boyutu, ekran, batarya ve genel kondisyon"},
    "oyun-konsolu": {"label": "oyun konsolu", "factors": "depolama, kozmetik durum, aksesuarlar ve çalışma durumu"},
}


def normalize(value: str) -> str:
    value = str(value or "").lower()
    value = value.translate(str.maketrans({"ı": "i", "ğ": "g", "ü": "u", "ş": "s", "ö": "o", "ç": "c"}))
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def read_frontmatter(path: Path):
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


def replace_json_field(text: str, key: str, value) -> str:
    encoded = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    pattern = re.compile(rf"^{re.escape(key)}:\s*.*$", re.MULTILINE)
    replacement = f"{key}: {encoded}"
    if pattern.search(text):
        return pattern.sub(replacement, text, count=1)
    end = text.find("\n---\n", 4)
    if end == -1:
        return text
    return text[:end] + "\n" + replacement + text[end:]


def display_subject(meta: dict, path: Path) -> str:
    breadcrumbs = meta.get("seo_breadcrumbs")
    if isinstance(breadcrumbs, list) and len(breadcrumbs) >= 4:
        brand = str(breadcrumbs[-2].get("label", "")).strip()
        model = str(breadcrumbs[-1].get("label", "")).strip()
        if brand and model:
            return model if normalize(brand) in normalize(model) else f"{brand} {model}"
        return model or brand
    h1 = str(meta.get("seo_h1", "")).strip()
    for marker in (" Ne Kadar Eder?", " İkinci El Fiyatı", " İkinci El Fiyatları"):
        if marker in h1:
            return h1.split(marker, 1)[0].strip()
    return path.parent.name.replace("-", " ").title()


def candidate_intents(subject: str, category: str):
    profile = CATEGORY_PROFILES[category]
    label = profile["label"]
    factors = profile["factors"]
    return [
        (
            f"{subject} ücretsiz ilan ver",
            f"{subject} için ücretsiz ilan verebilir miyim?",
            f"Evet. KaçaGider'de önce {factors} bilgileriyle güncel piyasa değerini hesaplayabilir, ardından ana sayfadaki ücretsiz ilan akışından {label} ilanını oluşturabilirsin. İlan yayınlamak için üyelik gerekir.",
        ),
        (
            f"{subject} ilan ver",
            f"{subject} ilanı nasıl verilir?",
            "Önce cihazın piyasa değerini hesapla. Ardından KaçaGider ana sayfasındaki Ücretsiz İlan Ver akışına geçerek satış fiyatını ve ilan bilgilerini tamamlayabilirsin.",
        ),
        (
            f"{subject} ikinci el ilan ver",
            f"{subject} ikinci el ilanı nasıl oluşturulur?",
            "Model, kapasite ve kondisyon bilgilerini seçip piyasa değerini gördükten sonra KaçaGider ana sayfasındaki ücretsiz ilan akışına geçebilirsin.",
        ),
        (
            f"{subject} satmak istiyorum",
            f"{subject} satmak istiyorum; nereden başlamalıyım?",
            "İlk adım güncel piyasa değerini öğrenmektir. Değerini kontrol ettikten sonra KaçaGider ana sayfasındaki ücretsiz ilan akışından satış sürecine devam edebilirsin.",
        ),
        (
            f"{subject} fiyatını öğren ilan ver",
            f"{subject} fiyatını öğrenip ilan verebilir miyim?",
            "Evet. KaçaGider'in değerleme aracıyla cihazın güncel piyasa referansını gördükten sonra ana sayfadaki ücretsiz ilan verme akışına devam edebilirsin.",
        ),
        (
            f"{subject} piyasa değerini öğren sat",
            f"{subject} piyasa değerini öğrenip satışa çıkarabilir miyim?",
            "Evet. Önce güncel piyasa değerini kontrol ederek satış fiyatını daha bilinçli belirleyebilir, ardından KaçaGider ana sayfasından ücretsiz ilan oluşturabilirsin.",
        ),
        (
            f"{subject} satış ilanı ver",
            f"{subject} satış ilanı vermek ücretli mi?",
            "KaçaGider'de ilan oluşturmak ücretsizdir. Piyasa değeri sorgulaması da ücretsizdir; ilan yayınlamak ve ilanlarını yönetmek için üyelik gerekir.",
        ),
    ]


def visible_meta_text(meta: dict) -> str:
    keys = (
        "seo_title", "seo_description", "seo_h1", "seo_intro", "seo_context_heading",
        "seo_context", "seo_sections", "seo_faqs", "seo_links", "seo_links_heading",
    )
    return " ".join(json.dumps(meta.get(key), ensure_ascii=False) for key in keys if key in meta)


def is_model_page(path: Path, meta: dict) -> bool:
    try:
        rel = path.relative_to(ROOT)
    except ValueError:
        return False
    if len(rel.parts) != 4 or rel.parts[-1] != "index.md" or rel.parts[0] not in DEVICE_ROOTS:
        return False
    breadcrumbs = meta.get("seo_breadcrumbs")
    return not breadcrumbs or (isinstance(breadcrumbs, list) and len(breadcrumbs) == 4)


def process(path: Path):
    text, meta = read_frontmatter(path)
    if not meta or not is_model_page(path, meta):
        return None

    sections = meta.get("seo_sections") if isinstance(meta.get("seo_sections"), list) else []
    base_sections = [
        section for section in sections
        if not (isinstance(section, dict) and section.get("kg_intent_cluster") == CLUSTER_MARKER)
    ]
    links = meta.get("seo_links") if isinstance(meta.get("seo_links"), list) else []
    base_links = [
        link for link in links
        if not (isinstance(link, dict) and link.get("kg_listing_link") == CLUSTER_MARKER)
    ]

    rel = path.relative_to(ROOT)
    category = rel.parts[0]
    subject = display_subject(meta, path)

    meta_without_cluster = dict(meta)
    meta_without_cluster["seo_sections"] = base_sections
    meta_without_cluster["seo_links"] = base_links
    existing = normalize(visible_meta_text(meta_without_cluster))

    candidates = candidate_intents(subject, category)
    missing = [item for item in candidates if normalize(item[0]) not in existing]
    selected = missing[:MAX_NEW_INTENTS]

    new_sections = list(base_sections)
    if selected:
        new_sections.append({
            "title": f"{subject} fiyatını öğren ve ücretsiz ilan ver",
            "text": "KaçaGider'de ikinci el satış süreci iki adımdır: önce cihazın güncel piyasa değerini öğren, ardından ana sayfadaki ücretsiz ilan akışına geçerek satış fiyatını belirle ve ilanını oluştur. Piyasa değeri sorgulaması ücretsizdir; ilan yayınlamak için üyelik gerekir.",
            "items": [f"{question} {answer}" for _phrase, question, answer in selected],
            "kg_intent_cluster": CLUSTER_MARKER,
        })

    new_links = list(base_links)
    new_links.append({
        "label": "Değerini öğren ve ücretsiz ilan ver",
        "url": LISTING_HUB_URL,
        "kg_listing_link": CLUSTER_MARKER,
    })

    updated = replace_json_field(text, "seo_sections", new_sections)
    updated = replace_json_field(updated, "seo_links", new_links)
    changed = updated != text
    if changed:
        path.write_text(updated, encoding="utf-8")

    final_meta = dict(meta_without_cluster)
    final_meta["seo_sections"] = new_sections
    final_meta["seo_links"] = new_links
    final_text = normalize(visible_meta_text(final_meta))
    covered = sum(1 for phrase, _question, _answer in candidates if normalize(phrase) in final_text)

    return {
        "path": str(rel),
        "category": category,
        "subject": subject,
        "changed": changed,
        "added": len(selected),
        "covered": covered,
        "total": len(candidates),
    }


def main():
    results = []
    for root_name in DEVICE_ROOTS:
        base = ROOT / root_name
        if not base.exists():
            continue
        for path in sorted(base.glob("*/*/index.md")):
            row = process(path)
            if row:
                results.append(row)

    print(
        "Listing intent expansion: "
        f"{len(results)} model page(s) scanned; "
        f"{sum(1 for row in results if row['changed'])} file(s) updated; "
        f"{sum(row['added'] for row in results)} missing listing intent phrase(s) added."
    )
    for category in DEVICE_ROOTS:
        rows = [row for row in results if row["category"] == category]
        if rows:
            print(f"  {category}: {len(rows)} model; {sum(row['added'] for row in rows)} added")


if __name__ == "__main__":
    main()
