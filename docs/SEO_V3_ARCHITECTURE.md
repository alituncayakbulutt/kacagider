# KaçaGider SEO V3 — Intent-Led Architecture

## Amaç

KaçaGider'ın SEO sistemi katalog sayfası üretmek için değil, kullanıcının ikinci el değer ve piyasa sorgusunu en doğru tek sayfayla karşılamak için tasarlanır.

Beş ürün kategorisinin tamamında aynı kural geçerlidir: Telefon, Tablet, Bilgisayar, Akıllı Saat ve Oyun Konsolu.

## Temel kurallar

1. **Bir arama niyeti kümesi = bir ana landing.** Aynı kelime varyasyonları için yeni URL açılmaz.
2. **Bir cihaz modeli = bir ana model URL'si.** Model sayfası; “ne kadar eder”, “kaça satılır”, “ikinci el fiyatı” ve “piyasa değeri” sorgularını birlikte ve doğal biçimde karşılar.
3. **Storage / kasa boyutu varsayılan olarak ayrı SEO URL'si değildir.** 128/256/512 GB, TB ve mm seçenekleri ana model sayfasında gösterilir. Ayrı URL ancak anlamlı GSC talebi ve gerçek özgün veri ile istisna olabilir.
4. **Kategori sayfası ile değerleme landing'i farklı niyetlere sahiptir.** Kategori sayfası piyasa/fiyat keşfi; “...im ne kadar eder” sayfası kişisel cihaz değerleme aracıdır.
5. **Seri sayfaları kanıtla yaşar.** Sırf katalog hiyerarşisi var diye seri URL'si üretilmez. Arama talebi, yeterli model ve özgün içerik yoksa sitemap'e eklenmez.
6. **Rehber tek bilgi silosu olmalıdır.** Aynı konuda `/rehber/` ve `/bilgi-merkezi/` altında iki sayfa yarışmamalıdır. Birleştirmeler konu bazlı 301 haritasıyla yapılır.
7. **Evergreen metadata.** Title/H1'e sabit yıl eklenmez; yıllık toplu metadata değişikliği yapılmaz.
8. **SEO otomasyonu yazıcı değil denetçi olmalıdır.** Otomatik iş akışları audit/rapor üretir; yüzlerce sayfayı topluca yeniden yazmaz.
9. **Sitemap kalite listesi olmalıdır.** Ana sitemap yalnızca Google'da bağımsız sonuç olmasını gerçekten istediğimiz canonical URL'leri içerir.
10. **`lastmod` yalnız gerçek içerik değişiminde değişir.** Tüm siteyi aynı gün güncellenmiş göstermek yasaktır.

## Intent sahipliği

| Ürün | Piyasa / keşif | Kişisel değerleme | Model |
| --- | --- | --- | --- |
| Telefon | `/telefon/` | `/telefonum-ne-kadar-eder/` | `/telefon/{marka}/{model}/` |
| Tablet | `/tablet/` | `/tabletim-ne-kadar-eder/` | `/tablet/{marka}/{model}/` |
| Bilgisayar | `/bilgisayar/` | `/bilgisayarim-ne-kadar-eder/` | `/bilgisayar/{marka}/{model}/` |
| Akıllı Saat | `/akilli-saat/` | `/akilli-saatim-ne-kadar-eder/` | `/akilli-saat/{marka}/{model}/` |
| Oyun Konsolu | `/oyun-konsolu/` | `/oyun-konsolum-ne-kadar-eder/` | `/oyun-konsolu/{marka}/{model}/` |

## Model sayfası sözleşmesi

Örnek: `/telefon/apple/iphone-13/`

- Title: `iPhone 13 Ne Kadar Eder? İkinci El Fiyatı | KaçaGider`
- H1: `iPhone 13 Ne Kadar Eder?`
- Aynı sayfada doğal biçimde karşılanacak alt niyetler:
  - iPhone 13 kaça satılır?
  - iPhone 13 ikinci el fiyatı
  - iPhone 13 piyasa değeri
- 128/256/512 GB seçenekleri aynı model sayfasında seçim/tablo/bölüm olarak bulunur.
- Modelin gerçekten sahip olduğu kapasite dışında storage üretilmez.
- Gerçek fiyat/veri varsa bunu sayfayı farklılaştırmak için kullanırız; sentetik kelime tekrarlarıyla sayfayı şişirmeyiz.
- FAQ en fazla 4 ve modele gerçekten faydalı soru olmalıdır.

## Yasaklanan eski davranışlar

- `Ne Kadar Eder? Güncel Kaça Satılır? 2026 İkinci El Fiyatı` gibi çoklu intent doldurulmuş title/H1.
- Her modelde aynı `listing-intent`, `comparison-intent`, `capacity-intent` bloklarını çoğaltmak.
- “Kaça satarım / kaça satabilirim / satsam ne kadar eder / fiyat sorgulama / değer sorgulama” ifadelerinin hepsini her sayfada zorunlu tutan audit.
- Her deploy'da yüzlerce/binlerce SEO sayfasının metadata'sını yeniden yazmak.
- Her storage veya mm seçeneğini otomatik canonical URL yapmak.
- Aynı sorgu için alternatif landing URL'leri açmak.
- Trafik kanıtı olmadan binlerce URL'yi sitemap'e eklemek.

## Migrasyon politikası

Mevcut URL'ler kör biçimde silinmez.

- **KEEP:** Ana kategori, marka, model ve kanıtlanmış güçlü URL.
- **REVIEW:** Geçmiş GSC trafiği olan storage/mm veya seri URL'si. Veriye bakılmadan yönlendirilmez.
- **301 TO MODEL:** Bağımsız değeri ve anlamlı talebi olmayan storage/mm varyantı.
- **OUT OF SITEMAP:** Kullanıcı için çalışması gereken fakat Google'a ana landing olarak sunulmaması gereken URL.
- **301 TOPIC MERGE:** Aynı rehber niyetindeki mükerrer içerikler tek kazanan URL'de birleştirilir.

## Değişiklik güvenliği

- Önce branch.
- Sonra `scripts/seo-v3-architecture-audit.py`.
- Sonra URL/GSC migrasyon tablosu.
- Sonra küçük kontrollü batch.
- GSC settled verisi gözlenmeden ikinci büyük batch yapılmaz.
- SEO'dan bağımsız değerleme, ilan, Analytics ve uygulama akışlarına dokunulmaz.

Bu belge ile `data/seo-v3-intents.json` SEO V3'ün kaynak sözleşmesidir.
