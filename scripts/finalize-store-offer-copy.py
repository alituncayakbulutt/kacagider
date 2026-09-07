from pathlib import Path


def patch(path, replacements):
    p=Path(path)
    text=p.read_text(encoding='utf-8')
    for old,new in replacements:
        if old not in text:
            raise SystemExit(f'Missing expected copy in {path}: {old}')
        text=text.replace(old,new)
    p.write_text(text,encoding='utf-8')

patch('assets/marketplace-sell-options-modal.js',[
    ("{key:'front',title:'Ön yüz',hint:'Ekran tamamen görünsün',required:true}","{key:'front',title:'Ön yüz',hint:'Cihazın ön yüzü tamamen görünsün',required:true}"),
    ("{key:'back',title:'Arka yüz',hint:'Kamera ve arka kapak görünsün',required:true}","{key:'back',title:'Arka yüz',hint:'Cihazın arka yüzü tamamen görünsün',required:true}"),
    ("{key:'side',title:'Yan / kasa',hint:'Kasa ve kenarlar net görünsün',required:true}","{key:'side',title:'Yan / kasa',hint:'Cihazın yanları ve kasası net görünsün',required:true}"),
    ("placeholder=\"Örn. kasada küçük ezik var, kamera ve Face ID sorunsuz...\"","placeholder=\"Örn. kasada küçük ezik var, cihazın işlevleri sorunsuz...\"")
])

patch('assets/marketplace-damage-guard.js',[
    ('telefoncunun teklifini değiştirebileceğini','mağazanın teklifini değiştirebileceğini')
])

# Ensure the newly changed damage guard is cache-busted too.
p=Path('assets/marketplace-sell-options.js')
text=p.read_text(encoding='utf-8')
text=text.replace('marketplace-damage-guard.js?v=20260906-damage-guard','marketplace-damage-guard.js?v=20260907-store1')
p.write_text(text,encoding='utf-8')

print('Generic device/store wording finalized.')