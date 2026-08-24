# KaçaGider — Codex Handoff

Bu dosya, ChatGPT ile `marketplace-test` branch'inde yapılan güncel çalışmaları Codex'in yerel çalışma alanında doğru bağlamla sürdürmesi için hazırlanmıştır.

## Çalışma alanı

- Repo: `alituncayakbulutt/kacagider`
- Aktif branch: `marketplace-test`
- Canlı `main` branch'ine DOKUNMA.
- Codespaces çalışma klasörü: `/workspaces/kacagider`
- Preview portu: `8000`
- Preview başlatma: `bash .devcontainer/start-preview.sh`
- Mevcut test URL'si Codespaces port 8000 önizlemesidir.

## İlk yapılacaklar

1. `git status` ile çalışma ağacını kontrol et.
2. Kullanıcı değişikliği varsa silme/ezme.
3. Çalışma ağacı temizse `git pull --ff-only origin marketplace-test` ile branch'i güncelle.
4. `.devcontainer/start-preview.sh` ile port 8000 preview'ı çalıştır.
5. Kullanıcı özellikle istemedikçe canlı browser otomasyonu yapma; kullanıcı preview'ı manuel test ediyor.

## Kaynak gerçekliği

Yerel çalışma alanındaki `marketplace-test` branch'i ve bu branch'in dosyaları kaynak gerçektir. Önceki sohbetlerden tahmin ederek UI'ı yeniden kurma. Mevcut dosyaları okuyup küçük ve hedefli değişiklik yap.

Özellikle kontrol edilecek dosyalar:

- `index.html`
- `assets/marketplace-details.js`
- `assets/marketplace-nav-test.js`
- `assets/marketplace-home-header.js`
- `assets/marketplace-home-slider.js`
- `assets/marketplace-test.js`
- `ilanlar/index.html`
- `ilan/index.html`
- `.devcontainer/start-preview.sh`
- `.devcontainer/devcontainer.json`

## Mevcut ana sayfa / marketplace tasarım kararı

Ana sayfa test görünümünde:

- Üstte lacivert header bulunur.
- Logo + arama alanı + `İlanlar` + `Ücretsiz İlan Ver` + tema düğmesi bulunur.
- Altında beyaz kategori navigasyonu bulunur.
- Ana bilgilendirme slider'ı tek görünür kart olarak çalışır.
- Kategori kartları: Telefon, Tablet, Bilgisayar, Akıllı Saat, Oyun Konsolu.
- Her kartta üstte `Ücretsiz İlan Ver`, altta `Hemen Değerini Öğren` bulunur.
- Kategori görselleri kart içinde aynı görsel alanına oturmalı, ortalanmalı, taşmamalı ve butonları kapatmamalı.

Son hedef görsel dili:

- Telefon: kırmızı / koyu kırmızı lansman telefonu.
- Tablet: tek mor ekranlı iPad görünümü; birden fazla tablet yan yana OLMAMALI.
- Bilgisayar: tek mor ekranlı MacBook görünümü.
- Akıllı Saat: tek Milanese kordonlu saat; iki saat yan yana OLMAMALI.
- Oyun Konsolu: PS5 + kontrolcü; ürün kutusu OLMAMALI.
- Görsel boyutları optik olarak birbirine yakın ve kartlarla orantılı olmalı.

Bu düzeni kullanıcı tekrar istemedikçe değiştirme veya yeni tasarım üretme.

## Kullanıcıya dönük fiyatlandırma dili

KaçaGider kendi kendine 'tahmin' üretmiyor; piyasa araştırması yaparak ortalama satış değerini çıkarıyor. Bu nedenle kullanıcıya dönük metinlerde aşağıdaki ifadeleri KULLANMA:

- tahmini fiyat
- fiyat tahmini
- anında tahmin
- KaçaGider tahmini

Tercih edilen dil:

- `Güncel piyasa değeri`
- `Ortalama satış değeri`
- `KaçaGider piyasa değeri`
- `Güncel piyasa değerini öğren`
- `Piyasa değeriyle karşılaştır`

Ana açıklama mantığı:

> Güncel piyasa verilerini değerlendirerek cihazının ortalama satış değerini hesaplıyoruz.

`Kesin fiyat` ifadesini de kullanma.

## Marketplace akışı

Hedef akış:

`Fiyatını Hesapla → Ücretsiz İlan Oluştur → Giriş Yap / Üye Ol → İlan bilgileri otomatik dolar → Fotoğraf ekle → Yayınla`

Test aşamasında ilan verileri ağırlıklı olarak localStorage ile tutuluyor. Ana anahtar:

`kg_marketplace_listings_v1`

İlan detay sayfası cihaz kondisyon detaylarını göstermelidir. Eski test ilanlarında bu alan boş olabilir; yeni ilanlar yeni formatta oluşturulmalıdır.

## Korunacak teknik sınırlar

- `main` branch'ine geçme veya push etme.
- Mevcut fiyatlandırma motorunu değiştirme.
- SEO metadata / H1 / canonical / sitemap / robots yapısını gereksiz yere değiştirme.
- Tam sayfa refactor yapma.
- Gereksiz yeni dosya / yeni paket / yeni framework ekleme.
- Mevcut ağır CSS yapısını topluca yeniden yazma; değişiklikleri scope et.
- Kullanıcı açıkça istemedikçe canlı browser testi / otomatik browser testi kullanma.

## Son branch durumu

Bu handoff oluşturulmadan hemen önce `marketplace-test` branch başı:

`8e88c90647a9bc7fb5253ada232cdf21f16d6813`

Son görsel düzen commit'i:

`8e88c90647a9bc7fb5253ada232cdf21f16d6813` — `Kategori görsellerini son hedef tasarıma göre eşitle`

Bu handoff dosyasının commit'i bundan sonra gelecektir; `git pull` yaptıktan sonra branch'in güncel HEAD'ini esas al.

## Codex çalışma talimatı

Kullanıcı 'burada yaptığımız değişiklikleri yerel dosyaya aktar' dediğinde:

1. Önce `git status` ve branch'i kontrol et.
2. `marketplace-test` dışındaysa branch değiştirmeden önce kullanıcı değişikliklerini koru.
3. Branch temizse güncel `marketplace-test` değişikliklerini pull et.
4. Mevcut dosyaları yeniden üretmek yerine branch'teki hali yerel dosyalara kaynak gerçek olarak kabul et.
5. Preview'ı port 8000'de başlat.
6. Sonra yalnızca kullanıcının yeni isteğini uygula.
7. Kullanıcı istemedikçe `main` branch'ine birleştirme veya canlıya alma yapma.
