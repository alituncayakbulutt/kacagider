#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = {"telefon", "tablet", "bilgisayar", "akilli-saat", "oyun-konsolu"}
TODAY = os.environ.get("KG_SNAPSHOT_DATE") or dt.datetime.now(dt.timezone.utc).date().isoformat()
NOW_UTC = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def split_frontmatter(text: str):
    if not text.startswith("---\n"):
        return None
    marker = text.find("\n---", 4)
    if marker == -1:
        return None
    front = text[4:marker]
    rest = text[marker + 4 :]
    if rest.startswith("\n"):
        rest = rest[1:]
    return front.splitlines(), rest


def load_doc(path: Path):
    parsed = split_frontmatter(path.read_text(encoding="utf-8"))
    if not parsed:
        return None
    lines, body = parsed
    raw = {}
    for line in lines:
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        raw[key.strip()] = value.strip()
    return {"lines": lines, "body": body, "raw": raw}


def decode(raw_value, default=None):
    if raw_value is None:
        return default
    try:
        return json.loads(raw_value)
    except Exception:
        return raw_value.strip().strip('"')


def set_value(doc, key: str, value):
    if isinstance(value, (list, dict)):
        rendered = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    elif isinstance(value, bool):
        rendered = "true" if value else "false"
    else:
        rendered = json.dumps(str(value), ensure_ascii=False)
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


def get_list(doc, key: str):
    value = decode(doc["raw"].get(key), [])
    return value if isinstance(value, list) else []


def display_storage(slug: str) -> str:
    m = re.fullmatch(r"(\d+)(gb|tb)", slug.lower())
    if not m:
        return slug.upper()
    return f"{m.group(1)} {m.group(2).upper()}"


def model_display(model_page: Path) -> str:
    doc = load_doc(model_page)
    if not doc:
        return model_page.parent.name.replace("-", " ").title()
    h1 = str(decode(doc["raw"].get("seo_h1"), ""))
    if not h1:
        return model_page.parent.name.replace("-", " ").title()
    patterns = [
        r"\s+Ne Kadar Eder\?.*$",
        r"\s+İkinci El Fiyatı.*$",
        r"\s+Kaça Satılır\?.*$",
        r"\s+Piyasa Değeri.*$",
    ]
    name = h1
    for pattern in patterns:
        name = re.sub(pattern, "", name, flags=re.I)
    return name.strip() or model_page.parent.name.replace("-", " ").title()


def has_cluster(items, cluster: str) -> bool:
    return any(isinstance(item, dict) and item.get("kg_intent_cluster") == cluster for item in items)


def ensure_link(links, label: str, url: str, marker: str | None = None):
    if any(isinstance(item, dict) and item.get("url") == url for item in links):
        return
    entry = {"label": label, "url": url}
    if marker:
        entry["kg_link_cluster"] = marker
    links.append(entry)


def add_capacity_and_listing(path: Path, doc, model_name: str, storage: str):
    sections = get_list(doc, "seo_sections")
    faqs = get_list(doc, "seo_faqs")
    links = get_list(doc, "seo_links")

    if not has_cluster(sections, "capacity-intent-v2"):
        sections.append({
            "title": f"{model_name} {storage} ikinci el değeri nasıl değişir?",
            "text": (
                f"{model_name} {storage} için ikinci el değer, yalnızca kapasiteye göre değil; "
                "ekran, pil, kasa, değişen parça, kayıt durumu ve genel kondisyonla birlikte değerlendirilir. "
                "Bu sayfa yalnızca katalogda gerçekten bulunan kapasite seçeneği için oluşturulur."
            ),
            "items": [
                f"{model_name} {storage} ne kadar eder? Cihaz bilgilerini doğru seçerek güncel piyasa referansını hesaplayabilirsiniz.",
                f"{model_name} {storage} kaça satılır? Satış aralığı kondisyon ve güncel piyasa koşullarına göre değişebilir.",
                f"{model_name} {storage} ikinci el fiyatı ne kadar? Tek sabit rakam yerine cihazın gerçek durumuna göre hesaplanan değeri kullanmak daha sağlıklıdır.",
                f"{model_name} {storage} piyasa değeri nedir? KaçaGider sonucu, satış kararını destekleyen güncel bir piyasa referansıdır."
            ],
            "kg_intent_cluster": "capacity-intent-v2"
        })

    if not any(
        isinstance(item, dict) and str(item.get("kg_intent_cluster", "")).startswith("listing-intent")
        for item in sections
    ):
        sections.append({
            "title": f"{model_name} {storage} fiyatını öğren ve ücretsiz ilan ver",
            "text": (
                "Önce cihazın güncel piyasa değerini hesaplayın; ardından KaçaGider ücretsiz ilan akışında "
                "satış fiyatını ve ilan bilgilerini tamamlayın. Değerleme ücretsizdir; ilan yayınlamak için üyelik gerekir."
            ),
            "items": [
                f"{model_name} {storage} için ücretsiz ilan verebilir miyim? Evet; önce değerini hesaplayıp sonra ilan akışına geçebilirsiniz.",
                f"{model_name} {storage} satış fiyatını nasıl belirlemeliyim? Hesaplanan piyasa referansını cihazın gerçek kondisyonuyla birlikte değerlendirin."
            ],
            "kg_intent_cluster": "listing-intent-v2"
        })

    faq_questions = {item.get("question") for item in faqs if isinstance(item, dict)}
    q1 = f"{model_name} {storage} kaça satılır?"
    if q1 not in faq_questions:
        faqs.append({
            "question": q1,
            "answer": "Satış değeri kapasiteyle birlikte cihazın kondisyonu ve güncel piyasa koşullarına göre değişir; KaçaGider üzerinden güncel referansı hesaplayabilirsiniz."
        })
    q2 = f"{model_name} için {storage} kapasite ikinci el değeri etkiler mi?"
    if q2 not in faq_questions:
        faqs.append({
            "question": q2,
            "answer": "Evet. Kapasite değerleme girdilerinden biridir; ancak tek başına belirleyici değildir. Ekran, pil, kasa ve genel kondisyon da birlikte değerlendirilir."
        })

    ensure_link(links, "Değerini öğren ve ücretsiz ilan ver", "/ucretsiz-ilan-ver/", "listing-intent-v2")
    ensure_link(links, "KaçaGider piyasa verisi ve fiyat geçmişi", "/piyasa-verisi/", "market-data-v1")
    ensure_link(links, "Model karşılaştırma rehberi", "/model-karsilastirma/", "comparison-intent-v1")

    set_value(doc, "seo_sections", sections)
    set_value(doc, "seo_faqs", faqs)
    set_value(doc, "seo_links", links)
    set_value(doc, "kg_seo_stage", "4-10-v1")
    save_doc(path, doc)


def add_model_comparison_and_authority(path: Path, doc, model_name: str, category: str, brand: str):
    sections = get_list(doc, "seo_sections")
    links = get_list(doc, "seo_links")

    if not any(
        isinstance(item, dict) and str(item.get("kg_intent_cluster", "")).startswith("listing-intent")
        for item in sections
    ):
        sections.append({
            "title": f"{model_name} fiyatını öğren ve ücretsiz ilan ver",
            "text": "Önce cihazın güncel piyasa değerini hesaplayın; ardından ücretsiz ilan akışında satış fiyatını belirleyip ilanınızı oluşturun.",
            "kg_intent_cluster": "listing-intent-v2"
        })

    if not has_cluster(sections, "comparison-intent-v1"):
        related = []
        prefix = f"/{category}/{brand}/"
        current = "/" + "/".join(path.relative_to(ROOT).parts[:-1]) + "/"
        for item in links:
            if not isinstance(item, dict):
                continue
            url = item.get("url", "")
            label = item.get("label", "")
            if not (isinstance(url, str) and url.startswith(prefix) and url != current):
                continue
            parts = url.strip("/").split("/")
            if len(parts) != 3:
                continue
            if label and label not in {x["label"] for x in related}:
                related.append({"label": label, "url": url})
            if len(related) >= 3:
                break
        items = [
            f"{model_name} ile {r['label']} arasında karar verirken iki modelin kapasite ve kondisyon bilgilerini ayrı ayrı hesaplayıp güncel ikinci el referanslarını karşılaştırın."
            for r in related
        ]
        if not items:
            items = [
                f"{model_name} karşılaştırmasında kapasite, kondisyon ve güncel piyasa referansını aynı ölçütlerle değerlendirin.",
                "Benzer modellerin fiyatlarını tek bir sabit rakamla değil, aynı kondisyon varsayımlarıyla karşılaştırın."
            ]
        sections.append({
            "title": f"{model_name} benzer modellerle nasıl karşılaştırılır?",
            "text": "İkinci el model karşılaştırmasında yalnızca model adını değil; kapasite, cihaz yaşı, ekran, pil ve genel kondisyonu aynı varsayımlarla değerlendirmek gerekir.",
            "items": items,
            "kg_intent_cluster": "comparison-intent-v1"
        })

    ensure_link(links, "Model karşılaştırma rehberi", "/model-karsilastirma/", "comparison-intent-v1")
    ensure_link(links, "KaçaGider piyasa verisi ve fiyat geçmişi", "/piyasa-verisi/", "market-data-v1")
    ensure_link(links, "Değerleme ve veri metodolojisi", "/veri-metodolojisi/", "authority-v1")

    set_value(doc, "seo_sections", sections)
    set_value(doc, "seo_links", links)
    set_value(doc, "kg_seo_stage", "4-10-v1")
    save_doc(path, doc)


def extract_phone_prices():
    js = ROOT / "data" / "phone-prices.js"
    code = r"""
const fs = require('fs');
const vm = require('vm');
const src = fs.readFileSync(process.argv[1], 'utf8');
const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: process.argv[1] });
const out = vm.runInContext('JSON.stringify(PHONE_PRICE_DATA)', sandbox);
process.stdout.write(out);
"""
    proc = subprocess.run(
        ["node", "-e", code, str(js)],
        check=True,
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    return json.loads(proc.stdout)


def snapshot_prices():
    history_dir = ROOT / "data" / "price-history"
    history_dir.mkdir(parents=True, exist_ok=True)
    snapshot_path = history_dir / f"{TODAY}.json"

    if not snapshot_path.exists():
        data = extract_phone_prices()
        payload = {
            "snapshot_date": TODAY,
            "captured_at_utc": NOW_UTC,
            "source": "data/phone-prices.js",
            "scope": "KaçaGider telefon fiyat kataloğu",
            "note": "Bu dosya KaçaGider'de o tarihte kullanılan fiyat kataloğunun değiştirilemez tarihli snapshot'ıdır. Geçmişe dönük veri üretilmez; tarihçe yalnızca gerçek çalışma günlerinde birikir.",
            "data": data,
        }
        snapshot_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )

    snapshots = sorted(p.name for p in history_dir.glob("????-??-??.json") if p.name != "index.json")
    manifest = {
        "description": "KaçaGider tarihli telefon fiyat kataloğu snapshot listesi.",
        "first_snapshot": snapshots[0][:-5] if snapshots else None,
        "latest_snapshot": snapshots[-1][:-5] if snapshots else None,
        "snapshots": snapshots,
    }
    (history_dir / "index.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return snapshots


def write_seo_page(path: str, title: str, description: str, h1: str, intro: str, context_heading: str, context: str, links, sections, faqs):
    target = ROOT / path / "index.md"
    target.parent.mkdir(parents=True, exist_ok=True)
    canonical = f"https://kacagider.com.tr/{path}/"
    breadcrumbs = [{"label": "Ana Sayfa", "url": "/"}, {"label": h1, "url": f"/{path}/"}]
    lines = [
        "---",
        'layout: "seo"',
        f"seo_title: {json.dumps(title, ensure_ascii=False)}",
        f"seo_description: {json.dumps(description, ensure_ascii=False)}",
        f"seo_h1: {json.dumps(h1, ensure_ascii=False)}",
        f"seo_intro: {json.dumps(intro, ensure_ascii=False)}",
        f"seo_context_heading: {json.dumps(context_heading, ensure_ascii=False)}",
        f"seo_context: {json.dumps(context, ensure_ascii=False)}",
        f"seo_breadcrumbs: {json.dumps(breadcrumbs, ensure_ascii=False, separators=(',', ':'))}",
        f"seo_links: {json.dumps(links, ensure_ascii=False, separators=(',', ':'))}",
        f"seo_links_heading: {json.dumps('İlgili KaçaGider kaynakları', ensure_ascii=False)}",
        f"seo_canonical: {json.dumps(canonical, ensure_ascii=False)}",
        f"seo_sections: {json.dumps(sections, ensure_ascii=False, separators=(',', ':'))}",
        f"seo_faqs: {json.dumps(faqs, ensure_ascii=False, separators=(',', ':'))}",
        'kg_seo_stage: "4-10-v1"',
        "---",
        "",
    ]
    target.write_text("\n".join(lines), encoding="utf-8")


def write_support_pages(snapshots):
    first = snapshots[0][:-5] if snapshots else TODAY
    latest = snapshots[-1][:-5] if snapshots else TODAY

    write_seo_page(
        "piyasa-verisi",
        "KaçaGider Piyasa Verisi ve Fiyat Geçmişi | KaçaGider",
        "KaçaGider ikinci el telefon fiyat kataloğunun tarihli snapshot yaklaşımını, güven skorlarını ve fiyat geçmişi metodunu inceleyin.",
        "KaçaGider Piyasa Verisi ve Fiyat Geçmişi",
        "KaçaGider, geçmişe dönük fiyat uydurmak yerine kullandığı telefon fiyat kataloğunu tarihli snapshot'larla saklar.",
        "Fiyat geçmişi nasıl oluşturuluyor?",
        f"Tarihçe {first} tarihinde başlayan gerçek katalog snapshot'larından oluşur. Her snapshot, o gün KaçaGider'de kullanılan tahmini değer, hızlı satış ve ilan referanslarını korur.",
        [
            {"label": f"En güncel fiyat snapshot'ı ({latest})", "url": f"/data/price-history/{latest}.json"},
            {"label": "Snapshot manifesti", "url": "/data/price-history/index.json"},
            {"label": "İkinci el fiyat nasıl hesaplanır?", "url": "/ikinci-el-fiyat-nasil-hesaplanir/"},
            {"label": "Veri metodolojisi", "url": "/veri-metodolojisi/"},
        ],
        [
            {"title": "Geçmişe dönük veri üretilmez", "text": "KaçaGider fiyat geçmişi, sistemin gerçekten çalıştığı tarihlerde alınan katalog snapshot'larıyla birikir. Önceki tarihler için sonradan fiyat serisi oluşturulmaz."},
            {"title": "Üç fiyat referansı birlikte tutulur", "text": "Desteklenen telefon kayıtlarında tahmini piyasa değeri, hızlı satış referansı ve ilan fiyatı referansı snapshot içinde saklanır."},
            {"title": "Güven ve gözlem bilgisi korunur", "text": "Katalog kaydında güven skoru ve gözlem sayısı bulunuyorsa snapshot bunları da saklar; böylece fiyatın veri dayanağı sonradan incelenebilir."},
        ],
        [
            {"question": "KaçaGider fiyat geçmişi gerçek mi?", "answer": "Tarihçe, KaçaGider'in ilgili tarihte kullandığı katalog verisinin snapshot'ıdır. Geçmişe dönük yapay kayıt eklenmez."},
            {"question": "Fiyat geçmişi kesin satış fiyatını gösterir mi?", "answer": "Hayır. Snapshot'lar piyasa referansını korur; gerçek satış fiyatı cihaz kondisyonu ve satış koşullarına göre değişebilir."},
        ],
    )

    write_seo_page(
        "model-karsilastirma",
        "İkinci El Telefon ve Cihaz Model Karşılaştırma Rehberi | KaçaGider",
        "İkinci el telefon ve cihaz modellerini kapasite, kondisyon ve güncel piyasa değeri üzerinden doğru biçimde karşılaştırın.",
        "İkinci El Model Karşılaştırma Rehberi",
        "Benzer iki cihazı karşılaştırırken yalnızca model adını değil, aynı kapasite ve kondisyon varsayımlarını kullanmak gerekir.",
        "İkinci el model karşılaştırması nasıl yapılır?",
        "İki modelin değerini ayrı ayrı aynı kondisyon varsayımlarıyla hesaplayın; ardından piyasa referanslarını, kapasite seçeneklerini ve satış hedefinizi birlikte değerlendirin.",
        [
            {"label": "Telefon modellerini karşılaştırmaya başla", "url": "/telefon/"},
            {"label": "Tablet değerleme", "url": "/tablet/"},
            {"label": "Bilgisayar değerleme", "url": "/bilgisayar/"},
            {"label": "KaçaGider piyasa verisi", "url": "/piyasa-verisi/"},
        ],
        [
            {"title": "Aynı kapasiteyi karşılaştırın", "text": "Mümkün olduğunda iki modelde benzer depolama kapasitesini seçmek fiyat farkını daha anlamlı yorumlamaya yardımcı olur."},
            {"title": "Kondisyonu eşitleyin", "text": "Ekran, kasa, pil ve değişen parça durumları farklıysa model farkı ile kondisyon farkı birbirine karışabilir."},
            {"title": "Satış hedefini dikkate alın", "text": "Hızlı satış referansı ile ilan fiyatı referansı aynı amaç için değildir; karşılaştırmayı satış hızınıza göre yapın."},
        ],
        [
            {"question": "İki telefonun ikinci el değerini nasıl karşılaştırabilirim?", "answer": "Her iki modelde kapasite ve kondisyonu mümkün olduğunca aynı varsayımlarla seçip KaçaGider sonuçlarını yan yana değerlendirin."},
            {"question": "Daha yüksek kapasiteli model her zaman daha değerli mi?", "answer": "Kapasite etkili olsa da model yaşı, kondisyon, talep ve diğer cihaz özellikleri toplam değeri değiştirebilir."},
        ],
    )

    write_seo_page(
        "veri-metodolojisi",
        "KaçaGider Değerleme ve Veri Metodolojisi | KaçaGider",
        "KaçaGider'in ikinci el cihaz değerleme yaklaşımını, fiyat referanslarını, güven skorlarını ve veri sınırlarını şeffaf biçimde inceleyin.",
        "KaçaGider Değerleme ve Veri Metodolojisi",
        "KaçaGider'in amacı kesin satış vaadi vermek değil, cihazın gerçek bilgileriyle daha tutarlı bir ikinci el piyasa referansı sunmaktır.",
        "KaçaGider hangi verileri dikkate alır?",
        "Değerleme; kategoriye göre marka, model, kapasite ve kondisyon girdilerini kullanır. Telefon fiyat kataloğunda tahmini değer, hızlı satış, ilan referansı, güven skoru ve varsa gözlem bilgisi birlikte tutulabilir.",
        [
            {"label": "Piyasa verisi ve fiyat geçmişi", "url": "/piyasa-verisi/"},
            {"label": "İkinci el fiyat nasıl hesaplanır?", "url": "/ikinci-el-fiyat-nasil-hesaplanir/"},
            {"label": "Ücretsiz ilan ver", "url": "/ucretsiz-ilan-ver/"},
        ],
        [
            {"title": "Tahmini piyasa değeri", "text": "Kullanıcının cihaz bilgilerine göre satış kararını destekleyen referans değerdir; kesin alım veya satış teklifi değildir."},
            {"title": "Hızlı satış ve ilan referansı", "text": "Farklı satış hızlarını düşünmeye yardımcı olan iki ayrı referanstır. Gerçekleşen işlem fiyatı; cihaz durumu, talep ve pazarlığa göre değişebilir."},
            {"title": "Şeffaflık ilkesi", "text": "KaçaGider geçmişe dönük fiyat serisi uydurmaz, sahte yorum veya puan üretmez ve veri bulunmayan kapasite için otomatik fiyat sayfası oluşturmamayı hedefler."},
        ],
        [
            {"question": "KaçaGider sonucu kesin fiyat mı?", "answer": "Hayır. Sonuç güncel bir ikinci el piyasa referansıdır; gerçek satış fiyatı değişebilir."},
            {"question": "KaçaGider geçmiş fiyatları sonradan oluşturuyor mu?", "answer": "Hayır. Fiyat geçmişi yalnızca gerçek tarihlerde alınan katalog snapshot'larıyla birikir."},
        ],
    )

    llms = f"""# KaçaGider

KaçaGider, Türkiye'de telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için ikinci el piyasa değeri hesaplama ve ücretsiz ilan akışı sunar.

Canonical site: https://kacagider.com.tr/
Primary language: tr-TR

## Core resources
- Device valuation: https://kacagider.com.tr/
- Free listing: https://kacagider.com.tr/ucretsiz-ilan-ver/
- Valuation methodology: https://kacagider.com.tr/veri-metodolojisi/
- Market data and price history: https://kacagider.com.tr/piyasa-verisi/
- Model comparison guide: https://kacagider.com.tr/model-karsilastirma/
- Sitemap: https://kacagider.com.tr/sitemap.xml

## Data principles
- Capacity pages are created only for catalog-supported capacities.
- Valuation results are market references, not guaranteed transaction prices.
- Price history begins with real dated snapshots; historical values are not backfilled.
- Fake ratings, reviews, offers or unsupported prices are not generated.

Latest captured phone catalog snapshot: {latest}
"""
    (ROOT / "llms.txt").write_text(llms, encoding="utf-8")


def patch_methodology_links():
    path = ROOT / "ikinci-el-fiyat-nasil-hesaplanir" / "index.md"
    doc = load_doc(path)
    if not doc:
        return
    links = get_list(doc, "seo_links")
    ensure_link(links, "KaçaGider piyasa verisi ve fiyat geçmişi", "/piyasa-verisi/", "market-data-v1")
    ensure_link(links, "Değerleme ve veri metodolojisi", "/veri-metodolojisi/", "authority-v1")
    set_value(doc, "seo_links", links)
    save_doc(path, doc)


def patch_sitemap():
    sitemap = ROOT / "sitemap.xml"
    text = sitemap.read_text(encoding="utf-8")
    additions = [
        ("https://kacagider.com.tr/piyasa-verisi/", "0.7"),
        ("https://kacagider.com.tr/model-karsilastirma/", "0.7"),
        ("https://kacagider.com.tr/veri-metodolojisi/", "0.6"),
    ]
    chunks = []
    for url, priority in additions:
        if f"<loc>{url}</loc>" not in text:
            chunks.append(f"  <url><loc>{url}</loc><lastmod>{TODAY}</lastmod><changefreq>weekly</changefreq><priority>{priority}</priority></url>")
    if chunks:
        text = text.replace("</urlset>", "\n".join(chunks) + "\n</urlset>")
        sitemap.write_text(text, encoding="utf-8")


def write_stage_report(stats, snapshots):
    report = ROOT / "reports" / "seo-stages-4-10.md"
    report.parent.mkdir(parents=True, exist_ok=True)
    body = f"""# SEO Aşamaları 4–10 Uygulama Raporu

Tarih: {TODAY}

- Aşama 4 Kapasite SEO: {stats['storage_pages']} gerçek kapasite sayfası denetlendi/güçlendirildi.
- Aşama 5 Satılık/İlan SEO: model ve kapasite sayfalarında ücretsiz ilan niyeti korundu veya eklendi.
- Aşama 6 Fiyat geçmişi: {len(snapshots)} tarihli snapshot mevcut; son snapshot {snapshots[-1][:-5] if snapshots else 'yok'}.
- Aşama 7 Search Console fırsat motoru: `scripts/search-console-opportunity-engine.py` tarafından ayrıca üretilir.
- Aşama 8 Model karşılaştırma: {stats['model_pages']} model sayfasına karşılaştırma rehberi/bağlantısı uygulandı.
- Aşama 9 Görsel/Video + AI Search: mevcut OG görselleri korunur; `llms.txt` ve makine-okunur veri kaynakları eklendi. Gerçek video kaynağı olmadığı için sahte VideoObject üretilmez.
- Aşama 10 Marka otoritesi: veri metodolojisi ve piyasa verisi kaynak sayfaları yayın altyapısına eklendi. Harici backlink kendiliğinden üretilemez; linklenebilir birincil kaynaklar hazırlandı.

## Güvenlik ilkeleri
- Desteklenmeyen kapasite URL'si üretilmedi.
- Geçmişe dönük fiyat uydurulmadı.
- Mevcut canonical model URL'leri değiştirilmedi.
- Değerleme, Analytics ve ücretsiz ilan akışına dokunulmadı.
"""
    report.write_text(body, encoding="utf-8")


def main():
    stats = {"model_pages": 0, "storage_pages": 0}
    for category in CATEGORIES:
        base = ROOT / category
        if not base.exists():
            continue
        for path in base.rglob("index.md"):
            rel = path.relative_to(ROOT).parts
            if len(rel) not in (4, 5):
                continue
            if rel[0] != category:
                continue
            doc = load_doc(path)
            if not doc:
                continue
            brand = rel[1]
            model_page = ROOT / category / brand / rel[2] / "index.md"
            model_name = model_display(model_page)
            if len(rel) == 5:
                stats["storage_pages"] += 1
                storage = display_storage(rel[3])
                add_capacity_and_listing(path, doc, model_name, storage)
            else:
                stats["model_pages"] += 1
                add_model_comparison_and_authority(path, doc, model_name, category, brand)

    snapshots = snapshot_prices()
    write_support_pages(snapshots)
    patch_methodology_links()
    patch_sitemap()
    write_stage_report(stats, snapshots)
    print(json.dumps({"date": TODAY, **stats, "snapshots": len(snapshots)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
