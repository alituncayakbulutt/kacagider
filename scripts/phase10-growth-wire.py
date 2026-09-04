from pathlib import Path
import re

changed=[]

def write(path,text,old):
    if text!=old:
        path.write_text(text,encoding='utf-8')
        changed.append(str(path))

# Result V2: preserve the raw catalog reference and condition factor when creating alerts.
p=Path('assets/result-v2.js')
s=p.read_text(encoding='utf-8'); old=s
marker="  function payloadValid(p){return !!(p&&p.brand&&p.model&&p.estimated_price);}\n"
helper="""  function priceAlertReference(payload){
    if(!payload||payload.category!=='phone'||typeof PHONE_PRICE_DATA==='undefined')return 0;
    try{
      var brands=PHONE_PRICE_DATA||{},bk=Object.keys(brands).find(function(k){return String(k).toLocaleLowerCase('tr-TR')===String(payload.brand||'').toLocaleLowerCase('tr-TR');});if(!bk)return 0;
      var models=brands[bk]||{},mk=Object.keys(models).find(function(k){return String(k).toLocaleLowerCase('tr-TR')===String(payload.model||'').toLocaleLowerCase('tr-TR');});if(!mk)return 0;
      var variants=models[mk]||{},m=String(payload.storage||'').match(/\\d+/),key=m?m[0]:String(payload.storage||'').trim(),row=variants[key];
      if(!row&&Object.keys(variants).length===1)row=variants[Object.keys(variants)[0]];
      return Number(row&&row.estimated_price||0)||0;
    }catch(_e){return 0;}
  }
"""
if 'function priceAlertReference(payload)' not in s:
    if marker not in s: raise SystemExit('result-v2 payload marker missing')
    s=s.replace(marker,helper+marker,1)
old_line="      var client=await api.init(),r=await client.from('price_alerts').upsert({user_id:user.id,category:payload.category,brand:payload.brand,model:payload.model,storage:payload.storage,baseline_price:payload.estimated_price,target_price:payload.estimated_price,is_active:true,updated_at:new Date().toISOString()},{onConflict:'user_id,category,brand,model,storage'});if(r.error)throw r.error;\n"
new_line="      var ref=priceAlertReference(payload),factor=ref&&payload.estimated_price?payload.estimated_price/ref:null;var client=await api.init(),r=await client.from('price_alerts').upsert({user_id:user.id,category:payload.category,brand:payload.brand,model:payload.model,storage:payload.storage,baseline_price:payload.estimated_price,target_price:payload.estimated_price,current_price:payload.estimated_price,source_reference_price:ref||null,condition_factor:factor||null,notification_mode:'significant',threshold_pct:5,is_active:true,last_checked_at:null,last_status:'waiting',last_error:null,updated_at:new Date().toISOString()},{onConflict:'user_id,category,brand,model,storage'});if(r.error)throw r.error;\n"
if old_line in s: s=s.replace(old_line,new_line,1)
s=s.replace("setStatus('Fiyat alarmı açıldı. Hesabım bölümünden yönetebilirsin.');if(typeof window.gtag==='function')window.gtag('event','price_alert_created',{category:payload.category,brand:payload.brand,model:payload.model});","setStatus('Fiyat alarmı açıldı. %5 ve üzeri değişimleri Hesabım bölümünden takip edebilirsin.');if(typeof window.gtag==='function')window.gtag('event','price_alert_created',{category:payload.category,brand:payload.brand,model:payload.model,notification_mode:'significant',threshold_pct:5});")
write(p,s,old)

# Account dashboard: alert configuration and richer status.
p=Path('assets/account-dashboard.js')
s=p.read_text(encoding='utf-8'); old=s
anchor="async function loadValuations(c,user){\n"
helpers=r'''function alertModeLabel(x){if(x.notification_mode==='weekly')return 'Haftalık özet';if(x.notification_mode==='target')return 'Hedef fiyat';return 'Belirgin değişim · %'+Number(x.threshold_pct||5);}
function fmtCheck(v){if(!v)return 'Henüz kontrol edilmedi';try{return 'Son kontrol '+new Date(v).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}catch(_e){return 'Henüz kontrol edilmedi';}}
function ensureAlertEditorStyles(){if(q('kgAlertEditorStyle'))return;var st=document.createElement('style');st.id='kgAlertEditorStyle';st.textContent='.kg-alert-editor-overlay{position:fixed;inset:0;z-index:1000010;background:rgba(7,20,38,.72);display:flex;align-items:center;justify-content:center;padding:18px}.kg-alert-editor{width:min(480px,100%);background:#fff;border-radius:18px;padding:22px;box-shadow:0 28px 80px rgba(2,6,23,.32)}.kg-alert-editor h2{margin:0 0 7px}.kg-alert-editor p{color:#667085;font-size:13px;line-height:1.5;margin:0 0 16px}.kg-alert-editor label{display:block;font-size:12px;font-weight:850;margin:12px 0 6px}.kg-alert-editor select,.kg-alert-editor input{width:100%;min-height:44px;border:1px solid #d0d5dd;border-radius:10px;padding:9px 11px;background:#fff}.kg-alert-editor small{display:block;color:#7b8798;margin-top:6px;line-height:1.4}.kg-alert-editor-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}.kg-alert-editor-actions button{border:0;border-radius:10px;padding:11px 15px;font-weight:850;cursor:pointer}.kg-alert-editor-actions .primary{background:#10b956;color:#fff}.kg-alert-live{display:block;color:#087a37;font-size:11px;font-weight:750;margin-top:4px}.kg-alert-sub{display:block;color:#667085;font-size:10.5px;margin-top:3px}';document.head.appendChild(st);}
function openAlertEditor(c,user,x){ensureAlertEditorStyles();var o=document.createElement('div');o.className='kg-alert-editor-overlay';o.innerHTML='<div class="kg-alert-editor"><h2>Fiyat Alarmını Düzenle</h2><p>'+esc(x.brand+' '+x.model+(x.storage?' · '+x.storage:''))+'</p><label>Bildirim türü</label><select id="kgAlertMode"><option value="significant">Belirgin fiyat değişiminde</option><option value="weekly">Haftalık fiyat özeti</option><option value="target">Hedef fiyata ulaştığında</option></select><label>Değişim eşiği (%)</label><input id="kgAlertThreshold" type="number" min="1" max="50" step="1" value="'+esc(x.threshold_pct||5)+'"><small>Belirgin değişim seçeneğinde fiyat bu oran kadar yükselir veya düşerse bildirim hazırlanır.</small><label>Hedef fiyat (TL)</label><input id="kgAlertTarget" type="number" min="1" step="100" value="'+esc(Math.round(Number(x.target_price||x.baseline_price||0)))+'"><small>Hedef fiyat seçeneğinde değer bu tutara veya altına indiğinde alarm tetiklenir.</small><div class="kg-alert-editor-actions"><button type="button" data-alert-cancel>Vazgeç</button><button type="button" class="primary" data-alert-save>Kaydet</button></div></div>';document.body.appendChild(o);var mode=q('kgAlertMode'),thr=q('kgAlertThreshold'),target=q('kgAlertTarget');mode.value=x.notification_mode||'significant';function sync(){thr.disabled=mode.value!=='significant';target.disabled=mode.value!=='target';}mode.addEventListener('change',sync);sync();o.addEventListener('click',function(e){if(e.target===o||e.target.closest('[data-alert-cancel]'))o.remove();});o.querySelector('[data-alert-save]').addEventListener('click',async function(){var m=mode.value,t=Math.max(1,Math.min(50,Number(thr.value||5))),tp=Number(target.value||0);if(m==='target'&&!tp){note('Hedef fiyat için geçerli bir tutar gir.',true);return;}var d=await c.from('price_alerts').update({notification_mode:m,threshold_pct:t,target_price:tp||x.target_price||x.baseline_price,is_active:true,last_checked_at:null,last_status:'waiting',last_error:null,updated_at:new Date().toISOString()}).eq('id',x.id).eq('user_id',user.id);if(d.error){note('Alarm ayarları kaydedilemedi.',true);return;}o.remove();note('Fiyat alarmı güncellendi.');if(typeof window.gtag==='function')window.gtag('event','price_alert_updated',{notification_mode:m,threshold_pct:t});await loadAlerts(c,user);});}

'''
if 'function alertModeLabel(x)' not in s:
    if anchor not in s: raise SystemExit('account dashboard alert helper anchor missing')
    s=s.replace(anchor,helpers+anchor,1)
# Existing valuation -> alarm remains compatible; worker calibrates old records safely.
s=s.replace("var payload={user_id:user.id,category:x.category,brand:x.brand,model:x.model,storage:x.storage||null,baseline_price:x.estimated_price||null,target_price:x.estimated_price||null,is_active:true,updated_at:new Date().toISOString()};","var payload={user_id:user.id,category:x.category,brand:x.brand,model:x.model,storage:x.storage||null,baseline_price:x.estimated_price||null,target_price:x.estimated_price||null,current_price:x.estimated_price||null,notification_mode:'significant',threshold_pct:5,is_active:true,last_checked_at:null,last_status:'waiting',last_error:null,updated_at:new Date().toISOString()};")
pattern=re.compile(r"async function loadAlerts\(c,user\)\{.*?\n\}\n\nasync function loadSales",re.S)
replacement=r'''async function loadAlerts(c,user){
  var r=await c.from('price_alerts').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);if(r.error)throw r.error;
  var rows=r.data||[];setCount('kgCountAlerts',rows.filter(function(x){return x.is_active;}).length);var box=q('kgAlertList');if(!box)return;
  box.innerHTML=rows.length?rows.map(function(x){var current=Number(x.current_price||0),change=Number(x.last_change_pct||0),changeText=Number.isFinite(change)&&x.last_checked_at?((change>0?'+':'')+change.toFixed(1)+'%'):'';return '<div class="kg-account-row"><div class="kg-account-row-main"><strong>'+esc(x.brand+' '+x.model)+'</strong><span>'+esc([x.category,x.storage].filter(Boolean).join(' • '))+' • '+fmtDate(x.created_at)+'</span><span class="kg-alert-sub">'+esc(alertModeLabel(x))+' · '+esc(fmtCheck(x.last_checked_at))+'</span></div><div class="kg-account-price"><strong>'+fmtPrice(current||x.baseline_price)+'</strong><span>'+(current?'Güncel takip değeri':'Başlangıç değeri')+'</span>'+(changeText?'<small class="kg-alert-live">'+esc(changeText)+'</small>':'')+'</div><div class="kg-account-meta-wrap"><span class="kg-account-status '+(x.is_active?'':'off')+'">'+(x.is_active?'Aktif':'Kapalı')+'</span></div><div class="kg-account-actions"><button type="button" class="primary" data-edit-alert="'+esc(x.id)+'">Ayarla</button><button type="button" data-toggle-alert="'+esc(x.id)+'" data-active="'+(x.is_active?'1':'0')+'">'+(x.is_active?'Kapat':'Aç')+'</button><button type="button" class="danger" data-del-alert="'+esc(x.id)+'">Sil</button></div></div>';}).join(''):empty('Kaydettiğin bir değerlemeden fiyat alarmı oluşturabilirsin.');
  box.querySelectorAll('[data-edit-alert]').forEach(function(b){b.addEventListener('click',function(){var x=rows.find(function(v){return v.id===b.dataset.editAlert;});if(x)openAlertEditor(c,user,x);});});
  box.querySelectorAll('[data-toggle-alert]').forEach(function(b){b.addEventListener('click',async function(){var active=b.dataset.active==='1';var d=await c.from('price_alerts').update({is_active:!active,last_checked_at:null,updated_at:new Date().toISOString()}).eq('id',b.dataset.toggleAlert).eq('user_id',user.id);if(d.error)return note('Alarm güncellenemedi.',true);await loadAlerts(c,user);});});
  box.querySelectorAll('[data-del-alert]').forEach(function(b){b.addEventListener('click',async function(){if(!confirm('Bu fiyat alarmını silmek istiyor musun?'))return;var d=await c.from('price_alerts').delete().eq('id',b.dataset.delAlert).eq('user_id',user.id);if(d.error)return note('Alarm silinemedi.',true);await loadAlerts(c,user);});});
}

async function loadSales'''
if not pattern.search(s): raise SystemExit('account dashboard loadAlerts block missing')
s=pattern.sub(replacement,s,count=1)
write(p,s,old)

# Cache-bust changed frontend JS.
for name in ['index.html','hesabim/index.html']:
    p=Path(name); s=p.read_text(encoding='utf-8'); old=s
    if name=='index.html':
        s=re.sub(r'/assets/result-v2\.js\?v=[^"\']+', '/assets/result-v2.js?v=20260904-p10', s)
    else:
        s=re.sub(r'/assets/account-dashboard\.js\?v=[^"\']+', '/assets/account-dashboard.js?v=20260904-p10', s)
    write(p,s,old)

print('PHASE 10 GROWTH WIRE:',len(changed),'file(s) updated')
for x in changed: print(' -',x)
