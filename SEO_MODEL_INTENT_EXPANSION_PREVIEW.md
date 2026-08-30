# KaçaGider — Model Bazlı Arama Niyeti Genişletme Önizlemesi

Bu çalışma canlı `main` branch'ine alınmadan önce `seo-model-intent-expansion-preview` branch'inde hazırlanır ve test edilir.

## Amaç

Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolu model sayfalarının mevcut canonical yapısını bozmadan; kullanıcıların aynı ikinci el fiyat ihtiyacını farklı ifadelerle aradığı sorguların görünür içerikte doğal biçimde karşılanmasını sağlamak.

## Mevcut güçlü sorgular

Güncel model şablonunda aşağıdaki temel niyetler zaten bulunur ve tekrar eklenmez:

- `[MARKA] [MODEL] ne kadar eder`
- `[MARKA] [MODEL] kaça satılır`
- `[MARKA] [MODEL] piyasa değeri`
- `[MARKA] [MODEL] ikinci el fiyatı`

## Eksik olduğunda eklenebilen varyasyonlar

Her model sayfasının mevcut title, description, H1, giriş, içerik ve FAQ alanları normalize edilerek kontrol edilir. Yalnızca sayfada bulunmayan sorgular arasından en fazla 6 tanesi doğal bir "sık aranan fiyat soruları" bloğuna eklenir:

- `[MARKA] [MODEL] kaç para eder`
- `[MARKA] [MODEL] kaça satarım`
- `[MARKA] [MODEL] kaça satabilirim`
- `[MARKA] [MODEL] satsam ne kadar eder`
- `[MARKA] [MODEL] ikinci el fiyatları`
- `[MARKA] [MODEL] güncel ikinci el fiyatı`
- `[MARKA] [MODEL] ikinci el piyasa değeri`
- `[MARKA] [MODEL] piyasa fiyatı`
- `[MARKA] [MODEL] fiyat sorgulama`
- `[MARKA] [MODEL] değer sorgulama`

İlk 6 eksik ifade seçilir. Böylece sayfada anahtar kelime yığılması oluşturulmaz.

## Duplicate koruması

`scripts/expand-model-query-intents.py`:

1. Türkçe karakterleri ve noktalama işaretlerini normalize eder.
2. Sayfanın mevcut SEO metnini tarar.
3. Aynı niyet zaten varsa eklemez.
4. Daha önce eklenen `model-intent-v1` bloğunu önce kaldırır, sonra yeniden hesaplar.
5. Bu nedenle script idempotent'tir; tekrar çalıştırıldığında kopya blok üretmez.

## URL / canonical stratejisi

Bu çalışma yeni sorgu bazlı URL üretmez.

Örneğin aşağıdakiler ayrı sayfalara dönüştürülmez:

- `/iphone-13-ne-kadar-eder/`
- `/iphone-13-kaca-satilir/`
- `/iphone-13-piyasa-degeri/`

Bütün sorgular mevcut tek canonical model sayfasında karşılanır. Amaç cannibalization ve doorway page riskini azaltmaktır.

## Kapsam

Yalnızca gerçek model seviyesindeki sayfalar işlenir:

- `telefon/<marka>/<model>/index.md`
- `tablet/<marka>/<model>/index.md`
- `bilgisayar/<marka>/<model>/index.md`
- `akilli-saat/<marka>/<model>/index.md`
- `oyun-konsolu/<marka>/<model>/index.md`

Hafıza / kapasite alt sayfaları bu fazda ayrıca genişletilmez. Onların mevcut storage-specific SEO yapısı korunur.

## Audit

`scripts/seo-model-intent-audit.py` her model sayfasında:

- 4 temel niyetin bulunmasını,
- en az 5 genişletilmiş niyetin görünür metinde bulunmasını,
- duplicate intent cluster oluşmamasını,
- kategori başına model kapsamını

kontrol eder ve hata varsa workflow'u durdurur.

## Korunan alanlar

Bu fazda aşağıdakiler yeniden tasarlanmaz:

- canonical URL
- mevcut model URL yapısı
- fiyat hesaplama sistemi
- cihaz katalogları
- marka/model listeleri
- Analytics
- marketplace
- auth
- Supabase
- ana sayfa mobil tasarımı

## Yayın kuralı

Bu branch yalnızca önizleme/test içindir. Kullanıcı sonuç raporunu inceleyip açıkça onay vermeden `main` branch'ine merge edilmez ve canlıya alınmaz.
