---
layout: "growth"
seo_title: "Kurumsal İkinci El Telefon Fiyat API'si | KaçaGider"
seo_description: "İkinci el telefon fiyat verisini sistemine entegre etmek için KaçaGider kurumsal fiyat API'sine başvur; anahtar bazlı erişim, günlük kota ve TRY referans fiyatları sunar."
seo_h1: "KaçaGider Kurumsal Fiyat API'si"
seo_canonical: "https://kacagider.com.tr/kurumsal-api/"
growth_form: "true"
---
<section class="kg-growth-hero">
  <div>
    <span class="kg-growth-eyebrow">⚡ Kurumsal fiyat servisi</span>
    <h1>İkinci el telefon fiyat referansını sistemine bağla.</h1>
    <p>KaçaGider B2B fiyat servisi, yetkilendirilmiş iş ortaklarının marka, model ve hafıza bilgisiyle güncel telefon referans fiyatı sorgulamasına yönelik anahtar bazlı bir API altyapısıdır.</p>
    <div class="kg-growth-actions"><a class="kg-growth-btn primary" href="#api-basvuru">API erişimine başvur</a><a class="kg-growth-btn" href="/veri-metodolojisi/">Metodolojiyi incele</a></div>
  </div>
  <div class="kg-growth-card kg-growth-hero-card"><span>İlk API kapsamı</span><strong>Telefon / TRY</strong><span>İlk üretim endpoint’i telefon marka + model + hafıza kombinasyonlarında KaçaGider piyasa referans fiyatını döndürür.</span><div class="kg-growth-mini"><div><b>API Key</b><small>Her müşteri için ayrı erişim</small></div><div><b>Günlük kota</b><small>Müşteri bazlı limit</small></div><div><b>JSON</b><small>Basit entegrasyon çıktısı</small></div></div></div>
</section>

<section class="kg-growth-section"><h2>Nasıl çalışır?</h2><div class="kg-growth-grid"><article class="kg-growth-feature"><i>1</i><h3>Yetkilendirilmiş erişim</h3><p>API public fiyat dökümü değildir. Aktif iş ortaklarına ayrı API anahtarı ve kullanım kotası tanımlanır.</p></article><article class="kg-growth-feature"><i>2</i><h3>Model bazlı sorgu</h3><p>Telefon markası, modeli ve hafıza bilgisiyle tek bir referans fiyat sorgulanır.</p></article><article class="kg-growth-feature"><i>3</i><h3>Ölçülebilir kullanım</h3><p>Günlük sorgu adedi müşteri bazında izlenir. Kota ve kapsam iş ortaklığı modeline göre belirlenebilir.</p></article></div></section>

<section class="kg-growth-section"><h2>Örnek istek ve yanıt</h2><p>Aşağıdaki örnek yalnız entegrasyon biçimini gösterir. Gerçek kullanım için KaçaGider tarafından tanımlanmış aktif bir API anahtarı gerekir.</p><pre class="kg-growth-api-example">GET /functions/v1/kg-b2b-price-api?category=phone&amp;brand=Apple&amp;model=iPhone%2013&amp;storage=128
x-api-key: kg_live_••••••••••••••••

{
  "data": {
    "category": "phone",
    "brand": "Apple",
    "model": "iPhone 13",
    "storage": "128",
    "reference_price": 24850,
    "currency": "TRY",
    "price_type": "kacagider_market_reference"
  },
  "meta": {
    "remaining_today": 499
  }
}</pre></section>

<section class="kg-growth-section"><h2>API kullanım alanları</h2><div class="kg-growth-grid"><article class="kg-growth-feature"><i>🏪</i><h3>Bayi fiyat ekranı</h3><p>Mağaza personelinin cihaz için bağımsız bir piyasa referansı görmesine yardımcı olan iç araçlar.</p></article><article class="kg-growth-feature"><i>🧾</i><h3>Teklif ön kontrolü</h3><p>Toplu cihaz listelerinde marka, model ve hafıza bazında referans fiyatı otomatik kontrol etmek isteyen ekipler.</p></article><article class="kg-growth-feature"><i>📊</i><h3>Stok ve raporlama</h3><p>İkinci el cihaz stoklarının piyasa referansıyla karşılaştırıldığı dahili rapor ve karar sistemleri.</p></article></div></section>

<section class="kg-growth-section" id="api-basvuru"><div class="kg-growth-form-wrap"><div class="kg-growth-form-info"><span class="kg-growth-eyebrow">API erişim başvurusu</span><h2>Kullanım senaryonu anlat.</h2><p>API erişimi otomatik açılmaz. Kullanım amacı, tahmini hacim ve iş modeline göre erişim kapsamı ile kota belirlenir.</p><ul class="kg-growth-list"><li>API anahtarları yalnız yetkilendirilmiş kurumlara verilir.</li><li>Anahtar başına günlük kullanım kotası uygulanır.</li><li>İlk kapsam telefon referans fiyatıdır; diğer kategoriler veri yeterliliğine göre açılır.</li><li>Fiyatlar satış garantisi değil, piyasa referansıdır.</li></ul></div><form class="kg-growth-form" data-growth-form="api"><div class="kg-growth-honeypot" aria-hidden="true"><label>Web adresi<input name="company_url" tabindex="-1" autocomplete="off"></label></div><div class="kg-growth-form-grid"><div class="kg-growth-field"><label>Şirket / ürün adı *</label><input name="company" maxlength="140" required></div><div class="kg-growth-field"><label>Yetkili adı *</label><input name="contact_name" maxlength="120" required></div><div class="kg-growth-field"><label>Kurumsal e-posta *</label><input name="email" type="email" maxlength="254" required></div><div class="kg-growth-field"><label>Telefon</label><input name="phone" maxlength="40" inputmode="tel"></div><div class="kg-growth-field"><label>Şehir</label><input name="city" maxlength="100"></div><div class="kg-growth-field"><label>Web sitesi</label><input name="website" maxlength="240" placeholder="https://"></div><div class="kg-growth-field"><label>Kullanım alanı</label><select name="business_type"><option value="">Seç</option><option>Bayi / mağaza içi araç</option><option>E-ticaret / pazaryeri</option><option>Kurumsal cihaz yönetimi</option><option>Fiyat karşılaştırma / raporlama</option><option>Yazılım / entegrasyon</option><option>Diğer</option></select></div><div class="kg-growth-field"><label>Tahmini günlük sorgu</label><select name="monthly_volume"><option value="">Henüz bilmiyorum</option><option>1–100 sorgu/gün</option><option>101–500 sorgu/gün</option><option>501–2.000 sorgu/gün</option><option>2.000+ sorgu/gün</option></select></div><div class="kg-growth-field full"><label>Entegrasyon ihtiyacın</label><textarea name="message" maxlength="1500" placeholder="API'yi nerede ve ne amaçla kullanacağını kısaca anlat."></textarea></div></div><label class="kg-growth-consent"><input name="consent" type="checkbox" required><span>API başvurumun değerlendirilmesi ve benimle iletişime geçilmesi amacıyla verdiğim bilgilerin işlenmesini kabul ediyorum. <a href="/kvkk/">KVKK Aydınlatma Metni</a></span></label><button class="kg-growth-submit" type="submit">API erişimine başvur</button><div class="kg-growth-note" data-growth-note></div></form></div></section>

<section class="kg-growth-section"><h2>Sık sorulan sorular</h2><div class="kg-growth-faq"><details><summary>API herkese açık mı?</summary><p>Hayır. Endpoint aktif olsa da fiyat sorgusu yalnız KaçaGider tarafından oluşturulan geçerli API anahtarıyla yapılabilir.</p></details><details><summary>API hangi kategorileri destekliyor?</summary><p>İlk üretim kapsamı telefon fiyat referanslarıdır. Tablet, bilgisayar, akıllı saat ve oyun konsolu kapsamı yeterli veri derinliğine ulaştığında ayrıca açılabilir.</p></details><details><summary>API fiyatı gerçek alım fiyatı mı?</summary><p>Hayır. API, KaçaGider piyasa referans değerini döndürür. Cihaz kondisyonu, fiziksel durum ve gerçek ticari koşullar ayrıca değerlendirilmelidir.</p></details></div></section>
