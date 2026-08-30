from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
CLUSTER_MARKER = "storage-intent-v1"
MAX_NEW_INTENTS = 6
STORAGE_RE = re.compile(r"^\d+(?:gb|tb)$", re.I)

CATEGORY_PROFILES = {
    "telefon": {
        "factors": "ekran, batarya, cihaz kayıt durumu ve genel kondisyon",
        "sales_basis": "cihazın kondisyonu, teknik durumu ve güncel piyasa talebi",
        "noun": "telefonun",
    },
    "tablet": {
        "factors": "ekran, batarya, bağlantı özellikleri ve genel kondisyon",
        "sales_basis": "kondisyon, batarya durumu ve güncel piyasa talebi",
        "noun": "tabletin",
    },
    "bilgisayar": {
        "factors": "işlemci, RAM, pil ve genel kondisyon",
        "sales_basis": "donanım, pil durumu, kondisyon ve güncel piyasa talebi",
        "noun": "bilgisayarın",
    },
    "akilli-saat": {
        "factors": "kasa boyutu, ekran, batarya ve genel kondisyon",
        "sales_basis": "kasa, batarya durumu, kondisyon ve güncel piyasa talebi",
        "noun": "saatin",
    },
    "oyun-konsolu": {
        "factors": "kozmetik durum, aksesuarlar ve çalışma durumu",
        "sales_basis": "aksesuarlar, çalışma durumu, kondisyon ve güncel piyasa talebi",
        "noun": "konsolun",
    },
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


def is_storage_page(path: Path, meta: dict) -> bool:
    try:
        rel = path.relative_to(ROOT)
    except ValueError:
        return False
    if len(rel.parts) != 5 or rel.parts[-1] != "index.md":
        return False
    if rel.parts[0] not in DEVICE_ROOTS or not STORAGE_RE.fullmatch(rel.parts[-2]):
        return False
    parent_page = path.parent.parent / "index.md"
    if not parent_page.exists():
        return False
    breadcrumbs = meta.get("seo_breadcrumbs")
    return not breadcrumbs or (isinstance(breadcrumbs, list) and len(breadcrumbs) == 5)


def display_subject(meta: dict, path: Path) -> str:
    breadcrumbs = meta.get("seo_breadcrumbs")
    if isinstance(breadcrumbs, list) and len(breadcrumbs) >= 5:
        brand = str(breadcrumbs[-3].get("label", "")).strip()
        model = str(breadcrumbs[-2].get("label", "")).strip()
        storage = str(breadcrumbs[-1].get("label", "")).strip()
        model_subject = model if normalize(brand) in normalize(model) else f"{brand} {model}".strip()
        if model_subject and storage:
            return f"{model_subject} {storage}".strip()

    h1 = str(meta.get("seo_h1", "")).strip()
    for marker in (" Ne Kadar Eder?", " İkinci El Fiyatı", " İkinci El Fiyatları"):
        if marker in h1:
            return h1.split(marker, 1)[0].strip()
    storage = path.parent.name.upper().replace("GB", " GB").replace("TB", " TB")
    model = path.parent.parent.name.replace("-", " ").title()
    return f"{model} {storage}".strip()


def candidate_intents(subject: str, category: str):
    profile = CATEGORY_PROFILES[category]
    factors = profile["factors"]
    sales_basis = profile["sales_basis"]
    noun = profile["noun"]
    return [
        (f"{subject} ne kadar eder", f"{subject} ne kadar eder?", f"Bu kapasite için güncel değer hesaplanırken {factors} ile piyasa koşulları birlikte değerlendirilir."),
        (f"{subject} kaça satılır", f"{subject} kaça satılır?", f"Tek bir sabit satış fiyatı yoktur; {sales_basis} satış aralığını etkiler."),
        (f"{subject} piyasa değeri", f"{subject} piyasa değeri ne kadar?", f"Piyasa değeri bu kapasiteye ek olarak {factors} bilgilerine göre değişen bir referanstır."),
        (f"{subject} ikinci el fiyatı", f"{subject} ikinci el fiyatı ne kadar?", f"İkinci el fiyatı belirlenirken bu kapasiteyle birlikte {factors} ve güncel piyasa koşulları dikkate alınmalıdır."),
        (f"{subject} kaç para eder", f"{subject} kaç para eder?", f"Tahmini değeri görmek için bu kapasitenin yanında {factors} bilgilerini doğru seçmek gerekir."),
        (f"{subject} kaça satarım", f"{subject} kaça satarım?", f"Uygun satış aralığı {sales_basis} dikkate alınarak belirlenir."),
        (f"{subject} kaça satabilirim", f"{subject} kaça satabilirim?", f"Satılabilecek tutar tek bir rakam değildir; bu kapasiteyle birlikte {factors} bilgileri {noun} güncel piyasa referansını etkiler."),
        (f"{subject} satsam ne kadar eder", f"{subject} satsam ne kadar eder?", f"Satış öncesinde bu kapasiteye ek olarak {factors} bilgilerini doğru seçerek tahmini ikinci el piyasa değerini kontrol edebilirsiniz."),
        (f"{subject} ikinci el fiyatları", f"{subject} ikinci el fiyatları ne kadar?", f"İkinci el fiyatları aynı kapasitede bile {sales_basis} nedeniyle farklılaşabilir."),
        (f"{subject} güncel ikinci el fiyatı", f"{subject} güncel ikinci el fiyatı ne kadar?", f"Güncel ikinci el fiyatını değerlendirirken bu kapasiteyle birlikte {factors} bilgilerini ve mevcut piyasa koşullarını dikkate almak gerekir."),
    ]


def visible_meta_text(meta: dict) -> str:
    keys = (
        "seo_title", "seo_description", "seo_h1", "seo_intro", "seo_context_heading",
        "seo_context", "seo_sections", "seo_faqs", "seo_links_heading",
    )
    return " ".join(json.dumps(meta[key], ensure_ascii=False) for key in keys if key in meta)


def process(path: Path):
    text, meta = read_frontmatter(path)
    if not meta or not is_storage_page(path, meta):
        return None

    sections = meta.get("seo_sections")
    if not isinstance(sections, list):
        sections = []
    base_sections = [
        section for section in sections
        if not (isinstance(section, dict) and section.get("kg_intent_cluster") == CLUSTER_MARKER)
    ]

    meta_without_cluster = dict(meta)
    meta_without_cluster["seo_sections"] = base_sections
    rel = path.relative_to(ROOT)
    category = rel.parts[0]
    subject = display_subject(meta_without_cluster, path)
    existing = normalize(visible_meta_text(meta_without_cluster))
    candidates = candidate_intents(subject, category)
    missing = [(phrase, question, answer) for phrase, question, answer in candidates if normalize(phrase) not in existing]
    selected = missing[:MAX_NEW_INTENTS]

    if selected:
        cluster = {
            "title": f"{subject} için sık aranan fiyat soruları",
            "text": "Bu kapasitenin ikinci el değeri farklı arama ifadeleriyle sorgulanabilir. Aşağıdaki kısa yanıtlar yalnızca katalogda bulunan mevcut kapasite sayfasını güçlendirir; yeni bir varyant oluşturmaz.",
            "items": [f"{question} {answer}" for _phrase, question, answer in selected],
            "kg_intent_cluster": CLUSTER_MARKER,
        }
        new_sections = base_sections + [cluster]
    else:
        new_sections = base_sections

    updated = replace_json_field(text, "seo_sections", new_sections)
    changed = updated != text
    if changed:
        path.write_text(updated, encoding="utf-8")

    final_meta = dict(meta_without_cluster)
    final_meta["seo_sections"] = new_sections
    final_text = normalize(visible_meta_text(final_meta))
    core = [normalize(phrase) for phrase, _question, _answer in candidates[:4]]
    expanded = [normalize(phrase) for phrase, _question, _answer in candidates[4:]]
    return {
        "path": str(rel),
        "category": category,
        "subject": subject,
        "changed": changed,
        "core_covered": sum(1 for phrase in core if phrase in final_text),
        "core_total": len(core),
        "expanded_covered": sum(1 for phrase in expanded if phrase in final_text),
        "expanded_total": len(expanded),
        "added": len(selected),
        "skipped_existing": len(candidates) - len(missing),
    }


def main():
    results = []
    for root_name in DEVICE_ROOTS:
        base = ROOT / root_name
        if not base.exists():
            continue
        for path in sorted(base.glob("*/*/*/index.md")):
            result = process(path)
            if result:
                results.append(result)

    print(
        "Storage intent expansion: "
        f"{len(results)} real storage page(s) scanned; "
        f"{sum(1 for row in results if row['changed'])} file(s) updated; "
        f"{sum(row['added'] for row in results)} missing intent phrase(s) added; "
        f"{sum(row['skipped_existing'] for row in results)} already-covered phrase(s) skipped."
    )
    for category in DEVICE_ROOTS:
        rows = [row for row in results if row["category"] == category]
        if rows:
            print(
                f"  {category}: {len(rows)} storage page(s); "
                f"{sum(row['added'] for row in rows)} added; "
                f"{sum(row['skipped_existing'] for row in rows)} skipped-existing"
            )


if __name__ == "__main__":
    main()
