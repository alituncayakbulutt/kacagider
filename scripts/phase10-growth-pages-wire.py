from pathlib import Path
import re

changed=[]
def save(path,text,old):
    if text!=old:
        path.write_text(text,encoding='utf-8');changed.append(str(path))

# Sitemap: add the three durable Phase 10 growth routes once.
p=Path('sitemap.xml');s=p.read_text(encoding='utf-8');old=s
entries=[
('https://kacagider.com.tr/fiyat-alarmi/','0.8'),
('https://kacagider.com.tr/is-ortakligi/','0.6'),
('https://kacagider.com.tr/kurumsal-api/','0.6'),
]
lines=[]
for url,priority in entries:
    if f'<loc>{url}</loc>' not in s:
        lines.append(f'  <url><loc>{url}</loc><lastmod>2026-09-04</lastmod><changefreq>monthly</changefreq><priority>{priority}</priority></url>')
if lines:
    s=s.replace('</urlset>','\n'.join(lines)+'\n</urlset>',1)
save(p,s,old)

# Footer: expose growth routes without creating a second footer implementation.
p=Path('assets/site-trust-footer.js');s=p.read_text(encoding='utf-8');old=s
needle='<a href="/bilgi-merkezi/">Bilgi Merkezi</a><a href="/iletisim/">İletişim</a>'
replace='<a href="/bilgi-merkezi/">Bilgi Merkezi</a><a href="/fiyat-alarmi/">Fiyat Alarmı</a><a href="/is-ortakligi/">İş Ortaklığı</a><a href="/kurumsal-api/">Kurumsal API</a><a href="/iletisim/">İletişim</a>'
if needle in s:s=s.replace(needle,replace,1)
save(p,s,old)

# Phase 8 regression guard: remove old reload-only timestamp cache bypass from SEO layout.
p=Path('_layouts/seo.html');s=p.read_text(encoding='utf-8');old=s
block=re.compile(r'<script>\s*\(function \(\) \{\s*try \{\s*var entries = performance\.getEntriesByType.*?\}\)\(\);\s*</script>\s*',re.S)
s,n=block.subn('',s,count=1)
if n==0 and '/?fresh=' in s:
    raise SystemExit('fresh cache-bypass still present but known block was not matched')
save(p,s,old)

print('PHASE 10 GROWTH PAGES WIRE:',len(changed),'file(s) updated')
for x in changed:print(' -',x)
