from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
CLUSTER_MARKER = "model-intent-v1"
MAX_NEW_INTENTS = 6

CATEGORY_PROFILES = {
    "telefon": {
        "factors": "hafıza, ekran, batarya, cihaz kayıt durumu ve genel kondisyon",
        "short": "hafıza ve kondisyon",
        "noun": "telefonun",
    },
    "tablet": {
        "factors": "kapasite, ekran, batarya ve genel kondisyon",
        "short": "kapasite ve kondisyon",
        "noun": "tabletin",
    },
    "bilgisayar": {
        "factors": "işlemci, RAM, depolama, pil ve genel kondisyon",
        "short": "donanım, depolama ve kondisyon",
        "noun": "bilgisayarın",
    },
    "akilli-saat": {
        "factors": "kasa boyutu, ekran, batarya ve genel kondisyon",
        "short": "kasa boyutu ve kondisyon",
        "noun": "saatin",
    },
    "oyun-konsolu": {
        "factors": "depolama, kozmetik durum, aksesuarlar ve çalışma durumu",
        "short": "depolama, aksesuar ve kondisyon",
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
        return text, {}, []
    end = text.find("\n---\n", 4)
    if end == -1:
        return text, {}, []
    lines = text[4:end].splitlines()
    meta = {}
    for line in lines:
        if ": " not in line:
            continue
        key, raw = line.split(": ", 1)
        try:
            meta[key] = json.loads(raw)
        except json.JSONDecodeError:
            meta[key] = raw.strip('"')
    return text, meta, lines


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
        if model and brand:
            return model if normalize(brand) in normalize(model) else f"{brand} {model}"
        return model or brand

    h1 = str(meta.get("seo_h1", "")).strip()
    for marker in (" Ne Kadar Eder?", " İkinci El Fiyatı", " İkinci El Fiyatları"):
        if marker in h1:
            return h1.split(marker, 1)[0].strip()
    return path.parent.name.replace("-", " ").strip().title()


def candidate_intents(subject: str, category: str):
    profile = CATEGORY_PROFILES[category]
    factors = profile["factors"]
    short = profile["short"]
    noun = profile["noun"]
    return [
        (f"{subject} ne kadar eder", f"{subject} ne kadar eder?", f"Değer hesaplanırken {factors} ile güncel piyasa koşulları birlikte değerlendirilir."),
        (f"{subject} kaça satılır", f"{subject} kaça satılır?", f"Tek bir sabit satış fiyatı yoktur; {short} ile güncel ikinci el talebi satış aralığını etkiler."),
        (f"{subject} piyasa değeri", f"{subject} piyasa değeri ne kadar?", f"Piyasa değeri {factors} bilgilerine göre değişen bir referanstır; KaçaGider bu verileri birlikte değerlendirir."),
        (f"{subject} ikinci el fiyatı", f"{subject} ikinci el fiyatı ne kadar?", f"İkinci el fiyatı {factors} ve güncel piyasa koşulları dikkate alınarak değerlendirilmelidir."),
        (f"{subject} kaç para eder", f"{subject} kaç para eder?", f"Tahmini değeri görmek için {factors} bilgilerini doğru seçmek gerekir."),
        (f"{subject} kaça satarım", f"{subject} kaça satarım?", f"Uygun satış aralığı {short}, cihazın gerçek durumu ve piyasadaki güncel talebe göre değişebilir."),
        (f"{subject} kaça satabilirim", f"{subject} kaça satabilirim?", f"Satılabilecek tutar tek bir rakam değildir; {factors} bilgileri {noun} güncel piyasa referansını etkiler."),
        (f"{subject} satsam ne kadar eder", f"{subject} satsam ne kadar eder?", f"Satış öncesinde {factors} bilgilerini doğru seçerek tahmini ikinci el piyasa değerini kontrol edebilirsiniz."),
        (f"{subject} ikinci el fiyatları", f"{subject} ikinci el fiyatları ne kadar?", f"İkinci el fiyatları {short}, ürünün kullanım durumu ve piyasa hareketlerine göre farklılaşabilir."),
        (f"{subject} güncel ikinci el fiyatı", f"{subject} güncel ikinci el fiyatı ne kadar?", f"Güncel ikinci el fiyatını değerlendirirken {factors} ile mevcut piyasa koşullarını birlikte dikkate almak gerekir."),
        (f"{subject} ikinci el piyasa değeri", f"{subject} ikinci el piyasa değeri ne kadar?", f"İkinci el piyasa değeri {short} temelinde oluşan güncel satış referansını ifade eder."),
        (f"{subject} piyasa fiyatı", f"{subject} piyasa fiyatı ne kadar?", f"Piyasa fiyatı zaman içinde değişebilir; bu nedenle {factors} bilgileriyle güncel sonucu yeniden kontrol etmek gerekir."),
        (f"{subject} fiyat sorgulama", f"{subject} fiyat sorgulama nasıl yapılır?", f"Fiyat sorgulamak için model ve {short} bilgilerini değerleme aracında seçerek güncel tahmini değeri görüntüleyebilirsiniz."),
        (f"{subject} değer sorgulama", f"{subject} değer sorgulama nasıl yapılır?", f"Değer sorgulama sonucunun anlamlı olması için {factors} bilgilerinin doğru girilmesi önemlidir."),
    ]


def visible_meta_text(meta: dict) -> str:
    keys = (
        "seo_title", "seo_description", "seo_h1", "seo_intro", "seo_context_heading",
        "seo_context", "seo_sections", "seo_faqs", "seo_links_heading",
    )
    parts = []
    for key in keys:
        if key in meta:
            parts.append(json.dumps(meta[key], ensure_ascii=False))
    return " ".join(parts)


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
    text, meta, _ = read_frontmatter(path)
    if not meta or not is_model_page(path, meta):
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
        items = [f"{question} {answer}" for _phrase, question, answer in selected]
        cluster = {
            "title": f"{subject} için sık aranan fiyat soruları",
            "text": "Aynı ikinci el fiyat ihtiyacı farklı arama ifadeleriyle sorulabilir. Aşağıdaki kısa yanıtlar, cihazın gerçek özellikleri ve kondisyonuyla daha bilinçli bir satış değeri değerlendirmesi yapmanıza yardımcı olur.",
            "items": items,
            "kg_intent_cluster": CLUSTER_MARKER,
        }
        new_sections = base_sections + [cluster]
    else:
        new_sections = base_sections

    updated = replace_json_field(text, "seo_sections", new_sections)
    changed = updated != text
    if changed:
        path.write_text(updated, encoding="utf-8")

    core = [normalize(phrase) for phrase, _question, _answer in candidates[:4]]
    expanded = [normalize(phrase) for phrase, _question, _answer in candidates[4:]]
    final_meta = dict(meta_without_cluster)
    final_meta["seo_sections"] = new_sections
    final_text = normalize(visible_meta_text(final_meta))
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
        for path in sorted(base.glob("*/*/index.md")):
            result = process(path)
            if result:
                results.append(result)

    changed = sum(1 for item in results if item["changed"])
    added = sum(item["added"] for item in results)
    skipped = sum(item["skipped_existing"] for item in results)
    print(
        "Model intent expansion: "
        f"{len(results)} model page(s) scanned; {changed} file(s) updated; "
        f"{added} missing intent phrase(s) added; {skipped} already-covered phrase(s) skipped."
    )
    for category in DEVICE_ROOTS:
        category_rows = [row for row in results if row["category"] == category]
        if category_rows:
            print(
                f"  {category}: {len(category_rows)} model; "
                f"{sum(row['added'] for row in category_rows)} added; "
                f"{sum(row['skipped_existing'] for row in category_rows)} skipped-existing"
            )


if __name__ == "__main__":
    main()
