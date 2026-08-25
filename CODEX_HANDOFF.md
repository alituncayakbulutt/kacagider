# KaçaGider — Ücretsiz İlan / Marketplace Tam Codex Handoff

Bu dosya ChatGPT ile geliştirilen **KaçaGider Ücretsiz İlan / Marketplace MVP** çalışmasının tamamını Codex'e aktarmak için hazırlanmıştır. Codex bu dosyayı okumadan marketplace üzerinde yeni değişiklik yapmamalıdır.

## 1. Kaynak gerçek ve çalışma disiplini

- Repo: `alituncayakbulutt/kacagider`
- Marketplace geliştirme branch'i: `marketplace-test`
- Canlı branch: `main`
- **Kullanıcı açıkça canlıya al demedikçe `main` branch'ine dokunma, merge/push yapma.**
- Çalışma klasörü Codespaces'te genellikle `/workspaces/kacagider`.
- Preview portu: `8000`
- Preview başlatma: `bash .devcontainer/start-preview.sh`
- Kullanıcı görsel/manual testi kendisi yapıyor. Gereksiz browser otomasyonu veya canlı browser testi yapma.

Codex ilk olarak:

1. `git status` çalıştır.
2. Aktif branch'i kontrol et.
3. Kullanıcının yerel/değiştirilmemiş dosyalarını silme veya resetleme.
4. Yerelde değişiklik yoksa `git pull --ff-only origin marketplace-test` ile güncelle.
5. Yerelde bu handoff'tan daha yeni değişiklik varsa **yerel dosyaları daha yeni kaynak gerçek kabul et**, geri alma.
6. Preview gerekirse port 8000'de başlat.

## 2. Projenin amacı ve ürün konumlandırması

KaçaGider sadece fiyat sorgulama sitesi değil; hedef akış:

**`Değerini öğren → Doğru fiyata sat`**

Marketplace ana akışı:

`Piyasa Değerini Hesapla → Ücretsiz İlan Oluştur → Giriş Yap / Üye Ol → Cihaz bilgileri otomatik dolar → Renk seç → Fotoğraf ekle → Satış fiyatını yaz → Yayınla`

KaçaGider'in piyasa değeri, satıcının ilan fiyatı veya alıcı tekliflerinden bağımsız kalmalıdır. İlan fiyatı KaçaGider değerini değiştirmemelidir.

## 3. Kullanıcıya dönük fiyatlandırma dili

KaçaGider kendi kendine rastgele "tahmin" üretmiyor; piyasa araştırması ve güncel satış verileri üzerinden ortalama satış değerini çıkarıyor.

Kullanıcıya dönük yeni metinlerde şu ifadeleri kullanma:

- `tahmini fiyat`
- `fiyat tahmini`
- `anında tahmin`
- `KaçaGider tahmini`
- `kesin fiyat`

Tercih edilen dil:

- `Güncel piyasa değeri`
- `Ortalama satış değeri`
- `KaçaGider piyasa değeri`
- `Güncel piyasa değerini öğren`
- `Piyasa değeriyle karşılaştır`
- `Güncel piyasa verilerini değerlendirerek cihazının ortalama satış değerini hesaplıyoruz.`

Not: Bazı eski test sayfalarında hâlâ `tahmin` kelimesi bulunabilir. Kullanıcı yeni metin değişikliği isterse bu yeni dil esas alınmalı; mevcut fonksiyonu sırf metin için bozma.

## 4. Ana sayfa marketplace görünümü

Marketplace test ana sayfasında tamamlanan tasarım mantığı:

### Üst header

- Lacivert üst alan.
- KaçaGider logo.
- Ortada arama alanı: marka/model/ilan arama.
- Sağda `İlanlar`, `Ücretsiz İlan Ver`, tema düğmesi.
- Altında ayrı beyaz kategori navigasyonu.
- Desktop'ta iki katmanlı header kompakt olmalı; gereksiz dikey boşluk oluşturma.
- Mobilde mevcut mobil menü davranışını bozma.

Header'ın gerçek sahibi şu anda:

- `assets/marketplace-nav-test.js`

Aşağıdaki dosyalar legacy injector olarak bilerek devre dışıdır ve tekrar ikinci header/slider üretmemelidir:

- `assets/marketplace-home-header.js`
- `assets/marketplace-home-slider.js`

Bu iki dosyayı tekrar aktif ederek çift arama çubuğu veya çift slider oluşturma.

### Ana slider

Tek carousel/slider görünür olmalıdır; aynı anda iki ayrı kayan alan görünmemelidir.

Slider mesajları şu ürün mantığında oluşturuldu:

1. Güncel piyasa değeri / ortalama satış değeri.
2. `Değerini öğren. Doğru fiyata sat.` / ücretsiz ilan.
3. İlan fiyatını KaçaGider piyasa değeriyle karşılaştırma.

Slider yönetimi de `assets/marketplace-nav-test.js` içindedir.

Ana sayfadaki eski büyük statik hero yazısı marketplace giriş görünümünde slider ile çakışmamalı. Kategori seçildiğinde mevcut değerleme ekranı normal çalışmaya devam etmelidir.

## 5. Kategori kartları

Kategoriler:

- Telefon
- Tablet
- Bilgisayar
- Akıllı Saat
- Oyun Konsolu

Her kartta:

- üstte `Ücretsiz İlan Ver`
- altta `Hemen Değerini Öğren`
- ortada ürün görseli

Görsel alanı bütün kartlarda aynı optik seviyede olmalı. Ürün:

- kartı yeterince doldurmalı,
- taşmamalı,
- kırpılarak altı kesilmemeli,
- yanlarda gereksiz büyük boşluk bırakmamalı,
- üstteki `Ücretsiz İlan Ver` butonuna girmemeli.

Kullanıcının son hedef görsel dili:

- Telefon: tek kırmızı / koyu kırmızı lansman telefonu.
- Tablet: **tek** mor ekranlı iPad; birden fazla tablet yan yana olmasın.
- Bilgisayar: **tek** mor ekranlı MacBook.
- Akıllı Saat: **tek** Milanese kordonlu saat; iki saat yan yana olmasın.
- Oyun Konsolu: PS5 + kontrolcü; **ürün kutusu olmasın**.

Kategori görsellerinin mevcut uygulaması ve boyut kuralları:

- `assets/marketplace-details.js`
- `LATEST_CATEGORY_IMAGES`
- `CATEGORY_FALLBACK_IMAGES`
- `CATEGORY_SIZE`

Kullanıcı tekrar istemedikçe bu görsel konsepti yeniden tasarlama veya farklı ürün ailesine geçme. Uzak URL'li görseller kırılırsa önce mevcut fallback yapısını düzelt; rastgele yeni görsel seçme.

## 6. Ücretsiz İlan Ver akışı

Ana marketplace scripti:

- `assets/marketplace-test.js`

Tamamlanan prototype davranışları:

### Ana CTA

- Ana marketplace banner/slider ve kategori kartlarından `Ücretsiz İlan Ver` akışı açılabilir.
- Sonuç kartında gerçek piyasa değeri hesaplandıktan sonra `Ücretsiz İlan Oluştur` CTA'sı görünür.

### Kategori seçimi

Kullanıcı önce kategori seçer ve mevcut KaçaGider değerleme formuna gider. Değerleme motoru marketplace için yeniden yazılmadı; mevcut motor korunur.

### Üyelik prototype

İlan yayınlama sırasında test amaçlı üyelik ekranı bulunur:

- Üye Ol
- Giriş Yap
- İlk kayıt mantığı: Ad Soyad + E-posta + Şifre

Şu an gerçek hesap oluşturmaz. Gerçek sistem ileride bağlanacak.

Ürün kararı:

- Üye olmayan kişi piyasa değeri sorgulayabilir ve ilanları görüntüleyebilir.
- İlan yayınlama/düzenleme/silme için üyelik gerekir.
- Favoriler/mesajlaşma profesyonel hesaplar sonraki aşamadır.
- Telefon numarası gerekirse ilan yayınlama aşamasında istenebilir; ilk kayıt formunda zorunlu değil.

## 7. İlan oluşturma formu

Değerleme tamamlandıktan sonra ilan formuna otomatik aktarılması gereken bilgiler:

- kategori
- marka
- model
- hafıza
- KaçaGider piyasa değeri
- kondisyon / seçilen cihaz detayları

Kullanıcı ayrıca girer/seçer:

- renk
- şehir
- ilçe
- ilan satış fiyatı
- açıklama
- fotoğraflar

Renk seçenekleri prototype içinde tanımlıdır. Renk ilan kartında ve detay sayfasında görünmelidir.

## 8. Kondisyon detaylarının ilana aktarılması

Bu konu özellikle düzeltildi. Yeni ilan oluşturulurken değerleme ekranındaki seçili cihaz durumları ilana kaydedilmelidir.

Yakalanan telefon detayları arasında:

- Pil Sağlığı
- Ekran Durumu
- Face ID
- Cihaz Kaydı
- Değişen Parça / İşlem Geçmişi
- Çizik Sayısı
- Çizik Derinliği
- Piksel Atması
- Kasa Ezik / Darbe
- Kasa Yüzeyi
- Köşeler
- Arka Cam Durumu

İlgili DOM grupları/alanları:

- `#battery`
- `#screen`
- `#faceid`
- `[data-group="deviceRegistration"]`
- `[data-group="scratchCount"]`
- `[data-group="scratchDepth"]`
- `[data-group="protector"]`
- `[data-group="dent"]`
- `[data-group="surface"]`
- `[data-group="corners"]`
- `[data-group="backGlass"]`
- `#partsSelector .parts-row`
- `.part-select`
- `.part-quality`

Ana yakalama kodu `assets/marketplace-test.js` ve ek güvence `assets/marketplace-details.js` içindedir.

Eski localStorage ilanlarında `details` olmayabilir. Bu normaldir. Eski kaydı geriye dönük uydurma; doğrulama için yeni test ilanı oluştur.

## 9. Fotoğraf yükleme

İlan formuna fotoğraf yükleme prototype'ı eklendi.

- En fazla 5 görsel hedefi.
- Fotoğraflar önizlenir ve kaldırılabilir.
- Prototype'ta görseller küçültülüp JPEG/base64 olarak saklanabilir.
- Görsel yükleme tarayıcı/localStorage limitlerine tabidir.

Gerçek yayın mimarisinde büyük görseller localStorage'da tutulmamalı. Sonraki gerçek çözüm:

- Supabase Storage veya eşdeğer object storage
- ilan metadata'sı veritabanında
- görseller URL/reference ile ilişkili

Kullanıcı fotoğraf yüklediyse ilan kartı ve detay sayfasında gerçek kullanıcı fotoğrafı önceliklidir. Fotoğraf yoksa model/renk bazlı otomatik ürün görseli kullanılabilir.

## 10. Model + renk bazlı otomatik görsel

İlanlarda placeholder telefon emojisi yerine seçilen modele ait gerçek ürün görselinin görünmesi için model görsel eşleme sistemi eklendi.

Dosya:

- `data/model-images.js`

Kullanım:

- `window.getKgModelImage(brand, model, color)`

Hedef davranış:

- hangi model seçildiyse o modelin gerçek görseli,
- mümkünse seçilen renkle eşleşen tek ürün görseli,
- ön/arka tek kompozisyon tercih edilir,
- bütün renklerin aynı görselde gösterildiği ürün kolajı kullanılmaz,
- ilan kartında görsel çok küçük kalmamalı,
- `object-fit: contain` ve uygun padding/ölçek ile cihaz tamamen görünmelidir.

Kullanıcının yüklediği fotoğraf varsa otomatik model görselinden daha önceliklidir.

## 11. İlanlar sayfası `/ilanlar/`

Dosya:

- `ilanlar/index.html`

Tamamlanan özellikler:

- `İlanlar` başlığı ve aktif ilan sayısı.
- Arama: marka, model, şehir, renk vb.
- Kategori filtreleri: Tümü / Telefon / Tablet / Bilgisayar / Akıllı Saat / Oyun Konsolu.
- Sıralama: en yeni, düşük-yüksek fiyat, yüksek-düşük, KaçaGider değerine en yakın.
- Favori kalp butonu prototype.
- İlan kartında kategori / hafıza / renk, model, konum, ilan fiyatı, KaçaGider piyasa değeri, piyasa karşılaştırma etiketi.
- `İlanı Gör` ile ilan detayına geçiş.
- Kullanıcı fotoğrafı varsa göster; yoksa model görseli; o da yoksa kategori placeholder.

İlan kartı görsel dili için kullanıcı **light, soft, premium** görünüm istedi. Kartın ana arka planı beyaz/açık olmalı; ağır siyah kart tasarımına geri dönme.

İlan kartı medya alanı biraz daha koyu/açık gri tonla gövdeden ayrılabilir; fakat ürün görselini boğacak kadar koyu olmamalı.

Piyasa karşılaştırma mantığı korunmalı. Ancak yeni kullanıcı metinlerinde `KaçaGider tahmini` yerine `KaçaGider piyasa değeri` dili tercih edilir.

## 12. İlan detay sayfası `/ilan/?i=<index>`

Dosya:

- `ilan/index.html`

Tamamlanan özellikler:

- Büyük ana görsel / galeri.
- Birden fazla kullanıcı fotoğrafı varsa küçük thumbnail galeri.
- Fotoğraf yoksa model/renk otomatik görseli.
- kategori, hafıza, renk, ilan durumu.
- Cihaz Detayları bölümü.
- açıklama.
- ilan fiyatı.
- KaçaGider piyasa değeri.
- fiyat farkı mesajı.
- satıcı alanı.
- `Satıcıyla İletişime Geç` demo butonu.
- gerçek iletişim henüz bağlı değil.

Header'daki `kacagider.com.tr` logosu ana sayfaya `/` dönmelidir.

Aynı davranış `/ilanlar/` sayfasında da olmalıdır. Logo linkini düzeltirken `.top a` gibi genel CSS ile marka boyutunu bozma; nav link CSS'ini scope et.

## 13. LocalStorage / test verileri

Ana ilan storage key:

`kg_marketplace_listings_v1`

Favoriler prototype key:

`kg_marketplace_favorites_v1`

Önemli:

- Test ilanları **yalnızca oluşturuldukları tarayıcı profilinde** görünür.
- Localhost, Codespaces preview ve başka browser profilleri farklı localStorage kullanabilir.
- Bu yüzden `/ilanlar/` üzerinde `0 aktif ilan` görülmesi veri kaybı anlamına gelmeyebilir; aynı tarayıcı origin'inde test ilanı oluştur.

Gerçek yayında localStorage kaldırılıp Supabase/veritabanı + Storage + gerçek üyelik sistemi bağlanacak.

## 14. Mevcut / gelecekte planlanan gerçek backend

Aşamalı hedef:

1. Ücretsiz bireysel ilanlar.
2. Profesyonel alıcılar / mağazalar.
3. Gerçek üyelik, favoriler ve mesajlaşma.
4. Supabase/veritabanı ve görsel storage.
5. Daha sonra güvenli ödeme / kargo / doğrulama.

Gelir modeli fikirleri:

- profesyonel B2B üyelik,
- öne çıkarılmış ilan,
- daha ileride hizmet/işlem komisyonu.

Temel piyasa değeri sorgulama ve temel ilan oluşturma ücretsiz kalmalıdır.

## 15. Dosya sahipliği / mimari notlar

Marketplace çalışmasında özellikle kontrol edilecek dosyalar:

- `index.html`
- `assets/marketplace-nav-test.js` — header + tek slider ana sahibi
- `assets/marketplace-details.js` — kondisyon yakalama güvence katmanı + kategori görselleri + ilanlar nav entegrasyonu
- `assets/marketplace-test.js` — ilan akışı, üyelik prototype, renk, fotoğraf, localStorage
- `assets/marketplace-home-header.js` — legacy/devre dışı
- `assets/marketplace-home-slider.js` — legacy/devre dışı
- `data/model-images.js` — model/renk ürün görselleri
- `ilanlar/index.html`
- `ilan/index.html`
- `.devcontainer/start-preview.sh`
- `.devcontainer/devcontainer.json`

Marketplace scripti ana sayfaya test branch'inde yüklenir. Mevcut fiyatlandırma motoruna marketplace için toplu refactor yapma.

## 16. Kesin korunacak sınırlar

- Kullanıcı istemedikçe `main` branch'ine dokunma.
- Mevcut pricing engine'i değiştirme.
- Piksel/kasa/ekran gibi mevcut fiyatlandırma katsayılarını marketplace çalışması bahanesiyle değiştirme.
- SEO metadata / H1 / canonical / sitemap / robots yapısını gereksiz yere değiştirme.
- Ana siteyi framework'e taşıma.
- Gereksiz paket/dependency ekleme.
- Büyük CSS refactor yapma; değişiklikleri scope et.
- Kullanıcı istemedikçe SEO çalışması yapma.
- Kullanıcı özellikle istemedikçe browser otomasyonu yapma.
- Test sırasında `localhost:8000`/Codespaces preview üzerinde kullanıcı manuel kontrol yapar.

## 17. UX kararları

- Kullanıcıya mümkün olduğunca az adım.
- Piyasa değeri sorgulamak için üyelik zorunlu değil.
- İlan bilgileri değerleme ekranından otomatik dolmalı.
- Kullanıcı aynı marka/model/hafıza bilgisini yeniden yazmamalı.
- Renk ve fotoğraf ilan kalitesini artıran ek alanlardır.
- İlan sayfasında KaçaGider değeri ile satıcı ilan fiyatı yan yana anlaşılır görünmeli.
- Görseller kart içinde dengeli ve premium görünmeli.
- Ana sayfa header ve slider büyük e-ticaret sitelerinden ilham alan ama KaçaGider renkleri/kimliği ile sade görünmeli.

## 18. Codex'e görev geldiğinde izlenecek yöntem

Kullanıcı yeni marketplace görevi verdiğinde:

1. Bu dosyayı oku.
2. `git status` ve branch'i kontrol et.
3. Yerel değişiklikleri koru.
4. İlgili mevcut dosyayı oku; tahmin ederek sıfırdan üretme.
5. En küçük hedefli değişikliği yap.
6. Pricing/SEO/main kapsamına taşma.
7. Gerekirse port 8000 preview'ı başlat.
8. Kullanıcı manuel test edecek; otomatik browser testi yalnızca gerçekten gerekli ise kullan.
9. Sonuçta hangi dosyaların değiştiğini ve ne yaptığını kısa raporla.

## 19. Remote branch durumu ve yerel fark uyarısı

Bu dosyanın güncellenmesinden hemen önce remote `marketplace-test` HEAD:

`be475efccd7347403d9a558aaabce3fd25102f98`

Bu branch'te daha önceki temel marketplace/görsel hedef commit'i:

`8e88c90647a9bc7fb5253ada232cdf21f16d6813`

Ancak Codex/localhost üzerinde kullanıcı daha sonra yerel değişiklikler yapmış olabilir. **Bu nedenle remote HEAD'i zorla checkout/reset ederek yerel çalışmayı silme.** Önce `git status`, `git diff` ve gerekirse `git log --oneline --decorate -n 15` ile mevcut yerel durumu incele.

## 20. Özet ürün cümlesi

Marketplace için ana ürün mesajı:

**`Değerini öğren. Doğru fiyata sat.`**

KaçaGider'in rolü:

**Güncel piyasa verilerini değerlendir, ortalama satış değerini göster, kullanıcıya ilanını doğru fiyatla yayınlama imkânı ver.**
