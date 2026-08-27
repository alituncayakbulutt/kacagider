# KaçaGider Üyelik + Google Giriş Kurulumu

Bu dosya `Ücretsiz İlan Ver` akışındaki Supabase Auth yapılandırmasının üretim ayarlarını özetler.

## Uygulanan uygulama akışı

- E-posta + şifre ile ücretsiz üyelik.
- Kayıtta ad soyad ve iki kez şifre girişi.
- E-posta doğrulanmadan ilan yayınlama engeli.
- Doğrulama e-postasını tekrar gönderme.
- Şifremi unuttum ve yeni şifre belirleme akışı.
- Google ile devam et (Supabase OAuth).
- Google girişinden sonra değerleme bilgisi `sessionStorage` içinde korunur ve kullanıcı ilan formuna geri alınır.
- İlan kaydı mevcut `auth.uid()` / `user_id` RLS yapısını kullanmaya devam eder.
- Tarayıcı tarafında yalnızca Supabase publishable key bulunur; Google Client Secret veya Supabase service-role key repoya yazılmaz.

## Supabase Auth ayarları

Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://kacagider.com.tr`
- Redirect URLs listesine şunları ekle:
  - `https://kacagider.com.tr/**`
  - `https://www.kacagider.com.tr/**`
  - `http://localhost:8080/**` (yalnızca yerel manuel test için)

Supabase Dashboard > Authentication > Providers > Email:

- Email provider açık olmalı.
- Confirm email açık olmalı.
- SMTP kullanılıyorsa gönderici alan adı ve SMTP bilgileri Supabase Dashboard içinde tutulmalı; repoya parola yazılmamalı.

## Google OAuth ayarları

Google Cloud Console'da bir Web application OAuth Client oluştur.

Authorized redirect URI:

`https://cfkrmzoghpoddkvzplyq.supabase.co/auth/v1/callback`

Ardından Supabase Dashboard > Authentication > Providers > Google bölümünde:

1. Google provider'ı etkinleştir.
2. Google Client ID değerini gir.
3. Google Client Secret değerini gir.
4. Kaydet.

Google Client Secret hiçbir HTML/JS dosyasına veya GitHub repository'sine eklenmemelidir.

## Manuel kabul testi

Otomatik canlı-browser testi zorunlu değildir. `localhost:8080` üzerinde şu akışları elle kontrol et:

1. Ücretsiz İlan Ver > Üye Ol ekranında Google butonu görünüyor.
2. E-posta üyeliğinde eşleşmeyen şifreler engelleniyor.
3. Yeni üyeye doğrulama e-postası geliyor; doğrulanmadan ilan yayınlanamıyor.
4. Doğrulama sonrası giriş yapınca ilan formu açılıyor.
5. Google ile devam et sonrası siteye dönülüyor ve değerleme bilgisi korunarak ilan formu açılıyor.
6. Şifremi unuttum e-postası geliyor ve yeni şifre belirlenebiliyor.
7. Yayınlanan ilanda `user_id` giriş yapan kullanıcıya ait kalıyor; mevcut RLS kuralları korunuyor.
