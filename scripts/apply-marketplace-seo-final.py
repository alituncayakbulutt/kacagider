from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

# KaçaGider'ın ürün konumlandırması:
# Değerini öğren -> doğru fiyatı belirle -> ücretsiz ilan ver -> doğru alıcıyla buluş.
FINAL_HOME_TITLE = "Cihazın Ne Kadar Eder? İkinci El Değeri & Ücretsiz İlan | KaçaGider"
FINAL_HOME_DESCRIPTION = (
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolunun güncel ikinci el piyasa değerini öğren. "
    "Doğru fiyatı belirle, ücretsiz ilan ver ve alıcını bul."
)

TEXT_ROOTS = [
    "telefon",
    "tablet",
    "bilgisayar",
    "akilli-saat",
    "oyun-konsolu",
    "telefonum-ne-kadar-eder",
    "telefonum-kac-para",
    "telefonum-kaca-gider",
    "bilgi-merkezi",
    "rehber",
]

# Sadece kullanıcıya görünen metinlerdeki eski estimator dilini dönüştürür.
# Teknik değişken adlarına ve fiyat motoruna dokunmaz.
REPLACEMENTS = [
    ("güncel tahmini ikinci el satış değerini", "güncel ikinci el piyasa değerini"),
    ("güncel tahmini ikinci el değerini", "güncel ikinci el piyasa değerini"),
    ("güncel tahmini satış değerini", "güncel ortalama satış değerini"),
    ("tahmini ikinci el satış değerini", "ikinci el piyasa değerini"),
    ("tahmini ikinci el değerini", "ikinci el piyasa değerini"),
    ("tahmini satış değerini", "ortalama satış değerini"),
    ("tahmini satış değeri", "ortalama satış değeri"),
    ("tahmini piyasa değerini", "güncel piyasa değerini"),
    ("tahmini piyasa değeri", "güncel piyasa değeri"),
    ("tahmini piyasa fiyatıdır", "güncel piyasa verilerine dayanan bir piyasa değeri göstergesidir"),
    ("tahmini değerini öğrenebilirsiniz", "güncel piyasa değerini öğrenebilirsiniz"),
    ("tahmini değeri öğrenmenizi", "güncel piyasa değerini öğrenmenizi"),
    ("güncel piyasa değerini tahmin etmenize yardımcı olan", "güncel piyasa değerini değerlendirmenize yardımcı olan"),
    ("fiyat tahminlerini", "piyasa değeri hesaplamalarını"),
    ("fiyat tahmini", "piyasa değeri"),
    ("tahmini fiyatını", "güncel piyasa değerini"),
    ("tahmini fiyat", "piyasa değeri"),
    ("Tahmini Satış Fiyatınız", "KaçaGider Piyasa Değeriniz"),
    ("KaçaGider tahmini değeri", "KaçaGider piyasa değeri"),
    ("KaçaGider tahmini", "KaçaGider piyasa değeri"),
]


def rewrite_language(text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    return text


def rewrite_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    updated = rewrite_language(original)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


changed = []

# 1) Ana sayfa: beş kategori + değer öğrenme + ücretsiz ilan + alıcı bulma.
index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")
index = rewrite_language(index)

# Hem eski hem ara strateji başlıklarını tek final başlıkta birleştir.
index = re.sub(r"<title>.*?</title>", f"<title>{FINAL_HOME_TITLE}</title>", index, count=1, flags=re.S)
index = re.sub(
    r'<meta name="description" content="[^"]*">',
    f'<meta name="description" content="{FINAL_HOME_DESCRIPTION}">',
    index,
    count=1,
)
index = re.sub(
    r'<meta property="og:title" content="[^"]*">',
    f'<meta property="og:title" content="{FINAL_HOME_TITLE}">',
    index,
    count=1,
)
index = re.sub(
    r'<meta property="og:description" content="[^"]*">',
    f'<meta property="og:description" content="{FINAL_HOME_DESCRIPTION}">',
    index,
    count=1,
)
index = re.sub(
    r'<meta name="twitter:title" content="[^"]*">',
    f'<meta name="twitter:title" content="{FINAL_HOME_TITLE}">',
    index,
    count=1,
)
index = re.sub(
    r'<meta name="twitter:description" content="[^"]*">',
    f'<meta name="twitter:description" content="{FINAL_HOME_DESCRIPTION}">',
    index,
    count=1,
)
index = index.replace(
    'content="KaçaGider ikinci el telefon değeri hesaplama"',
    'content="KaçaGider ikinci el cihaz piyasa değeri ve ücretsiz ilan"',
)
index = index.replace(
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel ikinci el piyasa değeri ve satış kararı platformu.",
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel ikinci el piyasa değeri öğrenme ve ücretsiz ilan platformu.",
)
index = index.replace(
    "Kullanıcının ürün, model, kapasite ve kondisyon bilgilerini güncel piyasa verileriyle değerlendirerek ikinci el piyasa değerini anlamasına yardımcı olan web uygulaması.",
    "Kullanıcının cihaz bilgilerini güncel piyasa verileriyle değerlendirerek ikinci el piyasa değerini öğrenmesine ve ücretsiz ilan oluşturmasına yardımcı olan web uygulaması.",
)
index = index.replace(
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolları için güncel piyasa verilerini değerlendir; cihazının ikinci el piyasa değerini öğren.",
    "Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolunun piyasa değerini öğren; doğru fiyatı belirle ve ücretsiz ilan ver.",
)

original = index_path.read_text(encoding="utf-8")
if index != original:
    index_path.write_text(index, encoding="utf-8")
    changed.append("index.html")

# 2) Global SEO layout ve mevcut SEO/rehber sayfalarında yeni fiyat dili.
layout_path = ROOT / "_layouts" / "seo.html"
if rewrite_file(layout_path):
    changed.append("_layouts/seo.html")

for root_name in TEXT_ROOTS:
    base = ROOT / root_name
    if not base.exists():
        continue
    for path in base.rglob("*"):
        if path.is_file() and path.suffix.lower() in {".md", ".html"}:
            if rewrite_file(path):
                changed.append(str(path.relative_to(ROOT)))

# 3) Kategori kökleri: arama niyeti + satış niyetini birlikte anlat.
ROOT_PAGE_COPY = {
    "telefon/index.md": (
        "Telefonum ne kadar eder, kaç para eder veya kaça satılır? Marka, model, hafıza ve kondisyonu seç; güncel ikinci el piyasa değerini öğren, doğru fiyatı belirle ve ücretsiz ilan ver.",
        "Telefonunun marka, model, hafıza ve kondisyon bilgilerini seçerek güncel ikinci el piyasa değerini öğren. Değerini gördükten sonra doğru satış fiyatını belirleyip KaçaGider'da ücretsiz ilan verebilirsin.",
    ),
    "tablet/index.md": (
        "Tabletim ne kadar eder veya tabletimi kaça satarım? iPad, Samsung, Xiaomi, Huawei, Lenovo ve Honor modellerinde güncel ikinci el piyasa değerini öğren, doğru fiyatı belirle ve ücretsiz ilan ver.",
        "Tabletinin marka, model, kapasite ve kondisyon bilgilerini seçerek güncel ikinci el piyasa değerini öğren. Doğru fiyatı belirledikten sonra KaçaGider'da ücretsiz ilan verip alıcını bul.",
    ),
    "bilgisayar/index.md": (
        "Bilgisayarım ne kadar eder veya laptopumu kaça satarım? MacBook ve desteklenen laptop modellerinde güncel ikinci el piyasa değerini öğren, doğru fiyatı belirle ve ücretsiz ilan ver.",
        "Bilgisayarının marka, model, kapasite ve kondisyon bilgilerini seçerek güncel ikinci el piyasa değerini öğren. Doğru fiyatı belirleyip KaçaGider'da ücretsiz ilan vererek alıcını bul.",
    ),
    "akilli-saat/index.md": (
        "Akıllı saatim ne kadar eder veya saatimi kaça satarım? Apple Watch, Galaxy Watch ve Huawei modellerinde güncel ikinci el piyasa değerini öğren, doğru fiyatı belirle ve ücretsiz ilan ver.",
        "Akıllı saatinin marka, model, kasa boyutu ve kondisyon bilgilerini seçerek güncel ikinci el piyasa değerini öğren. Doğru fiyatı belirleyip KaçaGider'da ücretsiz ilan ver.",
    ),
    "oyun-konsolu/index.md": (
        "PS5, PlayStation veya Xbox ne kadar eder? Konsolunun güncel ikinci el piyasa değerini öğren, doğru satış fiyatını belirle ve KaçaGider'da ücretsiz ilan vererek alıcını bul.",
        "Oyun konsolunun model, depolama ve kondisyon bilgilerini seçerek güncel ikinci el piyasa değerini öğren. Doğru fiyatı belirleyip ücretsiz ilan vererek alıcını bul.",
    ),
}

for rel, (description, intro) in ROOT_PAGE_COPY.items():
    path = ROOT / rel
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    updated = re.sub(r'^seo_description:.*$', f'seo_description: "{description}"', text, count=1, flags=re.M)
    updated = re.sub(r'^seo_intro:.*$', f'seo_intro: "{intro}"', updated, count=1, flags=re.M)
    if "ücretsiz ilan" not in re.search(r'^seo_context:.*$', updated, flags=re.M).group(0).lower() if re.search(r'^seo_context:.*$', updated, flags=re.M) else True:
        updated = re.sub(
            r'^(seo_context:\s*"[^"]*)"$',
            r'\1 Piyasa değerini öğrendikten sonra KaçaGider\'da ücretsiz ilan oluşturarak cihazınızı doğru satış fiyatıyla alıcılarla buluşturabilirsiniz."',
            updated,
            count=1,
            flags=re.M,
        )
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        changed.append(rel)

# 4) Gelecekte statik sayfalar yeniden üretildiğinde eski dil geri dönmesin.
generator_path = ROOT / "scripts" / "generate-seo-static-pages.mjs"
if generator_path.exists() and rewrite_file(generator_path):
    changed.append("scripts/generate-seo-static-pages.mjs")

print(f"Marketplace SEO final layer: {len(set(changed))} file(s) updated")
for rel in sorted(set(changed))[:40]:
    print(" -", rel)
if len(set(changed)) > 40:
    print(f" - ... and {len(set(changed)) - 40} more")
