# KaçaGider Google OAuth Kurulumu

Bu branch, `Ücretsiz İlan Ver` akışına e-posta üyeliği, e-posta doğrulaması ve Google ile giriş desteği ekler.

## Supabase

Proje ref: `cfkrmzoghpoddkvzplyq`

Google provider için callback URL:

`https://cfkrmzoghpoddkvzplyq.supabase.co/auth/v1/callback`

Supabase > Authentication > Sign In / Providers > Google bölümünde Google Cloud'dan oluşturulan Web OAuth Client ID ve Client Secret kaydedilmelidir. Client Secret hiçbir zaman repository'ye yazılmamalıdır.

Supabase URL Configuration:

- Site URL: `https://kacagider.com.tr`
- Redirect URL: `https://kacagider.com.tr/**`
- Redirect URL: `https://www.kacagider.com.tr/**`

## Google Cloud

OAuth istemci türü: `Web application`

Authorized JavaScript origins:

- `https://kacagider.com.tr`
- `https://www.kacagider.com.tr`

Authorized redirect URI:

- `https://cfkrmzoghpoddkvzplyq.supabase.co/auth/v1/callback`

Branding için canlı URL'ler:

- Ana sayfa: `https://kacagider.com.tr`
- Gizlilik Politikası: `https://kacagider.com.tr/gizlilik-politikasi/`
- Kullanım Koşulları: `https://kacagider.com.tr/kullanim-kosullari/`

Authorized domains:

- `kacagider.com.tr`
- `cfkrmzoghpoddkvzplyq.supabase.co`

Google Auth Platform > Audience bölümünde uygulama yalnızca test kullanıcılarına açıksa, Branding bilgileri tamamlandıktan sonra uygulama production durumuna alınmalıdır.

## Güvenlik

- Client Secret veya Supabase service-role secret repo içine yazılmaz.
- `Skip nonce checks` varsayılan olarak kapalı tutulur.
- `Allow users without an email` kapalı tutulur.
- İlan sahipliği Supabase `auth.uid()` / `user_id` ve RLS politikalarıyla korunur.

## Manuel kabul testi

Canlı veya localhost üzerinde:

1. E-posta ile kayıt ol ve doğrulama yapılmadan ilan yayınlanamadığını doğrula.
2. Doğrulama e-postasını tekrar gönder akışını kontrol et.
3. Şifremi unuttum / yeni şifre belirleme akışını kontrol et.
4. Google ile devam et butonunun Google hesap seçim ekranına yönlendirdiğini kontrol et.
5. Google dönüşünden sonra oturumun açıldığını ve ilan formuna devam edildiğini doğrula.
6. Gizlilik Politikası ve Kullanım Koşulları URL'lerinin herkese açık olarak açıldığını doğrula.

Canlı browser otomasyonu gereksiz yere çalıştırılmamalıdır; manuel test kullanıcı tarafından yapılabilir.
