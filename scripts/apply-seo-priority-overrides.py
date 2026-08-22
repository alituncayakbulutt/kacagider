from pathlib import Path
import re

FIELD_RE = {
    'seo_title': re.compile(r'^(seo_title:\s*)"([^"]*)"\s*$', re.M),
    'seo_description': re.compile(r'^(seo_description:\s*)"([^"]*)"\s*$', re.M),
    'seo_h1': re.compile(r'^(seo_h1:\s*)"([^"]*)"\s*$', re.M),
    'seo_intro': re.compile(r'^(seo_intro:\s*)"([^"]*)"\s*$', re.M),
    'seo_context_heading': re.compile(r'^(seo_context_heading:\s*)"([^"]*)"\s*$', re.M),
    'seo_context': re.compile(r'^(seo_context:\s*)"([^"]*)"\s*$', re.M),
}

# AŞAMA 3: Search Console'da görünürlük/tıklama alan öncelikli sayfalar için
# kontrollü CTR ve arama niyeti iyileştirmeleri. URL, canonical, breadcrumb,
# bağlantılar ve sayfa yapısı değiştirilmez.
OVERRIDES = {
    'telefon/index.md': {
        'seo_title': 'Telefonum Ne Kadar Eder? 2026 İkinci El Fiyatları | KaçaGider',
        'seo_description': 'Telefonum ne kadar eder, kaç para eder veya kaça satılır? Marka, model, hafıza ve cihaz durumunu seç; 2026 güncel tahmini ikinci el değerini ücretsiz öğren.',
        'seo_h1': 'Telefonum Ne Kadar Eder? 2026 İkinci El Telefon Fiyatları',
        'seo_intro': 'Telefonum ne kadar eder diye merak ediyorsanız marka, model, hafıza ve cihaz durumunu seçerek 2026 için güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz öğrenebilirsiniz.',
        'seo_context_heading': 'Telefonun ikinci el değeri neye göre hesaplanır?',
        'seo_context': 'Telefonun ikinci el değeri; marka, model, hafıza, ekran ve kasa durumu, batarya, değişen parçalar ve cihazın genel kondisyonuna göre değişir. Telefonum kaç para eder, telefonumu kaça satarım veya telefonum kaça gider gibi sorular için cihaz bilgilerini seçerek güncel tahmini satış değerini hesaplayabilirsiniz.',
    },
    'telefon/xiaomi/poco-x8-pro-max/512gb/index.md': {
        'seo_description': 'POCO X8 Pro Max 512 GB ne kadar eder, kaça satılır? Ekran, batarya ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
        'seo_intro': 'POCO X8 Pro Max 512 GB ne kadar eder ve kaça satılır? 2026 ikinci el değeri ekran, batarya ve genel cihaz durumuna göre değişir. KaçaGider ile tahmini satış değerini ücretsiz hesaplayabilirsiniz.',
    },
    'telefon/samsung/galaxy-a25/index.md': {
        'seo_description': 'Galaxy A25 ne kadar eder, kaça satılır? Hafıza, ekran, batarya ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz hesapla.',
        'seo_intro': 'Galaxy A25 ne kadar eder ve kaça satılır? 2026 ikinci el değeri hafıza, ekran, batarya ve genel cihaz durumuna göre değişir. KaçaGider ile tahmini satış değerini ücretsiz hesaplayabilirsiniz.',
    },
    'telefon/samsung/galaxy-s25/index.md': {
        'seo_description': 'Galaxy S25 ne kadar eder, kaça satılır? Hafıza, ekran, batarya ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz hesapla.',
        'seo_intro': 'Galaxy S25 ne kadar eder ve kaça satılır? 2026 ikinci el değeri hafıza, ekran, batarya ve genel cihaz durumuna göre değişir. KaçaGider ile tahmini satış değerini ücretsiz hesaplayabilirsiniz.',
    },
}


def apply_fields(path: Path, fields: dict) -> bool:
    text = path.read_text(encoding='utf-8')
    updated = text
    for field, value in fields.items():
        pattern = FIELD_RE[field]
        if not pattern.search(updated):
            raise SystemExit(f'Missing {field} in {path}; file left unchanged.')
        updated = pattern.sub(lambda m, v=value: f'{m.group(1)}"{v}"', updated, count=1)
    if updated != text:
        path.write_text(updated, encoding='utf-8')
        return True
    return False


changed = 0
for file_name, fields in OVERRIDES.items():
    path = Path(file_name)
    if not path.exists():
        raise SystemExit(f'Priority page not found: {file_name}')
    if apply_fields(path, fields):
        changed += 1

print(f'AŞAMA 3 priority CTR overrides: {changed} page(s) changed.')
