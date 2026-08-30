# SEO 4 — Hafıza / Kapasite Arama Niyeti Önizleme Raporu

Bu çalışma yalnızca katalogda zaten bulunan gerçek hafıza/kapasite URL'lerini güçlendirir. Yeni veya katalog dışı kapasite sayfası üretmez.

- Güçlendirilen gerçek varyant sayfası: **1133**
- Varyantı bulunan model sayısı: **572**
- Yeni sorgu kümesi: **storage-intent-v1**
- Model başına/kapasite başına hedeflenen ek arama niyeti: en fazla **6**

## Kategori dağılımı

| Kategori | Gerçek varyant sayfası |
|---|---:|
| telefon | 718 |
| tablet | 262 |
| bilgisayar | 132 |
| akilli-saat | 0 |
| oyun-konsolu | 21 |

## Hedeflenen ek sorgular

- `[MARKA] [MODEL] [KAPASİTE] kaç para eder`
- `[MARKA] [MODEL] [KAPASİTE] kaça satarım`
- `[MARKA] [MODEL] [KAPASİTE] kaça satabilirim`
- `[MARKA] [MODEL] [KAPASİTE] satsam ne kadar eder`
- `[MARKA] [MODEL] [KAPASİTE] ikinci el fiyatları ne kadar`
- `[MARKA] [MODEL] [KAPASİTE] güncel ikinci el fiyatı ne kadar`

Mevcut `ne kadar eder`, `kaça satılır`, `piyasa değeri` ve `ikinci el fiyatı` ifadeleri tekrar eklenmez; generator görünür içeriği tarayıp yalnızca eksik niyetleri ekler.

## En yaygın kapasite etiketleri

- **256 GB:** 395 sayfa
- **128 GB:** 281 sayfa
- **512 GB:** 237 sayfa
- **1 TB:** 104 sayfa
- **64 GB:** 60 sayfa
- **2 TB:** 30 sayfa
- **32 GB:** 12 sayfa
- **4 TB:** 8 sayfa
- **500 GB:** 4 sayfa
- **825 GB:** 2 sayfa

## Güvenlik kuralları

- Yalnızca `category/brand/model/NNgb|NNtb/index.md` biçimindeki mevcut gerçek varyant sayfaları işlenir.
- Parent model sayfası olmayan varyant işlenmez.
- Canonical URL değiştirilmez.
- Title, H1, breadcrumb, mevcut temel SEO bölümleri ve fiyat/değerleme akışı korunur.
- Seri/marka merkezleri ile SEO 1 ve SEO 2 sorgu katmanları korunur.
- Canlı `main` dalına otomatik geçiş yapılmaz.

## Örnek sayfalar

- `telefon/apple/iphone-11/128gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-11/128gb/`
- `telefon/apple/iphone-11/256gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-11/256gb/`
- `telefon/apple/iphone-11/64gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-11/64gb/`
- `telefon/apple/iphone-11-pro/256gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-11-pro/256gb/`
- `telefon/apple/iphone-11-pro/512gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-11-pro/512gb/`
- `telefon/apple/iphone-11-pro/64gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-11-pro/64gb/`
- `telefon/apple/iphone-11-pro-max/256gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-11-pro-max/256gb/`
- `telefon/apple/iphone-11-pro-max/512gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-11-pro-max/512gb/`
- `telefon/apple/iphone-11-pro-max/64gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-11-pro-max/64gb/`
- `telefon/apple/iphone-12/128gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12/128gb/`
- `telefon/apple/iphone-12/256gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12/256gb/`
- `telefon/apple/iphone-12/64gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12/64gb/`
- `telefon/apple/iphone-12-mini/128gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12-mini/128gb/`
- `telefon/apple/iphone-12-mini/256gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12-mini/256gb/`
- `telefon/apple/iphone-12-mini/64gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12-mini/64gb/`
- `telefon/apple/iphone-12-pro/128gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12-pro/128gb/`
- `telefon/apple/iphone-12-pro/256gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12-pro/256gb/`
- `telefon/apple/iphone-12-pro/512gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12-pro/512gb/`
- `telefon/apple/iphone-12-pro-max/128gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12-pro-max/128gb/`
- `telefon/apple/iphone-12-pro-max/256gb/index.md` — `https://kacagider.com.tr/telefon/apple/iphone-12-pro-max/256gb/`
