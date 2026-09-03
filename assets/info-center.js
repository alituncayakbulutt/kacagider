(function(){
  'use strict';
  var root=document.querySelector('.kg-help');
  if(!root)return;

  function norm(v){var x=String(v||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c');x=x.replace(/acilmiyo[r]?/g,'acilmiyor').replace(/kapandi/g,'kapandi acilmiyor').replace(/tepki vermiyo[r]?/g,'tepki vermiyor acilmiyor').replace(/siyah ekran/g,'siyah ekran acilmiyor').replace(/sarj(i|ı)? da oldugu halde/g,'sarjda oldugu halde acilmiyor');return x.trim();}
  function ga(name,params){if(typeof window.gtag==='function')window.gtag('event',name,Object.assign({page_path:location.pathname},params||{}));}

  var techKnowledge=[
    {icon:'⚫',q:'Telefon kapandı ve açılmıyor',keys:'telefon açılmıyor acilmiyor cihaz açılmıyor kapandı açılmıyor siyah ekran tepki vermiyor güç gelmiyor iphone açılmıyor samsung açılmıyor android açılmıyor şarjda olduğu halde açılmıyor sarjda oldugu halde acilmiyor',answer:'Telefon şarjı olduğu halde kapandı ve hiç açılmıyorsa önce zorla yeniden başlatmayı dene. Bu işlem verileri silmez. iPhone 8 ve daha yeni modellerde Ses Aç tuşuna kısa bas, Ses Kıs tuşuna kısa bas, ardından yan tuşa Apple logosu görünene kadar basılı tut. Android cihazlarda çoğu modelde güç tuşuna 15-30 saniye basılı tutmak veya güç + ses kısma kombinasyonu işe yarayabilir.',steps:['Cihazı sağlam bir kablo ve adaptörle en az 30 dakika şarjda bırak.','iPhone 8 ve sonrası: Ses Aç → Ses Kıs → yan tuşa Apple logosuna kadar basılı tut.','Android: güç tuşunu 15-30 saniye basılı tut; olmazsa güç + ses kısma kombinasyonunu dene.','Cihaz aşırı ısınıyorsa, şişme/yanık kokusu varsa veya sıvı teması olduysa kullanmayı bırak ve servise başvur.']},
    {icon:'🔌',q:'Telefon şarj olmuyor, ne yapmalıyım?',keys:'telefon şarj olmuyor sarj almıyor kablo adaptör soket usb şarj girişi',answer:'Önce kablo, adaptör ve prizden başlayarak sorunu parça parça ele. Şarj girişinde toz/kir varsa metal cisim kullanmadan dikkatlice temizle. Farklı ve sağlam bir kablo/adaptörle dene. Cihaz hiç tepki vermiyorsa 20-30 dakika şarjda bırakıp yeniden başlatmayı dene.',steps:['Farklı priz, kablo ve adaptör dene.','Şarj girişini ışık altında kontrol et; metal iğne kullanma.','Cihazı yeniden başlat veya zorla yeniden başlat.','Aşırı ısınma, şişmiş batarya veya yanık kokusu varsa kullanmayı bırak ve servise başvur.']},
    {icon:'🔋',q:'Telefonun pili çok çabuk bitiyor',keys:'pil çabuk bitiyor batarya hızlı tükeniyor şarj dayanmıyor pil sağlığı battery',answer:'Pil tüketiminin en sık nedenleri yüksek ekran parlaklığı, arka planda çalışan uygulamalar, zayıf şebeke, konum servisleri ve eskimiş bataryadır. Önce pil kullanım ekranından hangi uygulamanın tükettiğini kontrol et.',steps:['Ayarlar > Pil bölümünde en çok tüketen uygulamaları kontrol et.','Ekran parlaklığını ve gereksiz arka plan yenilemeyi azalt.','Pil sağlığı destekleniyorsa kapasiteyi kontrol et.','Pil şişmesi veya ani kapanma varsa cihazı kullanmayı bırakıp servis desteği al.']},
    {icon:'🌡️',q:'Telefon çok ısınıyor',keys:'telefon ısınıyor aşırı sıcak ısınma oyun şarj kamera işlemci',answer:'Oyun, kamera, navigasyon, hızlı şarj ve sıcak ortam geçici ısınmaya neden olabilir. Fakat cihaz boşta dururken aşırı ısınıyorsa uygulama, batarya veya donanım sorunu olabilir.',steps:['Kılıfı çıkarıp cihazı serin ve gölgeli bir yerde dinlendir.','Şarj sırasında ağır uygulama kullanma.','Arka planda olağandışı çalışan uygulamaları kontrol et.','Şişme, koku veya dokunulamayacak kadar sıcaklık varsa cihazı kapat ve servise başvur.']},
    {icon:'📶',q:'Wi‑Fi bağlanmıyor veya internet gelmiyor',keys:'wifi bağlanmıyor internet yok kablosuz ağ şifre modem bağlantı',answer:'Sorunun telefonda mı modemde mi olduğunu ayırmak için başka bir cihazı aynı Wi‑Fi ağına bağlamayı dene. Diğer cihazlar çalışıyorsa telefondaki ağı unutup yeniden bağlanmak çoğu zaman çözüm sağlar.',steps:['Wi‑Fi kapat/aç ve uçak modunu kısa süre açıp kapat.','Ağı Unut seçeneğini kullanıp şifreyi yeniden gir.','Telefonu ve modemi yeniden başlat.','Sorun yalnızca tek ağdaysa modem ayarlarını veya internet servis sağlayıcını kontrol et.']},
    {icon:'📱',q:'Ekran donuyor veya dokunmatik çalışmıyor',keys:'ekran dondu dokunmatik çalışmıyor telefon kitlendi tepki vermiyor touch',answer:'Geçici yazılım kilitlenmelerinde zorla yeniden başlatma en güvenli ilk adımdır. Ekranda çatlak, sıvı teması veya darbe varsa sorun donanımsal olabilir.',steps:['Cihaz modeline uygun zorla yeniden başlatmayı dene.','Ekran koruyucu/kılıf kenar baskısı yapıyorsa çıkarıp test et.','Depolama tamamen doluysa alan aç.','Darbe veya sıvı teması sonrası başladıysa profesyonel kontrol yaptır.']},
    {icon:'🔊',q:'Telefondan ses gelmiyor',keys:'ses gelmiyor hoparlör çalışmıyor ses yok ahize medya bluetooth',answer:'Önce ses seviyesini, sessiz modu ve Bluetooth bağlantısını kontrol et. Telefon sesi bağlı bir kulaklığa veya araca yönlendiriyor olabilir.',steps:['Medya ve zil sesi seviyelerini ayrı ayrı kontrol et.','Bluetooth’u kapatıp tekrar dene.','Hoparlör ızgarasının kapalı veya kirli olmadığını kontrol et.','Arama sesi var ama medya sesi yoksa uygulama ve ses çıkışı ayarlarını kontrol et.']},
    {icon:'🎙️',q:'Mikrofon çalışmıyor, karşı taraf sesimi duymuyor',keys:'mikrofon çalışmıyor sesim gitmiyor karşı taraf duymuyor arama whatsapp mikrofon',answer:'Kılıfın mikrofon deliğini kapatması, uygulama mikrofon izni veya kirlenme sık görülen nedenlerdir. Ses kaydedici ile kısa kayıt alarak mikrofonu test edebilirsin.',steps:['Kılıfı çıkar ve mikrofon deliklerini kontrol et.','Ses Kaydedici ile test kaydı yap.','Sorun yalnızca bir uygulamadaysa mikrofon iznini kontrol et.','Tüm uygulamalarda sorun varsa donanım kontrolü gerekebilir.']},
    {icon:'📸',q:'Kamera açılmıyor veya bulanık çekiyor',keys:'kamera açılmıyor bulanık netlemiyor fotoğraf siyah ekran lens',answer:'Lens kirliyse veya koruyucu cam kamerayı kapatıyorsa görüntü bulanıklaşabilir. Kamera uygulamasını kapatıp açmak ve telefonu yeniden başlatmak geçici yazılım sorunlarını çözebilir.',steps:['Lensleri mikrofiber bezle temizle.','Kamera koruyucu varsa çıkarıp test et.','Kamera uygulamasını kapat/aç ve telefonu yeniden başlat.','Darbe sonrası netleme yapmıyorsa kamera modülü kontrol edilmelidir.']},
    {icon:'💾',q:'Depolama alanı dolu, nasıl yer açarım?',keys:'depolama dolu hafıza dolu alan yok storage yer açma fotoğraf video uygulama',answer:'En fazla alanı genellikle videolar, fotoğraflar, mesajlaşma uygulaması medyaları ve kullanılmayan uygulamalar kaplar. Önce Ayarlar > Depolama ekranından büyük kategoriyi bul.',steps:['Büyük video ve indirilen dosyaları kontrol et.','WhatsApp/Telegram gibi uygulamalardaki büyük medyaları temizle.','Kullanmadığın uygulamaları kaldır veya boşalt.','Önemli fotoğraf ve videoları yedeklemeden silme.']},
    {icon:'🐢',q:'Telefon çok yavaşladı',keys:'telefon yavaş kasıyor donuyor performans ağır uygulama depolama ram',answer:'Dolmuş depolama, arka planda çok uygulama, eski yazılım veya yaşlanmış batarya performansı etkileyebilir. Önce depolamada boş alan bırak ve telefonu yeniden başlat.',steps:['En az birkaç GB boş alan oluştur.','Kullanmadığın uygulamaları kaldır.','Telefonu yeniden başlat ve güncellemeleri kontrol et.','Sıfırlama düşünüyorsan önce mutlaka yedek al.']},
    {icon:'🔁',q:'Telefon kendiliğinden kapanıyor veya yeniden başlıyor',keys:'kendi kendine kapanıyor yeniden başlıyor reset atıyor bootloop açılıp kapanıyor',answer:'Düşük pil sağlığı, hatalı uygulama, depolama sorunu veya donanım arızası buna yol açabilir. Sorun şarj yüzdesi yüksekken de oluyorsa batarya ve yazılım tarafını kontrol etmek gerekir.',steps:['Telefonu güncelle ve son yüklenen şüpheli uygulamaları kaldır.','Depolamada yeterli boş alan bırak.','Pil sağlığı/servis uyarısını kontrol et.','Cihaz açılış logosunda kalıyorsa veri kaybı riski nedeniyle rastgele sıfırlama yapmadan önce destek al.']},
    {icon:'📡',q:'SIM kartı görmüyor veya şebeke yok',keys:'sim kart yok şebeke çekmiyor servis yok hat görmüyor mobil veri',answer:'SIM kartın oturuşu, operatör kesintisi, uçak modu veya ağ ayarları nedeniyle şebeke kaybolabilir. Aynı SIM kartı başka cihazda denemek sorunun kaynağını ayırmaya yardımcı olur.',steps:['Uçak modunu aç/kapat ve cihazı yeniden başlat.','SIM kartı çıkarıp doğru şekilde yeniden tak.','Operatörde bölgesel kesinti olup olmadığını kontrol et.','SIM başka telefonda çalışıyor ama bu cihazda çalışmıyorsa ağ/donanım kontrolü gerekebilir.']},
    {icon:'🔐',q:'Ekran kilidi veya parolamı unuttum',keys:'şifre unuttum ekran kilidi parola pin desen face id touch id cihaz kilitli',answer:'Ekran kilidini atlatmaya yönelik yöntemler güvenli değildir. Resmi Apple/Google/Samsung hesap kurtarma ve cihaz sıfırlama seçeneklerini kullanmalısın; sıfırlama verileri silebilir ve cihaz tekrar eski hesap bilgilerini isteyebilir.',steps:['Cihaza bağlı Apple/Google/Samsung hesabını hatırlamaya çalış.','Hesap kurtarma sayfasından hesabı geri al.','Resmi kurtarma/sıfırlama yöntemini kullan.','Sıfırlama öncesi yedek yoksa verilerin silinebileceğini unutma.']},
    {icon:'☁️',q:'Telefonu satmadan önce nasıl yedekleyip sıfırlarım?',keys:'satmadan önce sıfırlama yedekleme iphone android fabrika ayarları icloud google hesap çıkış',answer:'Satıştan önce önce yedek al, ardından Apple ID/Google hesabından çıkış yap ve cihaz bulma/aktivasyon kilidi özelliklerini doğru şekilde kapat. Son adım fabrika ayarlarına sıfırlamadır.',steps:['Fotoğraf, kişi ve önemli dosyaları yedekle.','Apple ID/Google/Samsung hesabından çıkış yap.','SIM/eSIM ve hafıza kartını kaldır.','Fabrika ayarlarına sıfırla ve kurulum ekranında bırak.']},
    {icon:'💧',q:'Telefon suya düştü, ne yapmalıyım?',keys:'suya düştü ıslandı sıvı teması denize düştü su aldı şarj etmeli miyim',answer:'Islak cihazı şarja takmak kısa devre riskini artırabilir. Cihazı kapat, kablo bağlama ve ısıtıcı/fön kullanma. Pirinç de güvenilir bir çözüm değildir.',steps:['Mümkünse cihazı hemen kapat.','Şarja takma ve bağlantı noktalarına kablo takma.','Fön, kalorifer veya yüksek ısı kullanma.','Tuzlu/şekerli sıvı teması veya belirti varsa profesyonel sıvı teması kontrolü yaptır.']},
    {icon:'🖥️',q:'Bilgisayar açılmıyor',keys:'bilgisayar laptop açılmıyor ekran gelmiyor güç yok macbook windows şarj',answer:'Önce güç kaynağını ayır. Adaptör/priz ve şarj göstergesini kontrol et. Cihaz çalışıyor gibi olup görüntü yoksa ekran veya görüntü çıkışı ayrı bir sorun olabilir.',steps:['Priz ve adaptörü başka bir cihaz/uygun adaptör ile kontrol et.','Tüm USB aksesuarlarını çıkarıp tekrar açmayı dene.','Güç tuşuna 10-15 saniye basılı tutup tekrar dene.','Yanık kokusu, sıvı teması veya batarya şişmesi varsa kullanmayı bırak.']},
    {icon:'⌨️',q:'Bilgisayar klavyesinde bazı tuşlar çalışmıyor',keys:'klavye tuş çalışmıyor laptop macbook tuş basmıyor keyboard',answer:'Sorunun yazılımsal mı fiziksel mi olduğunu anlamak için farklı bir uygulamada ve mümkünse harici klavyeyle test et. Sıvı teması sonrası başladıysa fiziksel müdahale riski yüksektir.',steps:['Cihazı yeniden başlat ve farklı uygulamada dene.','Klavye dili/düzenini kontrol et.','Harici klavye ile test et.','Sıvı teması varsa cihazı kapatıp profesyonel destek al.']},
    {icon:'🎮',q:'Oyun konsolu kontrolcüyü görmüyor',keys:'playstation xbox nintendo kontrolcü kol bağlanmıyor eşleşmiyor bluetooth gamepad',answer:'Kontrolcünün şarjını ve eşleştirme modunu kontrol et. Kablo ile bağlayıp tekrar eşleştirmek çoğu konsolda bağlantıyı yeniler.',steps:['Kontrolcüyü şarj et.','Konsolu yeniden başlat.','Uygun USB kablo ile kontrolcüyü konsola bağla ve eşleştir.','Başka kontrolcü çalışıyorsa sorun kontrolcünün kendisinde olabilir.']},
    {icon:'⌚',q:'Akıllı saat telefona bağlanmıyor',keys:'akıllı saat bağlanmıyor eşleşmiyor apple watch galaxy watch bluetooth saat telefon',answer:'Bluetooth, eski eşleşme kaydı ve uygulama izinleri en sık nedenlerdir. Saat başka bir telefona bağlıysa önce eski eşleşmenin kaldırılması gerekebilir.',steps:['Telefon ve saatte Bluetooth’u kontrol et.','Her iki cihazı yeniden başlat.','Eski eşleşme kaydını kaldırıp yeniden eşleştir.','Apple Watch/benzeri cihazlarda önceki hesap/aktivasyon kilidini kontrol et.']}
  ];

  function buildTechItems(){
    var list=root.querySelector('#kgHelpList');
    if(!list)return;
    techKnowledge.forEach(function(k,index){
      var article=document.createElement('article');
      article.className='kg-help-item kg-help-tech-item';
      article.setAttribute('data-help-category','teknik');
      article.setAttribute('data-help-keywords',k.keys+' '+k.q+' '+k.answer+' '+k.steps.join(' '));
      article.innerHTML='<button class="kg-help-question" type="button" aria-expanded="false"><span><b>'+k.icon+'</b> '+k.q+'</span><i>+</i></button><div class="kg-help-answer"><p>'+k.answer+'</p><ol>'+k.steps.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ol><button class="kg-help-chat-this" type="button" data-chat-index="'+index+'">Bu sorun için destek asistanına sor →</button></div>';
      list.appendChild(article);
    });
    var side=root.querySelector('.kg-help-side');
    var mini=side&&side.querySelector('.kg-help-mini');
    if(side&&!side.querySelector('[data-help-filter="teknik"]')){
      var b=document.createElement('button');
      b.className='kg-help-filter';b.type='button';b.setAttribute('data-help-filter','teknik');b.innerHTML='🧰 Teknik Sorunlar <span>'+techKnowledge.length+'</span>';
      side.insertBefore(b,mini||null);
    }
    var wizard=root.querySelector('.kg-help-wizard-grid');
    if(wizard&&!wizard.querySelector('[data-wizard-filter="teknik"]')){
      var wb=document.createElement('button');wb.type='button';wb.setAttribute('data-wizard-filter','teknik');wb.textContent='Teknik sorun';wizard.appendChild(wb);
    }
  }
  buildTechItems();

  var search=root.querySelector('#kgHelpSearch');
  if(search){search.placeholder='Örn. telefon şarj olmuyor, Wi‑Fi bağlanmıyor, pil çabuk bitiyor, ilanım görünmüyor…';search.setAttribute('aria-label','Cihaz ve KaçaGider sorunlarında ara');}
  var heroP=root.querySelector('.kg-help-hero p');
  if(heroP)heroP.textContent='Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolu sorunlarının yanında KaçaGider fiyat, ilan ve hesap işlemleriyle ilgili çözümleri tek yerde ara.';
  var heroTitle=root.querySelector('#kgHelpTitle');
  if(heroTitle)heroTitle.textContent='Sorununu yaz, çözümü birlikte bulalım.';

  var items=[].slice.call(root.querySelectorAll('.kg-help-item'));
  var filters=[].slice.call(root.querySelectorAll('[data-help-filter]'));
  var count=root.querySelector('#kgHelpCount');
  var empty=root.querySelector('#kgHelpEmpty');
  var active='all';

  var allFilter=root.querySelector('[data-help-filter="all"] span');
  if(allFilter)allFilter.textContent=items.length;
  if(count)count.textContent=items.length+' sonuç';

  function apply(){
    var q=norm(search&&search.value);
    var visible=0;
    items.forEach(function(item){
      var category=item.getAttribute('data-help-category')||'';
      var hay=norm((item.getAttribute('data-help-keywords')||'')+' '+item.textContent);
      var okCategory=active==='all'||category===active;
      var parts=q.split(/\s+/).filter(Boolean);
      var okQuery=!q||hay.indexOf(q)!==-1||parts.every(function(part){return hay.indexOf(part)!==-1;})||parts.filter(function(part){return hay.indexOf(part)!==-1;}).length>=Math.max(1,Math.ceil(parts.length*.6));
      var show=okCategory&&okQuery;
      item.hidden=!show;
      item.classList.remove('kg-help-match');
      if(show){visible++;if(q)item.classList.add('kg-help-match');}
    });
    if(count)count.textContent=visible+' sonuç';
    if(empty){empty.hidden=visible!==0;if(!visible&&q){var p=empty.querySelector('p');if(p)p.textContent='Bu ifadeyle birebir sonuç bulamadık. Sağ alttaki Destek Asistanı’na sorunu kendi cümlenle yazabilirsin.';}}
  }
  function chooseFilter(value){
    active=value||'all';
    filters.forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-help-filter')===active);});
    apply();
  }
  filters.forEach(function(btn){btn.addEventListener('click',function(){chooseFilter(btn.getAttribute('data-help-filter'));ga('info_center_filter',{filter:active});});});
  items.forEach(function(item){
    var button=item.querySelector('.kg-help-question');
    if(!button)return;
    button.addEventListener('click',function(){
      var opening=!item.classList.contains('open');
      item.classList.toggle('open',opening);
      button.setAttribute('aria-expanded',opening?'true':'false');
      if(opening)ga('info_center_answer_opened',{question:String(button.textContent||'').trim().slice(0,120),category:item.getAttribute('data-help-category')||''});
    });
  });
  if(search){
    var timer;
    search.addEventListener('input',function(){clearTimeout(timer);apply();timer=setTimeout(function(){var q=String(search.value||'').trim();if(q.length>=3)ga('info_center_search',{search_term:q.slice(0,100)});},500);});
  }
  [].slice.call(root.querySelectorAll('[data-help-query]')).forEach(function(btn){btn.addEventListener('click',function(){if(search){search.value=btn.getAttribute('data-help-query')||'';search.focus();chooseFilter('all');apply();}ga('info_center_popular_clicked',{query:btn.getAttribute('data-help-query')||''});});});
  var wizard=root.querySelector('#kgHelpWizard'),start=root.querySelector('#kgHelpStart'),close=root.querySelector('#kgHelpWizardClose');
  if(start&&wizard)start.addEventListener('click',function(){wizard.hidden=false;wizard.scrollIntoView({behavior:'smooth',block:'nearest'});ga('info_center_wizard_started');});
  if(close&&wizard)close.addEventListener('click',function(){wizard.hidden=true;});
  [].slice.call(root.querySelectorAll('[data-wizard-filter]')).forEach(function(btn){btn.addEventListener('click',function(){var value=btn.getAttribute('data-wizard-filter')||'all';if(search)search.value='';chooseFilter(value);if(wizard)wizard.hidden=true;var first=items.find(function(item){return !item.hidden;});if(first)first.scrollIntoView({behavior:'smooth',block:'center'});ga('info_center_wizard_choice',{filter:value});});});
  root.addEventListener('click',function(e){var link=e.target.closest&&e.target.closest('.kg-help-answer a');if(link)ga('info_center_solution_cta',{destination:link.getAttribute('href')||'',link_text:String(link.textContent||'').trim().slice(0,80)});});

  function scoreKnowledge(text,k){
    var q=norm(text),words=q.split(/\s+/).filter(function(w){return w.length>2;});
    var hay=norm(k.q+' '+k.keys+' '+k.answer+' '+k.steps.join(' '));
    var score=0;if(hay.indexOf(q)!==-1&&q.length>3)score+=8;
    words.forEach(function(w){if(hay.indexOf(w)!==-1)score+=1;});
    return score;
  }
  function getSupportReply(text){
    var q=norm(text);
    if(!q)return null;
    if(/(merhaba|selam|iyi gunler|hello)/.test(q))return {title:'Merhaba 👋',body:'Ben KaçaGider Destek Asistanı. Cihazındaki teknik sorunu veya KaçaGider’de yaşadığın problemi kendi cümlenle yazabilirsin. Örneğin “telefon şarj olmuyor” ya da “ilanım görünmüyor”.'};
    var ranked=techKnowledge.map(function(k){return {k:k,s:scoreKnowledge(text,k)};}).sort(function(a,b){return b.s-a.s;});
    if(ranked[0]&&ranked[0].s>=2){var k=ranked[0].k;return {title:k.icon+' '+k.q,body:k.answer,steps:k.steps};}
    var siteMatches=items.filter(function(item){if(item.getAttribute('data-help-category')==='teknik')return false;var hay=norm((item.getAttribute('data-help-keywords')||'')+' '+item.textContent);var words=q.split(/\s+/).filter(function(w){return w.length>2;});return words.filter(function(w){return hay.indexOf(w)!==-1;}).length>=Math.max(1,Math.ceil(words.length*.5));});
    if(siteMatches.length){var it=siteMatches[0],titleEl=it.querySelector('.kg-help-question span'),ans=it.querySelector('.kg-help-answer');return {title:titleEl?titleEl.textContent.trim():'KaçaGider desteği',body:ans?String((ans.querySelector('p')||ans).textContent||'').trim():'Bu konu için Bilgi Merkezi’nde çözüm mevcut.',siteItem:it};}
    return {title:'Biraz daha ayrıntı verebilir misin?',body:'Sorunu tam eşleştiremedim. Cihaz türünü ve belirtiyi birlikte yazarsan daha iyi yardımcı olabilirim. Örneğin: “iPhone şarj oluyor ama pil çok hızlı bitiyor” veya “ilan verdim ama ilanlar sayfasında görünmüyor”.'};
  }

  function addChat(){
    var wrap=document.createElement('div');wrap.className='kg-support';
    wrap.innerHTML='<button class="kg-support-launch" type="button" aria-expanded="false"><span class="kg-support-dot"></span><b>Canlı Destek</b></button><section class="kg-support-panel" hidden aria-label="KaçaGider Destek Asistanı"><header><div><strong>KaçaGider Destek Asistanı</strong><small><span></span> Otomatik destek • anında yanıt</small></div><button class="kg-support-close" type="button" aria-label="Desteği kapat">×</button></header><div class="kg-support-messages" aria-live="polite"><div class="kg-support-msg bot"><b>Merhaba 👋</b><p>Cihazında veya KaçaGider’de yaşadığın sorunu yaz. Sana adım adım yardımcı olayım.</p></div></div><div class="kg-support-suggestions"><button type="button">Telefon şarj olmuyor</button><button type="button">Pil çabuk bitiyor</button><button type="button">İlanım görünmüyor</button></div><form class="kg-support-form"><input type="text" autocomplete="off" placeholder="Sorununu buraya yaz…" aria-label="Destek sorununu yaz"><button type="submit" aria-label="Gönder">➤</button></form><p class="kg-support-note">Bu otomatik destek asistanıdır. Güvenlik açısından şifre, IMEI, kimlik veya ödeme bilgisi paylaşma.</p></section>';
    document.body.appendChild(wrap);
    var launch=wrap.querySelector('.kg-support-launch'),panel=wrap.querySelector('.kg-support-panel'),closer=wrap.querySelector('.kg-support-close'),form=wrap.querySelector('.kg-support-form'),input=form.querySelector('input'),messages=wrap.querySelector('.kg-support-messages');
    function toggle(open){panel.hidden=!open;launch.setAttribute('aria-expanded',open?'true':'false');if(open){setTimeout(function(){input.focus();},50);ga('support_assistant_opened');}}
    launch.addEventListener('click',function(){toggle(panel.hidden);});closer.addEventListener('click',function(){toggle(false);});
    function send(text){text=String(text||'').trim();if(!text)return;var u=document.createElement('div');u.className='kg-support-msg user';u.innerHTML='<p></p>';u.querySelector('p').textContent=text;messages.appendChild(u);var reply=getSupportReply(text);var b=document.createElement('div');b.className='kg-support-msg bot';var html='<b>'+reply.title+'</b><p>'+reply.body+'</p>';if(reply.steps&&reply.steps.length)html+='<ol>'+reply.steps.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ol>';if(reply.siteItem)html+='<button class="kg-support-show" type="button">Bilgi Merkezi’nde göster</button>';b.innerHTML=html;messages.appendChild(b);if(reply.siteItem){b.querySelector('.kg-support-show').addEventListener('click',function(){toggle(false);if(search)search.value='';chooseFilter('all');items.forEach(function(x){x.hidden=x!==reply.siteItem;});if(count)count.textContent='1 sonuç';reply.siteItem.classList.add('open');reply.siteItem.querySelector('.kg-help-question').setAttribute('aria-expanded','true');reply.siteItem.scrollIntoView({behavior:'smooth',block:'center'});});}messages.scrollTop=messages.scrollHeight;ga('support_assistant_question',{question:text.slice(0,100)});}
    form.addEventListener('submit',function(e){e.preventDefault();var v=input.value;input.value='';send(v);});
    [].slice.call(wrap.querySelectorAll('.kg-support-suggestions button')).forEach(function(b){b.addEventListener('click',function(){send(b.textContent);});});
    root.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.kg-help-chat-this');if(!b)return;var k=techKnowledge[Number(b.getAttribute('data-chat-index'))];if(!k)return;toggle(true);send(k.q);});
  }
  addChat();
  apply();
})();