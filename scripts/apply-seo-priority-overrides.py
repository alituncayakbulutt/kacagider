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

# AŞAMA 3: Search Console'da görünürlük/tıklama alan veya yüksek ticari arama
# potansiyeli taşıyan öncelikli sayfalar için kontrollü CTR iyileştirmeleri.
# URL, canonical, breadcrumb, bağlantılar ve sayfa yapısı değiştirilmez.
OVERRIDES = {
    # Öncelik 1 — mevcut Search Console görünürlüğü bulunan sayfalar.
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

    # Öncelik 2 — yüksek ticari arama niyetli değer sayfaları.
    'telefonum-ne-kadar-eder/index.md': {
        'seo_title': 'Telefonum Ne Kadar Eder? 2026 Güncel İkinci El Değeri | KaçaGider',
        'seo_description': 'Telefonum ne kadar eder, kaç para eder veya kaça satılır? Marka, model, hafıza ve cihaz durumunu seç; 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
        'seo_h1': 'Telefonum Ne Kadar Eder? 2026 Güncel İkinci El Değeri',
        'seo_intro': 'Telefonunuzun bugün yaklaşık ne kadar ettiğini öğrenmek için marka, model, hafıza ve cihaz durumunu seçin. KaçaGider ile 2026 güncel tahmini ikinci el satış değerini ücretsiz hesaplayabilirsiniz.',
        'seo_context_heading': 'Telefonum ne kadar eder ve kaça satılır?',
        'seo_context': 'Telefonun ikinci el değeri marka, model, hafıza, pil sağlığı, ekran ve kasa durumu ile değişen parça geçmişine göre değişir. Telefonum kaç para eder veya telefonumu kaça satarım diye merak ediyorsanız cihaz bilgilerini seçerek güncel tahmini satış değerini görebilirsiniz.',
    },
    'telefonum-kac-para/index.md': {
        'seo_title': 'Telefonum Kaç Para Eder? 2026 İkinci El Değeri | KaçaGider',
        'seo_description': 'Telefonum kaç para eder? Marka, model, hafıza ve cihaz durumunu seç; 2026 güncel tahmini ikinci el değerini ve yaklaşık satış fiyatını ücretsiz öğren.',
        'seo_h1': 'Telefonum Kaç Para Eder? 2026 İkinci El Değeri',
        'seo_intro': 'Telefonunuzun bugün yaklaşık kaç para ettiğini marka, model, hafıza ve cihaz durumuna göre hesaplayın. KaçaGider ile güncel tahmini ikinci el satış değerini ücretsiz öğrenebilirsiniz.',
        'seo_context_heading': 'Telefonum bugün kaç para eder?',
        'seo_context': 'İkinci el telefon değeri; model, hafıza, pil sağlığı, ekran ve kasa durumu ile onarım geçmişine göre değişebilir. Cihaz bilgilerini seçerek telefonunuzun yaklaşık kaç para ettiğini ve kaça satılabileceğini hızlıca görebilirsiniz.',
    },
    'telefonum-kaca-gider/index.md': {
        'seo_title': 'Telefonum Kaça Gider? 2026 İkinci El Satış Değeri | KaçaGider',
        'seo_description': 'Telefonum kaça gider, telefonumu kaça satarım? Marka, model, hafıza ve cihaz durumunu seç; 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
        'seo_h1': 'Telefonum Kaça Gider? 2026 İkinci El Satış Değeri',
        'seo_intro': 'Telefonunuzu satmadan önce yaklaşık kaça gideceğini öğrenin. Model, hafıza ve cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz hesaplayabilirsiniz.',
        'seo_context_heading': 'Telefonumu kaça satabilirim?',
        'seo_context': 'Telefonun ikinci el satış değeri; model, hafıza, pil sağlığı, ekran ve kasa durumu ile değişen parça geçmişine göre değişebilir. Telefonumu kaça satarım veya telefonum kaça gider diye merak ediyorsanız cihaz bilgilerini seçerek yaklaşık satış değerini görebilirsiniz.',
    },

    # Öncelik 3 — geniş marka sorgularını yakalayan marka merkezleri.
    'telefon/apple/index.md': {
        'seo_title': 'iPhone Ne Kadar Eder? 2026 İkinci El Fiyatları | KaçaGider',
        'seo_description': 'iPhone ne kadar eder, kaça satılır? Model, hafıza, pil sağlığı ve cihaz durumuna göre 2026 güncel ikinci el iPhone değerini KaçaGider ile ücretsiz hesapla.',
        'seo_h1': 'iPhone Ne Kadar Eder? 2026 İkinci El Fiyatları',
        'seo_intro': 'iPhone ne kadar eder veya kaça satılır diye merak ediyorsanız modelinizi seçin. Hafıza, pil sağlığı ve cihaz durumuna göre 2026 güncel tahmini ikinci el değerini ücretsiz hesaplayabilirsiniz.',
    },
    'telefon/samsung/index.md': {
        'seo_title': 'Samsung Telefon Ne Kadar Eder? 2026 İkinci El Fiyatları | KaçaGider',
        'seo_description': 'Samsung telefon ne kadar eder, kaça satılır? Galaxy modelini ve cihaz durumunu seç; 2026 güncel tahmini ikinci el satış değerini KaçaGider ile ücretsiz hesapla.',
        'seo_h1': 'Samsung Telefon Ne Kadar Eder? 2026 İkinci El Fiyatları',
        'seo_intro': 'Samsung telefonunuz ne kadar eder veya kaça satılır? Galaxy modelinizi seçerek cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesaplayabilirsiniz.',
    },
    'telefon/xiaomi/index.md': {
        'seo_title': 'Xiaomi, Redmi, POCO Ne Kadar Eder? 2026 Fiyatları | KaçaGider',
        'seo_description': 'Xiaomi, Redmi veya POCO telefon ne kadar eder, kaça satılır? Model ve cihaz durumunu seç; 2026 güncel tahmini ikinci el satış değerini ücretsiz hesapla.',
        'seo_h1': 'Xiaomi, Redmi ve POCO Ne Kadar Eder? 2026 İkinci El Fiyatları',
        'seo_intro': 'Xiaomi, Redmi veya POCO telefonunuz ne kadar eder ve kaça satılır? Modelinizi seçerek cihaz durumuna göre 2026 güncel tahmini ikinci el satış değerini ücretsiz hesaplayabilirsiniz.',
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
