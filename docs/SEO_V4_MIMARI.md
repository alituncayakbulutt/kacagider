# KaçaGider SEO V4

## Amaç

SEO V4, çok sayıda benzer sorgu sayfası üretmek yerine kullanıcıya doğrudan değer sağlayan daha küçük ve güvenilir bir indeks oluşturur. Fiyat hesaplama, ilan sistemi, Analytics ve mevcut ürün verileri korunur.

## Canonical mimari

- Her kategori için bir piyasa sayfası: `/telefon/`, `/tablet/`, `/bilgisayar/`, `/akilli-saat/`, `/oyun-konsolu/`.
- Her kategori için bir değerleme niyeti sayfası: `/telefonum-ne-kadar-eder/` ve eşdeğerleri.
- Her marka için yalnızca gerçek model listesi ve kullanıcıya faydalı açıklama içeren bir marka sayfası.
- Her gerçek model için tek ana URL: `/telefon/apple/iphone-13/`.
- Hafıza ve ölçü varyantları bağımsız arama sonucu olarak kullanılmaz; ana model sayfasında bölüm/seçenek olarak sunulur.
- Bilgi Merkezi yalnızca özgün, uygulanabilir yardım içeriği olan sayfaları indeksler.

## Geçiş güvenliği

Eski URL’ler bir anda silinmez. Varyant URL’leri sitemap ve iç linklerden çıkarılır, `noindex,follow` yapılır ve en yakın ana modele canonical verir. Search Console sinyalleri dengelendikten sonra uygun URL’ler kalıcı yönlendirmeye çevrilebilir.

## Sayfa kalite standardı

Her indekslenebilir sayfa; özgün başlık ve açıklama, tek H1, açık kaynak/metodoloji bağlantısı, görünür içerikle uyumlu schema, gerçek model/kapasite verisi, yararlı iç bağlantılar ve hızlı mobil şablon taşır. Aynı değerleme uygulamasının binlerce sayfada tekrarına izin verilmez.

## Başarı ölçümü

- İndekslenebilir URL sayısı ve sitemap kapsamı aynı olmalı.
- `Tarandı - dizine eklenmedi` ve `Keşfedildi - dizine eklenmedi` kümeleri küçülmeli.
- Kategori ve ana model URL’lerinin görünür sorgu sayısı artmalı.
- Gösterim artışı tek başına değil; tıklama, ortalama konum ve değerleme tamamlama oranıyla birlikte izlenmeli.
