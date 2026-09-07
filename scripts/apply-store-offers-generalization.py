from pathlib import Path
import re


def load(path):
    return Path(path).read_text(encoding='utf-8')


def save(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_required(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing expected text: {label}')
    return text.replace(old, new)


# 1) Result sell options: enable all supported device categories and use generic store wording.
path='assets/marketplace-sell-options-ui.js'
text=load(path)
text=replace_required(text,
"function isPhone(){var n=q('#selectedCategoryName');if(n&&String(n.textContent||'').trim()==='Telefon')return true;var a=q('.category-card.active[data-category],.kg-approved-card.active[data-category]');return !!(a&&a.dataset&&(a.dataset.category==='phone'||a.dataset.category==='telefon'));}",
"function currentCategory(){var a=q('.category-card.active[data-category],.kg-approved-card.active[data-category]');if(a&&a.dataset&&a.dataset.category)return String(a.dataset.category).toLowerCase();var n=q('#selectedCategoryName'),v=String(n&&n.textContent||'').trim().toLocaleLowerCase('tr-TR');return {'telefon':'phone','tablet':'tablet','bilgisayar':'computer','akıllı saat':'watch','akilli saat':'watch','oyun konsolu':'console'}[v]||'';}\nfunction isSupportedCategory(){return ['phone','tablet','computer','watch','console'].indexOf(currentCategory())>=0;}",
'phone-only category gate')
text=replace_required(text,
"<strong>🏪 Telefoncuya Sat</strong><span>Doğrulanmış telefonculardan cihazın için alış teklifi al.</span><small>Telefonculardan teklif al →</small>",
"<strong>🏪 Mağazalardan Teklif Al</strong><span>Bulunduğun bölgedeki doğrulanmış mağazalardan cihazın için alış teklifi al.</span><small>Mağazalardan teklif al →</small>",
'sell option copy')
text=replace_required(text,
"KaçaGider telefoncu alış fiyatını belirlemez; teklifleri telefoncular verir.",
"KaçaGider alış fiyatını belirlemez; teklifleri mağazalar verir.",
'sell option note')
text=replace_required(text,
"var show=currentPrice()>0&&isPhone();",
"var show=currentPrice()>0&&isSupportedCategory();",
'sell option visibility')
save(path,text)

# 2) Modal: read either phone selectors or generic category selectors and persist category.
path='assets/marketplace-sell-options-modal.js'
text=load(path)
text=replace_required(text,
"function device(){\n  return [val('phoneBrand'),val('model'),val('storage')].filter(Boolean).join(' ');\n}\nfunction isIphone(){\n  return /apple|iphone/i.test([val('phoneBrand'),val('model')].join(' '));\n}",
"function currentCategory(){\n  var a=q('.category-card.active[data-category],.kg-approved-card.active[data-category]');\n  if(a&&a.dataset&&a.dataset.category)return String(a.dataset.category).toLowerCase();\n  var n=String(val('selectedCategoryName')||'').trim().toLocaleLowerCase('tr-TR');\n  return {'telefon':'phone','tablet':'tablet','bilgisayar':'computer','akıllı saat':'watch','akilli saat':'watch','oyun konsolu':'console'}[n]||'phone';\n}\nfunction deviceFields(){\n  var category=currentCategory();\n  if(category==='phone')return {category:category,brand:val('phoneBrand'),model:val('model'),storage:val('storage')};\n  return {category:category,brand:val('genericBrand'),model:val('genericModel'),storage:val('genericStorage')};\n}\nfunction device(){\n  var d=deviceFields();\n  return [d.brand,d.model,d.storage].filter(Boolean).join(' ');\n}\nfunction isIphone(){\n  var d=deviceFields();\n  return d.category==='phone'&&/apple|iphone/i.test([d.brand,d.model].join(' '));\n}",
'generic device fields')
repls={
"<h2>Telefonculardan teklif al</h2>":"<h2>Mağazalardan teklif al</h2>",
"<p>Doğrulanmış telefoncular cihazın için kendi alış tekliflerini verecek.</p>":"<p>Bulunduğun bölgedeki doğrulanmış mağazalar cihazın için kendi alış tekliflerini verecek.</p>",
"Teklifleri telefoncular verir.":"Teklifleri mağazalar verir.",
"Telefoncuların teklif verebilmesi":"Mağazaların teklif verebilmesi",
"Telefoncunun bilmesi gereken başka bir durum var mı?":"Mağazanın bilmesi gereken başka bir durum var mı?",
"Telefoncuların cihazı daha doğru değerlendirebilmesi":"Mağazaların cihazı daha doğru değerlendirebilmesi",
"Talep henüz telefonculara gönderilmedi.":"Talep henüz mağazalara gönderilmedi."
}
for old,new in repls.items():
    if old not in text:
        raise SystemExit(f'Missing modal copy: {old}')
    text=text.replace(old,new)
text=replace_required(text,
"    err.classList.remove('show');\n    var draft={",
"    err.classList.remove('show');\n    var current=deviceFields();\n    var draft={",
'draft current device')
text=replace_required(text,
"      brand:val('phoneBrand'),model:val('model'),storage:val('storage'),marketPrice:price()",
"      category:current.category,brand:current.brand,model:current.model,storage:current.storage,marketPrice:price()",
'draft category fields')
save(path,text)

# 3) Backend: store the real category instead of forcing phone.
path='assets/marketplace-dealer-backend.js'
text=load(path)
text=text.replace('Telefonculardan teklif almak için giriş yapmalısın.','Mağazalardan teklif almak için giriş yapmalısın.')
text=replace_required(text,"    category:'phone',","    category:cleanText(draft.category,40)||'phone',",'backend category')
text=replace_required(text,
"    source:'kacagider_valuation'",
"    source:'kacagider_valuation',\n    category:cleanText(draft.category,40)||'phone'",
'snapshot category')
text=text.replace("select('id,request_code,brand,model,storage,market_value,city,district,has_damage,status,created_at')","select('id,request_code,category,brand,model,storage,market_value,city,district,has_damage,status,created_at')")
save(path,text)

# 4) Submit/success copy: user-facing terminology should be store, not phone dealer.
path='assets/marketplace-dealer-submit.js'
text=load(path)
text=text.replace('Telefonculardan teklif almak için önce KaçaGider hesabına giriş yapmalısın.','Mağazalardan teklif almak için önce KaçaGider hesabına giriş yapmalısın.')
text=text.replace('yalnızca yetkili ve doğrulanmış telefoncular teklif sürecinde erişebilecek.','yalnızca yetkili ve doğrulanmış mağazalar teklif sürecinde erişebilecek.')
text=text.replace('alış tekliflerini telefoncular verecek.','alış tekliflerini mağazalar verecek.')
save(path,text)

# 5) Dealer panel visible labels become store labels. Routes/internal dealer identifiers stay unchanged for compatibility.
path='assets/dealer-panel.js'
text=load(path)
text=text.replace('Telefoncu paneli için giriş yap','Mağaza paneli için giriş yap')
text=text.replace('Telefoncu erişimin aktif değil','Mağaza erişimin aktif değil')
text=text.replace('yalnızca KaçaGider tarafından doğrulanmış telefoncular içindir.','yalnızca KaçaGider tarafından doğrulanmış mağazalar içindir.')
text=text.replace('Telefoncu Başvurusu','Mağaza Başvurusu')
text=text.replace('<h1>Telefoncu Paneli</h1>','<h1>Mağaza Paneli</h1>')
save(path,text)

# 6) Existing preference filter is currently phone-catalog based; clarify wording without changing behavior.
path='assets/dealer-device-preferences.js'
text=load(path)
text=text.replace('bulunduğun ildeki tüm uygun telefon taleplerini görürsün.','bulunduğun ildeki tüm uygun cihaz taleplerini görürsün. Telefon marka/model tercihleri yalnızca telefon taleplerine uygulanır.')
text=text.replace('KaçaGider telefon kataloğundan seçilir.','KaçaGider telefon kataloğundan seçilir; diğer cihaz kategorileri bu filtreye takılmaz.')
text=text.replace('Tüm telefonları göster','Telefon tercihlerini temizle')
text=text.replace('tüm uygun telefon taleplerini görmek istiyor musun?','telefon tercihlerini kaldırmak istiyor musun? Diğer cihaz kategorileri zaten bu filtreden bağımsızdır.')
save(path,text)

# 7) Cache bust changed marketplace files, plus the loader reference in index.html if present.
path='assets/marketplace-sell-options.js'
text=load(path)
text=re.sub(r'marketplace-sell-options-modal\.js\?v=[^\'\"]+', 'marketplace-sell-options-modal.js?v=20260907-store1', text)
text=re.sub(r'marketplace-dealer-backend\.js\?v=[^\'\"]+', 'marketplace-dealer-backend.js?v=20260907-store1', text)
text=re.sub(r'marketplace-dealer-submit\.js\?v=[^\'\"]+', 'marketplace-dealer-submit.js?v=20260907-store1', text)
text=re.sub(r'marketplace-sell-options-ui\.js\?v=[^\'\"]+', 'marketplace-sell-options-ui.js?v=20260907-store1', text)
save(path,text)

path='index.html'
text=load(path)
text,new_count=re.subn(r'marketplace-sell-options\.js\?v=[^\'\"<> ]+', 'marketplace-sell-options.js?v=20260907-store1', text)
if new_count==0:
    # A bare loader URL is also acceptable; add a version only to the first occurrence.
    text,new_count=re.subn(r'marketplace-sell-options\.js', 'marketplace-sell-options.js?v=20260907-store1', text, count=1)
if new_count==0:
    raise SystemExit('Marketplace sell options loader reference not found in index.html')
save(path,text)

print('Store offer generalization applied successfully.')