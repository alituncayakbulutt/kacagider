# KaçaGider SEO V12 — Search Console Ölçüm Standardı

## Amaç
AŞAMA 0–11 ile kurulan SEO mimarisinin etkisini gerçek Google verisiyle ölçmek. Gösterim tek başına başarı veya başarısızlık kabul edilmez.

## Karşılaştırma pencereleri
- Son 7 gün ↔ önceki 7 gün: erken hareketler.
- Son 28 gün ↔ önceki 28 gün: yapısal SEO kararları.
Tek günlük veya tek haftalık dalgalanmayla URL/canonical mimarisi değiştirilmez.

## Ana metrikler
Her raporda tıklama, gösterim, CTR ve ortalama konum birlikte değerlendirilir. Mümkün olduğunda sorgu + sayfa birlikte incelenir.

## Sayfa grupları
- Değerleme: /telefonum-ne-kadar-eder/ ve diğer kategori değerleme landingleri.
- Telefon piyasası: /ikinci-el-telefon/.
- Marka: /[kategori]/[marka]/.
- Model: /[kategori]/[marka]/[model]/.
- Ücretsiz ilan: /ucretsiz-ilan-ver/.
- Bilgi Merkezi: /bilgi-merkezi/ altındaki bilgi niyetleri.

## Haftalık kontrol
Search Console > Performans > Arama sonuçları bölümünde:
- En çok gösterim ve tıklama alan sorgular.
- Gösterimi artan fakat CTR'si düşen sorgular.
- Ortalama konumu belirgin düşen sorgular.
- Yeni görünmeye başlayan sorgular.
- En çok gösterim/tıklama alan sayfalar.
- Aynı sorguda birden fazla KaçaGider URL'sinin görünmesi.

Aynı niyet için birden fazla URL görünüyorsa yeni sayfa açmak yerine önce canonical/page ownership çakışması araştırılır.

## Fırsat sınıfları
**Yüksek gösterim + düşük CTR:** Önce title/meta ve sorgu-sayfa uyumu incelenir. Sıralama zayıfsa CTR tek başına yorumlanmaz.

**Konum 4–15 + anlamlı gösterim:** İçerik derinliği, iç linkler ve sorgunun mevcut sayfa sahibine uyumu incelenir.

**Gösterim artıyor + konum iyileşiyor:** Mimari korunur; gereksiz başlık/URL değişikliği yapılmaz.

**Gösterim düşüyor + konum düşüyor:** Önce index/canonical, sorgu sahipliği, içerik ve teknik değişiklik tarihi kontrol edilir.

**Gösterim düşüyor + konum aynı:** Arama talebi/sezonsallık ayrıştırılmadan sayfa yeniden yazılmaz.

## Indexleme kontrolü
Search Console sitemap ve Sayfa Dizine Ekleme raporlarında gönderilen canonical URL'ler, dizine eklenen URL'ler, Tarandı — şu anda dizine eklenmedi, Keşfedildi — şu anda dizine eklenmedi, yönlendirmeli sayfa ve Google'ın farklı canonical seçtiği durumlar takip edilir.

Repo hedefi:
- sitemap.xml: ticari/katalog/core canonical URL'ler.
- sitemap-bilgi.xml: yalnız Bilgi Merkezi canonical URL'leri.
- Storage/TB/mm varyantları ve redirect kaynakları sitemap dışında.

## Başlangıç referansı
Yeni mimarinin başlangıç referansı: **1 Ekim 2026**. Sonraki performans mümkün olduğunda değişiklik öncesindeki eşit uzunluktaki dönemle karşılaştırılır. İlk günlerdeki hareketler nihai sonuç kabul edilmez.

## Karar kuralı
Yeni SEO URL'si ancak Search Console verisi ayrı bir arama niyeti gösteriyorsa değerlendirilir. Aynı niyetin kelime varyasyonları mevcut canonical sahibin içinde güçlendirilir.

## Rapor formatı
| Grup | Tıklama | Gösterim | CTR | Ort. Konum | Önceki dönem farkı | Aksiyon |
|---|---:|---:|---:|---:|---|---|
| Değerleme | — | — | — | — | — | — |
| Telefon piyasası | — | — | — | — | — | — |
| Marka | — | — | — | — | — | — |
| Model | — | — | — | — | — | — |
| Ücretsiz ilan | — | — | — | — | — | — |
| Bilgi Merkezi | — | — | — | — | — | — |

Rakamlar yalnız gerçek Search Console verisinden doldurulur; tahmin üretilmez.
