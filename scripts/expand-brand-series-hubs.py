from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVICE_ROOTS = ("telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu")
MARKER = "brand-series-v1"
SERIES_PAGE_TYPE = "series_hub"
MIN_SERIES_MODELS = 3
LISTING_HUB_URL = "/ucretsiz-ilan-ver/"

CATEGORY = {
    "telefon": {
        "label": "Telefon",
        "noun": "telefon",
        "plural": "telefonlar",
        "factors": "model, hafıza, ekran, batarya, cihaz kayıt durumu ve genel kondisyon",
    },
    "tablet": {
        "label": "Tablet",
        "noun": "tablet",
        "plural": "tabletler",
        "factors": "model, kapasite, ekran, batarya ve genel kondisyon",
    },
    "bilgisayar": {
        "label": "Bilgisayar",
        "noun": "bilgisayar",
        "plural": "bilgisayarlar",
        "factors": "model, işlemci, RAM, depolama, pil ve genel kondisyon",
    },
    "akilli-saat": {
        "label": "Akıllı Saat",
        "noun": "akıllı saat",
        "plural": "akıllı saatler",
        "factors": "model, kasa boyutu, ekran, batarya ve genel kondisyon",
    },
    "oyun-konsolu": {
        "label": "Oyun Konsolu",
        "noun": "oyun konsolu",
        "plural": "oyun konsolları",
        "factors": "model, depolama, kozmetik durum, aksesuarlar ve çalışma durumu",
    },
}

# Curated, high-confidence series only. A hub is created only when at least
# MIN_SERIES_MODELS real model links match the rule on the existing brand page.
SERIES_RULES = {
    ("telefon", "samsung"): [
        ("galaxy-s-serisi", "Galaxy S Serisi", r"^Galaxy S(?:\d|\s)"),
        ("galaxy-a-serisi", "Galaxy A Serisi", r"^Galaxy A\d"),
        ("galaxy-m-serisi", "Galaxy M Serisi", r"^Galaxy M\d"),
        ("galaxy-z-fold-serisi", "Galaxy Z Fold Serisi", r"^Galaxy Z Fold"),
        ("galaxy-z-flip-serisi", "Galaxy Z Flip Serisi", r"^Galaxy Z Flip"),
    ],
    ("telefon", "xiaomi"): [
        ("redmi-note-serisi", "Redmi Note Serisi", r"^Redmi Note"),
        ("poco-serisi", "POCO Serisi", r"^(?:POCO|Poco) "),
    ],
    ("telefon", "oppo"): [
        ("reno-serisi", "Reno Serisi", r"^Reno"),
        ("find-serisi", "Find Serisi", r"^Find"),
        ("a-serisi", "A Serisi", r"^A\d"),
    ],
    ("telefon", "vivo"): [
        ("v-serisi", "V Serisi", r"^V\d"),
        ("x-serisi", "X Serisi", r"^X\d"),
        ("y-serisi", "Y Serisi", r"^Y\d"),
    ],
    ("telefon", "huawei"): [
        ("p-serisi", "P Serisi", r"^P\d"),
        ("pura-serisi", "Pura Serisi", r"^Pura "),
        ("mate-serisi", "Mate Serisi", r"^Mate "),
        ("nova-serisi", "Nova Serisi", r"^Nova "),
    ],
    ("telefon", "honor"): [
        ("x-serisi", "X Serisi", r"^X\d"),
        ("magic-serisi", "Magic Serisi", r"^Magic"),
    ],
    ("telefon", "realme"): [
        ("gt-serisi", "GT Serisi", r"^GT "),
        ("c-serisi", "C Serisi", r"^C\d"),
    ],
    ("telefon", "oneplus"): [
        ("nord-serisi", "Nord Serisi", r"^Nord"),
    ],
    ("tablet", "apple"): [
        ("ipad-air-serisi", "iPad Air Serisi", r"^iPad Air"),
        ("ipad-pro-serisi", "iPad Pro Serisi", r"^iPad Pro"),
        ("ipad-mini-serisi", "iPad mini Serisi", r"^iPad mini"),
    ],
    ("tablet", "samsung"): [
        ("galaxy-tab-s-serisi", "Galaxy Tab S Serisi", r"^Galaxy Tab S"),
        ("galaxy-tab-a-serisi", "Galaxy Tab A Serisi", r"^Galaxy Tab A"),
    ],
    ("tablet", "xiaomi"): [
        ("xiaomi-pad-serisi", "Xiaomi Pad Serisi", r"^Xiaomi Pad"),
        ("redmi-pad-serisi", "Redmi Pad Serisi", r"^Redmi Pad"),
        ("poco-pad-serisi", "POCO Pad Serisi", r"^(?:POCO|Poco) Pad"),
    ],
    ("tablet", "huawei"): [
        ("matepad-pro-serisi", "MatePad Pro Serisi", r"^MatePad Pro"),
        ("matepad-se-serisi", "MatePad SE Serisi", r"^MatePad SE"),
    ],
    ("tablet", "lenovo"): [
        ("tab-serisi", "Tab Serisi", r"^(?:Lenovo )?Tab "),
    ],
    ("tablet", "honor"): [
        ("pad-serisi", "Pad Serisi", r"^(?:Honor )?Pad"),
    ],
    ("bilgisayar", "apple"): [
        ("macbook-air-serisi", "MacBook Air Serisi", r"^MacBook Air"),
        ("macbook-pro-serisi", "MacBook Pro Serisi", r"^MacBook Pro"),
    ],
    ("akilli-saat", "apple"): [
        ("apple-watch-series-serisi", "Apple Watch Series", r"^Apple Watch Series"),
        ("apple-watch-ultra-serisi", "Apple Watch Ultra Serisi", r"^Apple Watch Ultra"),
        ("apple-watch-se-serisi", "Apple Watch SE Serisi", r"^Apple Watch SE"),
    ],
    ("akilli-saat", "huawei"): [
        ("watch-gt-serisi", "Watch GT Serisi", r"^(?:Huawei )?Watch GT"),
        ("watch-fit-serisi", "Watch Fit Serisi", r"^(?:Huawei )?Watch Fit"),
        ("watch-serisi", "Watch Serisi", r"^(?:Huawei )?Watch [345](?:\s|$)"),
    ],
    ("akilli-saat", "samsung"): [
        ("galaxy-watch-serisi", "Galaxy Watch Serisi", r"^Galaxy Watch"),
    ],
    ("oyun-konsolu", "playstation"): [
        ("playstation-4-serisi", "PlayStation 4 Serisi", r"^PlayStation 4"),
        ("playstation-5-serisi", "PlayStation 5 Serisi", r"^PlayStation 5"),
    ],
    ("oyun-konsolu", "xbox"): [
        ("xbox-one-serisi", "Xbox One Serisi", r"^Xbox One"),
        ("xbox-series-serisi", "Xbox Series Serisi", r"^Xbox Series"),
    ],
}


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


def replace_field(text: str, key: str, value) -> str:
    encoded = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    pattern = re.compile(rf"^{re.escape(key)}:\s*.*$", re.MULTILINE)
    line = f"{key}: {encoded}"
    if pattern.search(text):
        return pattern.sub(line, text, count=1)
    end = text.find("\n---\n", 4)
    if end == -1:
        return text
    return text[:end] + "\n" + line + text[end:]


def brand_label(meta: dict, slug: str) -> str:
    crumbs = meta.get("seo_breadcrumbs")
    if isinstance(crumbs, list) and crumbs:
        value = str(crumbs[-1].get("label", "")).strip()
        if value:
            return value
    return slug.replace("-", " ").title()


def model_links(meta: dict, category: str, brand_slug: str):
    prefix = f"/{category}/{brand_slug}/"
    out = []
    for link in meta.get("seo_links", []) if isinstance(meta.get("seo_links"), list) else []:
        if not isinstance(link, dict):
            continue
        url = str(link.get("url", ""))
        label = str(link.get("label", "")).strip()
        rest = url[len(prefix):] if url.startswith(prefix) else ""
        if not label or not rest or rest.count("/") != 1:
            continue
        # Do not mistake previously generated series pages for product models.
        if link.get("kg_series_link") == MARKER or rest.rstrip("/").endswith("-serisi"):
            continue
        out.append({"label": label, "url": url})
    return out


def matched_series(category: str, brand_slug: str, links: list[dict]):
    found = []
    for slug, label, pattern in SERIES_RULES.get((category, brand_slug), []):
        rx = re.compile(pattern, re.IGNORECASE)
        members = [link for link in links if rx.search(link["label"])]
        if len(members) >= MIN_SERIES_MODELS:
            found.append({"slug": slug, "label": label, "members": members})
    return found


def category_text(category: str):
    return CATEGORY[category]


def enrich_brand_page(path: Path, category: str, brand_slug: str):
    text, meta = read_frontmatter(path)
    if not meta or meta.get("seo_page_type") == SERIES_PAGE_TYPE:
        return None
    brand = brand_label(meta, brand_slug)
    links = model_links(meta, category, brand_slug)
    series = matched_series(category, brand_slug, links)
    profile = category_text(category)

    sections = meta.get("seo_sections") if isinstance(meta.get("seo_sections"), list) else []
    sections = [s for s in sections if not (isinstance(s, dict) and s.get("kg_brand_series") == MARKER)]
    sections.extend([
        {
            "title": f"{brand} {profile['noun']} ikinci el fiyatları nasıl değerlendirilir?",
            "text": f"{brand} {profile['plural']} için tek bir sabit ikinci el fiyatı yoktur. Güncel piyasa değeri; {profile['factors']} ile piyasa koşulları birlikte değerlendirilerek anlaşılmalıdır. Bu sayfadaki gerçek model bağlantılarından cihazınızı seçerek kendi modelinizin değerleme sayfasına geçebilirsiniz.",
            "kg_brand_series": MARKER,
        },
        {
            "title": f"{brand} {profile['noun']} piyasa değeri ve model farkları",
            "text": f"Aynı {brand} markasında seri, nesil ve donanım farkları ikinci el piyasa değerini değiştirebilir. Bu nedenle marka ortalamasına bakmak yerine gerçek modeli seçmek daha anlamlıdır. KaçaGider marka merkezi, {len(links)} gerçek model sayfasını tek yerde toplayarak modeller arasında daha hızlı geçiş sağlar.",
            "kg_brand_series": MARKER,
        },
        {
            "title": f"{brand} cihazını satmadan önce değerini kontrol et",
            "text": "Satış fiyatı belirlemeden önce cihazın güncel piyasa değerini kontrol etmek, ilan fiyatını piyasanın çok altında veya üstünde belirleme riskini azaltır. Model sayfasında değerleme yaptıktan sonra KaçaGider'in ücretsiz ilan akışına geçebilirsiniz.",
            "kg_brand_series": MARKER,
        },
    ])

    faqs = meta.get("seo_faqs") if isinstance(meta.get("seo_faqs"), list) else []
    faqs = [f for f in faqs if not (isinstance(f, dict) and f.get("kg_brand_series") == MARKER)]
    faqs.extend([
        {
            "question": f"{brand} {profile['noun']} ikinci el fiyatları nasıl öğrenilir?",
            "answer": f"Önce bu sayfadan gerçek {brand} modelinizi seçin. Ardından {profile['factors']} bilgilerini girerek modelin güncel ikinci el piyasa değerini ücretsiz kontrol edebilirsiniz.",
            "kg_brand_series": MARKER,
        },
        {
            "question": f"{brand} {profile['noun']} piyasa değeri neye göre değişir?",
            "answer": f"Piyasa değeri; {profile['factors']} ve güncel ikinci el talebine göre değişir. Bu nedenle aynı markadaki iki modelin satış değeri farklı olabilir.",
            "kg_brand_series": MARKER,
        },
        {
            "question": f"{brand} cihazımı kaça satabilirim?",
            "answer": "Satılabilecek tutar tek bir sabit rakam değildir. Gerçek modelinizi ve cihaz durumunu seçerek KaçaGider'deki güncel piyasa değeri referansını kontrol edip satış kararınızı buna göre verebilirsiniz.",
            "kg_brand_series": MARKER,
        },
    ])

    guides = meta.get("seo_guides") if isinstance(meta.get("seo_guides"), list) else []
    guides = [g for g in guides if not (isinstance(g, dict) and g.get("kg_brand_series") == MARKER)]
    for item in series:
        guides.append({
            "label": f"{brand} {item['label']} ikinci el fiyatları",
            "url": f"/{category}/{brand_slug}/{item['slug']}/",
            "kg_brand_series": MARKER,
        })
    guides.extend([
        {"label": f"Tüm {profile['label'].lower()} değerleme sayfaları", "url": f"/{category}/", "kg_brand_series": MARKER},
        {"label": "Değerini öğren ve ücretsiz ilan ver", "url": LISTING_HUB_URL, "kg_brand_series": MARKER},
    ])

    updated = text
    updated = replace_field(updated, "seo_sections", sections)
    updated = replace_field(updated, "seo_faqs", faqs)
    updated = replace_field(updated, "seo_guides", guides)
    updated = replace_field(updated, "seo_guides_heading", f"{brand} serileri ve değerleme rehberi")
    changed = updated != text
    if changed:
        path.write_text(updated, encoding="utf-8")

    return {"brand": brand, "models": len(links), "series": series, "changed": changed}


def series_page_content(category: str, brand_slug: str, brand: str, series: dict) -> str:
    profile = category_text(category)
    series_name = f"{brand} {series['label']}"
    url = f"/{category}/{brand_slug}/{series['slug']}/"
    members = series["members"]
    breadcrumbs = [
        {"label": "Ana Sayfa", "url": "/"},
        {"label": profile["label"], "url": f"/{category}/"},
        {"label": brand, "url": f"/{category}/{brand_slug}/"},
        {"label": series["label"], "url": url},
    ]
    sections = [
        {
            "title": f"{series_name} ne kadar eder?",
            "text": f"{series_name} modellerinin ikinci el değeri tek bir rakam değildir. {profile['factors'].capitalize()} ile güncel piyasa koşulları birlikte değerlendirilir. Aşağıdaki gerçek modellerden cihazınızı seçerek model bazlı değerleme sayfasına geçebilirsiniz.",
        },
        {
            "title": f"{series_name} kaça satılır?",
            "text": f"Aynı seride model yılı, donanım ve kondisyon farkları satış değerini değiştirebilir. Bu merkezde {len(members)} gerçek {series['label']} modeli bulunur; doğru modeli seçerek güncel piyasa değeri referansını kontrol edebilirsiniz.",
        },
        {
            "title": f"{series_name} ikinci el fiyatları ve piyasa değeri",
            "text": "İkinci el fiyatlarını karşılaştırırken yalnızca seri adına bakmak yerine model ve cihaz durumunu birlikte değerlendirmek gerekir. KaçaGider, seri merkezinden doğru modele geçişi kolaylaştırır; sabit veya gerçeğe aykırı bir fiyat vaadi vermez.",
        },
    ]
    faqs = [
        {
            "question": f"{series_name} ikinci el fiyatları ne kadar?",
            "answer": f"Fiyatlar modele ve cihaz durumuna göre değişir. Bu sayfadaki {len(members)} gerçek modelden cihazınızı seçerek güncel ikinci el piyasa değeri referansını kontrol edebilirsiniz.",
        },
        {
            "question": f"{series_name} piyasa değeri nasıl hesaplanır?",
            "answer": f"Değerleme sırasında {profile['factors']} ve güncel piyasa koşulları birlikte dikkate alınır.",
        },
        {
            "question": f"{series_name} satmadan önce ne yapmalıyım?",
            "answer": "Önce gerçek modelinizi seçip piyasa değerini kontrol edin. Ardından satış fiyatınızı belirleyebilir ve KaçaGider'deki ücretsiz ilan akışına geçebilirsiniz.",
        },
    ]
    guides = [
        {"label": f"Tüm {brand} modelleri", "url": f"/{category}/{brand_slug}/"},
        {"label": "Değerini öğren ve ücretsiz ilan ver", "url": LISTING_HUB_URL},
    ]
    fields = {
        "layout": "seo",
        "seo_page_type": SERIES_PAGE_TYPE,
        "seo_hub_version": MARKER,
        "seo_title": f"{series_name} İkinci El Fiyatları ve Piyasa Değeri | KaçaGider",
        "seo_description": f"{series_name} ikinci el fiyatları ve piyasa değeri için gerçek modelinizi seçin; cihaz durumuna göre güncel satış değeri referansını KaçaGider ile ücretsiz kontrol edin.",
        "seo_h1": f"{series_name} İkinci El Fiyatları ve Piyasa Değeri",
        "seo_intro": f"{series_name} modellerinin ne kadar ettiğini, kaça satılabileceğini ve güncel ikinci el piyasa değerini öğrenmek için modelinizi seçin. Değerleme cihazın gerçek özellikleri ve kondisyonuna göre yapılır.",
        "seo_context_heading": f"{series_name} için ikinci el değerleme",
        "seo_context": f"{series_name} ailesindeki {len(members)} gerçek modeli tek merkezde inceleyin. Modelinizi seçerek güncel ikinci el piyasa değerini kontrol edin ve isterseniz ücretsiz ilan verme akışına devam edin.",
        "seo_breadcrumbs": breadcrumbs,
        "seo_links": members,
        "seo_links_heading": f"{series_name} modelleri",
        "seo_guides": guides,
        "seo_guides_heading": f"{series_name} rehberi",
        "seo_sections": sections,
        "seo_faqs": faqs,
        "seo_canonical": f"https://kacagider.com.tr{url}",
    }
    lines = ["---"]
    for key, value in fields.items():
        lines.append(f"{key}: {json.dumps(value, ensure_ascii=False, separators=(',', ':'))}")
    lines.extend(["---", ""])
    return "\n".join(lines)


def add_model_series_link(model_url: str, category: str, brand_slug: str, brand: str, series: dict):
    rel = model_url.strip("/")
    path = ROOT / rel / "index.md"
    if not path.exists():
        return False
    text, meta = read_frontmatter(path)
    if not meta or meta.get("seo_page_type") == SERIES_PAGE_TYPE:
        return False
    links = meta.get("seo_links") if isinstance(meta.get("seo_links"), list) else []
    base = [l for l in links if not (isinstance(l, dict) and l.get("kg_series_link") == MARKER)]
    series_link = {
        "label": f"{brand} {series['label']} fiyatlarını karşılaştır",
        "url": f"/{category}/{brand_slug}/{series['slug']}/",
        "kg_series_link": MARKER,
    }
    base.append(series_link)
    updated = replace_field(text, "seo_links", base)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def ensure_sitemap(series_urls: list[str]):
    path = ROOT / "sitemap.xml"
    text = path.read_text(encoding="utf-8")
    # Remove only URLs generated by this program if they are being rebuilt.
    for category, brand_slug in SERIES_RULES:
        for slug, _label, _pattern in SERIES_RULES[(category, brand_slug)]:
            url = f"https://kacagider.com.tr/{category}/{brand_slug}/{slug}/"
            text = re.sub(rf"\n?\s*<url><loc>{re.escape(url)}</loc>.*?</url>", "", text)
    stamp = date.today().isoformat()
    entries = "\n".join(
        f"  <url><loc>{url}</loc><lastmod>{stamp}</lastmod><changefreq>weekly</changefreq><priority>0.75</priority></url>"
        for url in sorted(series_urls)
    )
    if entries:
        text = text.replace("</urlset>", entries + "\n</urlset>")
    path.write_text(text, encoding="utf-8")


def main():
    brand_rows = []
    series_rows = []
    model_links_added = 0
    series_urls = []

    for category in DEVICE_ROOTS:
        root = ROOT / category
        if not root.exists():
            continue
        for brand_dir in sorted(p for p in root.iterdir() if p.is_dir()):
            brand_index = brand_dir / "index.md"
            if not brand_index.exists():
                continue
            row = enrich_brand_page(brand_index, category, brand_dir.name)
            if not row:
                continue
            brand_rows.append((category, brand_dir.name, row))
            for series in row["series"]:
                target = brand_dir / series["slug"] / "index.md"
                target.parent.mkdir(parents=True, exist_ok=True)
                content = series_page_content(category, brand_dir.name, row["brand"], series)
                if not target.exists() or target.read_text(encoding="utf-8") != content:
                    target.write_text(content, encoding="utf-8")
                series_rows.append((category, brand_dir.name, row["brand"], series))
                series_urls.append(f"https://kacagider.com.tr/{category}/{brand_dir.name}/{series['slug']}/")
                for member in series["members"]:
                    if add_model_series_link(member["url"], category, brand_dir.name, row["brand"], series):
                        model_links_added += 1

    ensure_sitemap(series_urls)

    print("SEO BRAND + SERIES HUB GENERATOR")
    print(f"Brand hubs scanned/enriched: {len(brand_rows)}")
    print(f"Series hubs generated: {len(series_rows)}")
    print(f"Model -> series internal links added: {model_links_added}")
    for category in DEVICE_ROOTS:
        brands = [x for x in brand_rows if x[0] == category]
        series = [x for x in series_rows if x[0] == category]
        print(f"  {category}: {len(brands)} brand hub | {len(series)} series hub")
    print("Series hubs:")
    for category, brand_slug, brand, series in series_rows:
        print(f"  - /{category}/{brand_slug}/{series['slug']}/ | {brand} {series['label']} | {len(series['members'])} model")


if __name__ == "__main__":
    main()
