KaçaGider SEO Paketi
===================
Toplam indekslenebilir URL: 211

İçerik:
- index.html (mevcut canlı ana site)
- robots.txt
- sitemap.xml
- /telefon/ kategori sayfası
- /telefon/apple/ marka sayfası
- /telefon/samsung/ marka sayfası
- Apple tüm model sayfaları + kaynak dosyada tanımlı gerçek hafıza seçenekleri için alt sayfalar
- Samsung tüm model sayfaları

Not:
Samsung için kaynak HTML'de model bazlı gerçek hafıza eşlemesi bulunmadığı için uydurma hafıza sayfaları oluşturulmadı.


Guncelleme 15.08.2026: Apple/Samsung model sayfalari Supabase fiyat verisine baglandi. Apple hafiza sayfalarina tahmini deger, hizli satis, ilan fiyati ve veri guveni eklendi. Samsung model sayfalari mevcut hafiza/fiyat verilerini dinamik listeler.


Fiyat bağlantısı düzeltmesi:
- Model+hafıza SEO sayfaları artık price_estimates tablosunu doğrudan okumaz.
- SUPABASE_RPC_KURULUM.sql dosyasındaki fonksiyonu Supabase SQL Editor'da bir kez çalıştırın.
- Ardından bu paketi Netlify'a yükleyin.
