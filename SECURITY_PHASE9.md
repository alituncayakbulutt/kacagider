# KaçaGider — FAZ 9 Platform Güvenliği

Tarih: 2026-09-04

## Uygulanan Supabase sertleştirmeleri

Migration: `phase9_harden_internal_db_surface`

- `public.set_updated_at()` fonksiyonunun `search_path` değeri boş/pinned hale getirildi.
- Trigger/event-trigger olarak çalışan ve istemcinin RPC ile çağırmaması gereken fonksiyonların `PUBLIC EXECUTE` yetkileri kaldırıldı:
  - `capture_listing_price_observation()`
  - `handle_new_user()`
  - `rls_auto_enable()`
  - `set_updated_at()`
- `get_market_price_observations_for_engine(timestamptz)` yalnızca backend/service-role kullanımına bırakıldı; `anon` ve `authenticated` EXECUTE yetkileri kaldırıldı.
- Aşağıdaki internal-only tablolara browser rollerini açıkça reddeden RLS policy'leri eklendi:
  - `kg_ai_anon_daily_usage`
  - `market_price_candidates`
  - `market_price_observations`
  - `market_price_sources`

## Doğrulanan mevcut korumalar

- Tüm `public` uygulama tablolarında RLS açık.
- İlan, ilan fotoğrafı, favori, değerleme, satış geçmişi ve fiyat alarmı write policy'leri kullanıcıyı `auth.uid()` ile sınırlandırıyor.
- `listing_reports` yalnızca oturum açmış kullanıcının kendi raporunu oluşturmasına/okumasına izin veriyor; admin update ayrı policy ile korunuyor.
- Storage `listing-images` yüklemeleri kullanıcı klasörüne bağlı; yalnızca JPEG/PNG/WebP kabul ediliyor ve bucket dosya limiti 6 MB.
- Admin sayfası `noindex,nofollow` ve yönetim verileri yüklenmeden önce `is_admin()` kontrolü yapıyor.
- Tarayıcı kodu yeni `sb_publishable_...` anahtar tipini kullanıyor. High-privilege `sb_secret_...` / service-role anahtarı frontend'e konmuyor.

## Supabase Security Advisor'da bilinçli kalan uyarılar

Aşağıdaki SECURITY DEFINER RPC'leri admin panelinin çalışması için `authenticated` role açık kalır:

- `is_admin()`
- `admin_list_users()`
- `admin_list_audit_logs()`
- `admin_set_listing_status(...)`
- `admin_delete_listing(...)`

Bu fonksiyonlar istemci tarafında doğrudan yetki kabul etmez; her çağrıda `public.is_admin()` kontrolü yapar. Bu nedenle advisor uyarısı mimarinin bilinçli bir sonucudur.

## Manuel Supabase Auth ayarı

Security Advisor'da kalan `Leaked Password Protection Disabled` uyarısı Supabase Dashboard/Auth ayarıdır; SQL migration ile değiştirilemez. Pro plan ve üzerindeyse Authentication → Email/Password ayarlarından leaked password protection etkinleştirilmelidir.

## Otomatik güvenlik kalite kapısı

`Phase 9 Security` GitHub Actions workflow'u her main push/PR'da:

1. `scripts/security-audit.py`
2. `scripts/performance-audit.py`
3. `scripts/mobile-v3-audit.py`
4. `scripts/seo-site-audit.py`

çalıştırır. Security audit; yüksek yetkili anahtar/token kalıplarını, takip edilen production env/private-key dosyalarını ve admin authorization/noindex regresyonlarını engeller.
