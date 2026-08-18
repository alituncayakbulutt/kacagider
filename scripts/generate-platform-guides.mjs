import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root=process.cwd(),site="https://kacagider.com.tr",today=new Date().toISOString().slice(0,10);
const rows=`ios|iphone-nasil-sifirlanir|iPhone Nasıl Sıfırlanır?|Sıfırlama|/telefon/apple/iphone-13/
ios|iphone-ekran-goruntusu-nasil-alinir|iPhone Ekran Görüntüsü Nasıl Alınır?|Ekran görüntüsü|/telefon/apple/iphone-13/
ios|iphone-yeniden-baslatma|iPhone Nasıl Yeniden Başlatılır?|Yeniden başlatma|/telefon/apple/iphone-13/
ios|iphone-pil-sagligi|iPhone Pil Sağlığı Nasıl Kontrol Edilir?|Pil sağlığı|/telefon/apple/iphone-13/
ios|iphone-imei-nasil-ogrenilir|iPhone IMEI Numarası Nasıl Öğrenilir?|IMEI|/telefon/apple/iphone-13/
ios|iphone-yedekleme|iPhone Nasıl Yedeklenir?|Yedekleme|/telefon/apple/iphone-13/
ios|iphone-satmadan-once-ne-yapilmali|iPhone Satmadan Önce Ne Yapılmalı?|Satış öncesi|/telefon/apple/iphone-13/
ios|face-id-nasil-sifirlanir|Face ID Nasıl Sıfırlanır?|Face ID|/telefon/apple/iphone-13/
android|android-telefon-nasil-sifirlanir|Android Telefon Nasıl Sıfırlanır?|Sıfırlama|/telefon/
android|android-ekran-goruntusu-nasil-alinir|Android Ekran Görüntüsü Nasıl Alınır?|Ekran görüntüsü|/telefon/
android|android-yeniden-baslatma|Android Telefon Nasıl Yeniden Başlatılır?|Yeniden başlatma|/telefon/
android|android-imei-nasil-ogrenilir|Android IMEI Numarası Nasıl Öğrenilir?|IMEI|/telefon/
android|android-depolama-nasil-bosaltirilir|Android Depolama Alanı Nasıl Boşaltılır?|Depolama|/telefon/
android|android-telefon-yedekleme|Android Telefon Nasıl Yedeklenir?|Yedekleme|/telefon/
android|android-telefon-satmadan-once|Android Telefon Satmadan Önce Ne Yapılmalı?|Satış öncesi|/telefon/
android|android-guvenli-mod|Android Güvenli Mod Nasıl Kullanılır?|Güvenli mod|/telefon/
ipados|ipad-nasil-sifirlanir|iPad Nasıl Sıfırlanır?|Sıfırlama|/tablet/
ipados|ipad-ekran-goruntusu|iPad Ekran Görüntüsü Nasıl Alınır?|Ekran görüntüsü|/tablet/
ipados|ipad-yedekleme|iPad Nasıl Yedeklenir?|Yedekleme|/tablet/
ipados|ipad-depolama-bosaltma|iPad Depolama Alanı Nasıl Boşaltılır?|Depolama|/tablet/
android|android-tablet-nasil-sifirlanir|Android Tablet Nasıl Sıfırlanır?|Sıfırlama|/tablet/
android|android-tablet-ekran-goruntusu|Android Tablet Ekran Görüntüsü Nasıl Alınır?|Ekran görüntüsü|/tablet/
windows|windows-nasil-sifirlanir|Windows Bilgisayar Nasıl Sıfırlanır?|Sıfırlama|/bilgisayar/
windows|windows-ekran-goruntusu|Windows Ekran Görüntüsü Nasıl Alınır?|Ekran görüntüsü|/bilgisayar/
windows|windows-disk-alani-bosaltma|Windows Disk Alanı Nasıl Boşaltılır?|Depolama|/bilgisayar/
windows|windows-bilgisayar-yedekleme|Windows Bilgisayar Nasıl Yedeklenir?|Yedekleme|/bilgisayar/
windows|windows-surumu-nasil-ogrenilir|Windows Sürümü Nasıl Öğrenilir?|Sürüm|/bilgisayar/
macos|mac-nasil-sifirlanir|Mac Nasıl Sıfırlanır?|Sıfırlama|/bilgisayar/
macos|mac-ekran-goruntusu|Mac Ekran Görüntüsü Nasıl Alınır?|Ekran görüntüsü|/bilgisayar/
macos|mac-yedekleme|Mac Nasıl Yedeklenir?|Yedekleme|/bilgisayar/
macos|mac-depolama-bosaltma|Mac Depolama Alanı Nasıl Boşaltılır?|Depolama|/bilgisayar/
macos|macos-surumu-nasil-ogrenilir|macOS Sürümü Nasıl Öğrenilir?|Sürüm|/bilgisayar/
watchos|apple-watch-nasil-sifirlanir|Apple Watch Nasıl Sıfırlanır?|Sıfırlama|/akilli-saat/
watchos|apple-watch-yeniden-baslatma|Apple Watch Nasıl Yeniden Başlatılır?|Yeniden başlatma|/akilli-saat/
watchos|apple-watch-eslestirme|Apple Watch Nasıl Eşleştirilir?|Eşleştirme|/akilli-saat/
watchos|apple-watch-pil-omru|Apple Watch Pil Ömrü Nasıl Uzatılır?|Pil ömrü|/akilli-saat/
wear-os|galaxy-watch-nasil-sifirlanir|Galaxy Watch Nasıl Sıfırlanır?|Sıfırlama|/akilli-saat/
wear-os|galaxy-watch-yeniden-baslatma|Galaxy Watch Nasıl Yeniden Başlatılır?|Yeniden başlatma|/akilli-saat/
wear-os|galaxy-watch-eslestirme|Galaxy Watch Nasıl Eşleştirilir?|Eşleştirme|/akilli-saat/
playstation|playstation-nasil-sifirlanir|PlayStation Nasıl Sıfırlanır?|Sıfırlama|/oyun-konsolu/
playstation|ps5-fabrika-ayarlarina-donme|PS5 Fabrika Ayarlarına Nasıl Dönülür?|Sıfırlama|/oyun-konsolu/
playstation|playstation-kol-eslestirme|PlayStation Kolu Nasıl Eşleştirilir?|Eşleştirme|/oyun-konsolu/
playstation|playstation-depolama-bosaltma|PlayStation Depolama Alanı Nasıl Boşaltılır?|Depolama|/oyun-konsolu/
xbox|xbox-nasil-sifirlanir|Xbox Nasıl Sıfırlanır?|Sıfırlama|/oyun-konsolu/
xbox|xbox-kol-eslestirme|Xbox Kolu Nasıl Eşleştirilir?|Eşleştirme|/oyun-konsolu/
xbox|xbox-depolama-bosaltma|Xbox Depolama Alanı Nasıl Boşaltılır?|Depolama|/oyun-konsolu/
nintendo|nintendo-switch-nasil-sifirlanir|Nintendo Switch Nasıl Sıfırlanır?|Sıfırlama|/oyun-konsolu/
nintendo|switch-kol-eslestirme|Nintendo Switch Kolu Nasıl Eşleştirilir?|Eşleştirme|/oyun-konsolu/`.split("\n").map(line=>{const [platform,slug,title,type,returnUrl]=line.split("|");return {platform,slug,title,type,returnUrl,url:`/rehber/${platform}/${slug}/`};});
const platformNames={ios:"iOS",android:"Android",ipados:"iPadOS",windows:"Windows",macos:"macOS",watchos:"watchOS","wear-os":"Wear OS",playstation:"PlayStation",xbox:"Xbox",nintendo:"Nintendo"};
const copy={
  "Sıfırlama":["Ayarlar veya Sistem menüsündeki sıfırlama seçeneğini kullanın. İşlem kişisel verileri silebilir; başlamadan önce yedek alın.",["Önemli verileri yedekleyin.","Ayarlar veya Sistem menüsündeki sıfırlama seçeneğini bulun.","Ekrandaki onayları kontrol ederek işlemi tamamlayın."],"Uyarı: Menü adları sürüme göre değişebilir; sıfırlama verileri silebilir."],
  "Ekran görüntüsü":["Cihazınızın desteklediği tuş kombinasyonunu veya ekran kısayolunu kullanın. Kombinasyon platform ve modele göre değişebilir.",["Ekranda kaydetmek istediğiniz alanı açın.","Cihazın ekran görüntüsü tuş kombinasyonunu kısa süre basılı tutun.","Görseli galeri veya dosyalar uygulamasından kontrol edin."],"Not: Tuş kombinasyonları cihazın modeline göre değişebilir."],
  "Yeniden başlatma":["Güç menüsünden yeniden başlatma seçeneğini kullanın. Cihaz yanıt vermiyorsa üreticinin zorla yeniden başlatma yönergesini kontrol edin.",["Açık uygulamalardaki önemli işleri kaydedin.","Güç menüsünü açın.","Yeniden başlat seçeneğini onaylayın."],"Not: Tuşlar ve süreler modele göre değişebilir."],
  "IMEI":["Telefonlarda IMEI numarası çoğu zaman arama ekranına *#06# yazılarak görüntülenir.",["Arama uygulamasını açın.","*#06# kodunu girin.","Görünen IMEI numarasını güvenli bir yerde kontrol edin."],"Not: IMEI bilgisini herkese açık biçimde paylaşmayın."],
  "Yedekleme":["Verilerinizi bulut hesabına veya bilgisayara yedekleyin. Kullanılan uygulama ve menü adları platforma göre değişebilir.",["Yedekleme için yeterli alanı kontrol edin.","Ayarlar veya yedekleme uygulamasını açın.","Yedeklemeyi başlatıp tamamlandığını doğrulayın."],"Uyarı: Sıfırlama veya satış öncesinde güncel bir yedek alın."],
  "Depolama":["Kullanmadığınız uygulamaları ve büyük dosyaları kaldırarak alan açın.",["Depolama kullanım ekranını açın.","Büyük dosya ve kullanılmayan uygulamaları belirleyin.","Gereksiz içerikleri silip alanı yeniden kontrol edin."],"Not: Sistem dosyalarını silmeyin; menü adları sürüme göre değişebilir."],
  "Eşleştirme":["Cihazları yakın tutun, Bluetooth bağlantısını açın ve ilgili uygulamadaki eşleştirme adımlarını izleyin.",["Bluetooth ve gerekli izinleri açın.","Eşleştirme uygulamasını veya cihaz menüsünü açın.","Ekrandaki kodu doğrulayarak işlemi tamamlayın."],"Not: Adımlar marka ve modele göre değişebilir."],
  "Pil ömrü":["Ekran parlaklığını ve gereksiz bildirimleri azaltmak pil tüketimini düşürmeye yardımcı olabilir.",["Pil kullanım ekranını kontrol edin.","Gereksiz arka plan etkinliklerini sınırlayın.","Yazılım güncellemelerini ve pil tasarrufu seçeneklerini değerlendirin."],"Not: Pil davranışı kullanım ve cihaz yaşına göre değişir."],
  "Satış öncesi":["Yedek alın, hesaplardan çıkış yapın ve kişisel verileri güvenli şekilde silin.",["Önemli verileri yedekleyin.","Hesaplardan çıkış yapın ve cihaz bulma kilitlerini kaldırın.","Fabrika ayarlarına dönüş işlemini tamamlayın."],"Uyarı: Sıfırlama işlemi geri alınamaz."],
  "Face ID":["Ayarlar içindeki Face ID ayarlarından yüz verisini sıfırlayıp yeniden tanımlayın.",["Ayarlar > Face ID ve Parola bölümünü açın.","Face ID'yi Sıfırla seçeneğini kullanın.","Yüzünüzü yeniden tanımlayın."],"Not: Sorun sürerse yetkili servis desteği gerekebilir."],
  "Güvenli mod":["Güvenli mod, üçüncü taraf uygulamaların etkisini anlamaya yardımcı olur. Giriş yöntemi üreticiye göre değişebilir.",["Cihazı yeniden başlatma menüsünü açın.","Üreticinin güvenli mod yönergesini uygulayın.","Soruna neden olan uygulamayı kontrol edin."],"Not: Güvenli mod adımları her Android modelinde aynı olmayabilir."],
  "Sürüm":["Ayarlar içindeki Sistem veya Hakkında bölümünden işletim sistemi sürümünü görüntüleyin.",["Ayarlar'ı açın.","Sistem veya Hakkında bölümüne girin.","Sürüm bilgisini kontrol edin."],"Not: Menü adı platform sürümüne göre değişebilir."]
};
const y=v=>JSON.stringify(v), doc=m=>"---\n"+Object.entries(m).map(([k,v])=>`${k}: ${y(v)}`).join("\n")+"\n---\n";
const allUrls=new Set(["/","/rehber/",...rows.map(x=>x.url),...Object.keys(platformNames).map(p=>`/rehber/${p}/`)]);
async function write(url,meta){const file=path.join(root,url,"index.md");await mkdir(path.dirname(file),{recursive:true});await writeFile(file,doc(meta));}
await write("/rehber/",{layout:"seo",seo_title:"Cihaz Rehberleri | KaçaGider",seo_description:"Telefon, tablet, bilgisayar, akıllı saat ve oyun konsolu için kısa cihaz rehberleri.",seo_h1:"Cihaz Rehberleri",seo_intro:"Sık kullanılan cihaz işlemleri için platform bazlı kısa rehberler.",seo_context_heading:"Platform rehberleri",seo_context:"Cihazınızın platformunu seçerek ilgili rehberlere ulaşın.",seo_breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:"Rehber",url:"/rehber/"}],seo_links:Object.entries(platformNames).map(([p,label])=>({label,url:`/rehber/${p}/`})),seo_links_heading:"Platformlar",seo_canonical:site+"/rehber/"});
for(const [platform,label] of Object.entries(platformNames)){const url=`/rehber/${platform}/`,links=rows.filter(x=>x.platform===platform).map(x=>({label:x.title,url:x.url}));await write(url,{layout:"seo",seo_title:`${label} Rehberleri | KaçaGider`,seo_description:`${label} cihazlar için kısa ve uygulanabilir rehberler.`,seo_h1:`${label} Rehberleri`,seo_intro:`${label} cihazlarda sık kullanılan işlemler için rehberler.`,seo_context_heading:`${label} rehberleri`,seo_context:"Menü adları sürüme ve cihaza göre değişebilir.",seo_breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:"Rehber",url:"/rehber/"},{label,url}],seo_links:links,seo_links_heading:`${label} konuları`,seo_canonical:site+url});}
for(const g of rows){const [answer,steps,note]=copy[g.type]||copy["Pil ömrü"];const related=rows.filter(x=>x.platform===g.platform&&x.url!==g.url).slice(0,3).map(x=>({label:x.title,url:x.url}));await write(g.url,{layout:"seo",seo_title:`${g.title} | KaçaGider`,seo_description:`${g.title} için kısa, uygulanabilir adımlar ve önemli uyarılar.`,seo_h1:g.title,seo_intro:answer,seo_context_heading:"Kısa cevap",seo_context:answer,seo_breadcrumbs:[{label:"Ana Sayfa",url:"/"},{label:"Rehber",url:"/rehber/"},{label:platformNames[g.platform],url:`/rehber/${g.platform}/`},{label:g.title,url:g.url}],seo_links:[{label:"İlgili kategoriye dön",url:g.returnUrl},...related],seo_links_heading:"İlgili rehberler",seo_canonical:site+g.url,seo_guide:true,seo_guide_heading:"Adım adım",seo_guide_answer:answer,seo_guide_steps:steps,seo_guide_note:note,seo_guide_return_url:g.returnUrl,seo_guide_return_label:"KaçaGider'da değerini hesapla"});}
const modelGuides=(category,brand,model)=>{const base=category==="telefon"?(brand==="Apple"?[["nasıl sıfırlanır?","/rehber/ios/iphone-nasil-sifirlanir/"],["ekran görüntüsü nasıl alınır?","/rehber/ios/iphone-ekran-goruntusu-nasil-alinir/"],["pil sağlığı nasıl kontrol edilir?","/rehber/ios/iphone-pil-sagligi/"]]:[["nasıl sıfırlanır?","/rehber/android/android-telefon-nasil-sifirlanir/"],["ekran görüntüsü nasıl alınır?","/rehber/android/android-ekran-goruntusu-nasil-alinir/"],["IMEI nasıl öğrenilir?","/rehber/android/android-imei-nasil-ogrenilir/"]]):category==="tablet"?(brand==="Apple"?[["nasıl sıfırlanır?","/rehber/ipados/ipad-nasil-sifirlanir/"],["ekran görüntüsü nasıl alınır?","/rehber/ipados/ipad-ekran-goruntusu/"]]:[["nasıl sıfırlanır?","/rehber/android/android-tablet-nasil-sifirlanir/"],["ekran görüntüsü nasıl alınır?","/rehber/android/android-tablet-ekran-goruntusu/"]]):category==="bilgisayar"?[["nasıl sıfırlanır?",brand==="Apple"?"/rehber/macos/mac-nasil-sifirlanir/":"/rehber/windows/windows-nasil-sifirlanir/"],["nasıl yedeklenir?",brand==="Apple"?"/rehber/macos/mac-yedekleme/":"/rehber/windows/windows-bilgisayar-yedekleme/"]]:category==="akilli-saat"?[["nasıl sıfırlanır?",brand==="Apple"?"/rehber/watchos/apple-watch-nasil-sifirlanir/":"/rehber/wear-os/galaxy-watch-nasil-sifirlanir/"]]:[["nasıl sıfırlanır?",/xbox/i.test(model)?"/rehber/xbox/xbox-nasil-sifirlanir/":/nintendo/i.test(model)?"/rehber/nintendo/nintendo-switch-nasil-sifirlanir/":"/rehber/playstation/playstation-nasil-sifirlanir/"]];return base.map(([label,url])=>({label:`${model} ${label}`,url}));};
for(const category of ["telefon","tablet","bilgisayar","akilli-saat","oyun-konsolu"]){for(const entry of await readdir(path.join(root,category),{recursive:true})){if(!entry.endsWith("/index.md"))continue;const file=path.join(root,category,entry),source=await readFile(file,"utf8"),match=source.match(/^seo_breadcrumbs:\s*(.+)$/m);if(!match)continue;const crumbs=JSON.parse(match[1]);if(crumbs.length!==4)continue;const [, ,brandCrumb,modelCrumb]=crumbs,guides=modelGuides(category,brandCrumb.label,modelCrumb.label),clean=source.replace(/^seo_guides_heading:.*\n/m,"").replace(/^seo_guides:.*\n/m,""),fields=`seo_guides_heading: ${y(`${modelCrumb.label} ile ilgili sık arananlar`)}\nseo_guides: ${y(guides)}\n`;await writeFile(file,clean.replace(/\n---\n/,`\n${fields}---\n`));}}
let sitemap=await readFile(path.join(root,"sitemap.xml"),"utf8");const add=["/rehber/",...Object.keys(platformNames).map(p=>`/rehber/${p}/`),...rows.map(x=>x.url)].filter(url=>!sitemap.includes(`<loc>${site}${url}</loc>`)).map(url=>`  <url><loc>${site}${url}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join("\n");sitemap=sitemap.replace("</urlset>",add+"\n</urlset>");await writeFile(path.join(root,"sitemap.xml"),sitemap);console.log(JSON.stringify({topic_guides:rows.length,total_guide_urls:rows.length+1+Object.keys(platformNames).length}));
