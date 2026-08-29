# Admin Panel V1

## Kapsam

Panel `/admin/` altında çalışır, `noindex,nofollow` içerir ve sitemap'e eklenmez. Mevcut Supabase Auth oturumu kullanılır; ayrı kimlik doğrulama, service-role anahtarı veya frontend admin bayrağı yoktur.

## Kurulum

1. `supabase/migrations/20260829_admin_panel_v1.sql` migration'ını Supabase SQL/Migrations akışıyla uygulayın.
2. E-posta doğrulaması tamamlanmış bir kullanıcının UUID'sini Auth panelinden alın.
3. Bu UUID'yi yalnızca güvenilir yönetici SQL oturumunda aşağıdaki örnekle ekleyin; frontend veya localStorage üzerinden admin atanmaz:

```sql
insert into public.admin_users (user_id, role)
values ('VERIFIED_USER_UUID', 'admin')
on conflict (user_id) do update set active = true, role = excluded.role;
```

## Güvenlik

`is_admin()` ve yönetim RPC'leri `SECURITY DEFINER` ile yalnızca aktif `admin`/`super_admin` kayıtlarını kabul eder. Yönetim tablolarına doğrudan yazma politikası yoktur; durum değişikliği, ilan silme ve audit yazımı RPC üzerinden yapılır. Silme sonrası dosya temizliği istemci tarafından ayrıca denenir ve başarısızlık kullanıcıya bildirilir.

## Yönetici kaldırma

```sql
update public.admin_users set active = false where user_id = 'VERIFIED_USER_UUID';
```

## Manuel kontrol listesi

- Yetkisiz kullanıcı `/admin/` açtığında erişim reddedilir ve ana sayfa bağlantısı görünür.
- Yetkili kullanıcı Dashboard, İlanlar, Kullanıcılar ve İşlem Geçmişi sekmelerini görebilir.
- İlan durumu güncelleme ve silme işlemleri onay ister; silme hesap silmez.
- Fotoğraf yolları silme sonrasında depolamadan temizlenmeye çalışılır.
- Telefon ve diğer marketplace kategorilerindeki mevcut ilan verileri yalnızca okunur veya yönetim RPC'leri üzerinden işlenir.
