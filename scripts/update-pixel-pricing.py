from pathlib import Path

INDEX = Path('index.html')

SCRIPT_ANCHOR = '<script src="data/phone-prices.js"></script>'
SCRIPT_LINE = '<script src="data/screen-repair-prices.js"></script>'
OLD_RULE = '  if(state.protector==="yes"){adj+=150;addFactor(factors,"Ekran koruyucu var",150)}'
NEW_RULE = '''  if(state.protector==="yes"){
    const screenRepairPrice = typeof getAverageScreenRepairPrice === "function"
      ? Number(getAverageScreenRepairPrice(CURRENT_BRAND,CURRENT_MODEL))
      : 0;
    const pixelImpact = screenRepairPrice>0 ? -Math.round((screenRepairPrice*.50)/50)*50 : 0;
    if(pixelImpact){
      adj+=pixelImpact;
      addFactor(factors,"Ekran: piksel atması",pixelImpact);
    }
  }'''

text = INDEX.read_text(encoding='utf-8')
updated = text

if SCRIPT_LINE not in updated:
    if SCRIPT_ANCHOR not in updated:
        raise SystemExit('phone-prices.js script anchor not found; index.html left unchanged.')
    updated = updated.replace(SCRIPT_ANCHOR, SCRIPT_ANCHOR + '\n' + SCRIPT_LINE, 1)

if NEW_RULE not in updated:
    if OLD_RULE not in updated:
        raise SystemExit('Old pixel pricing rule not found; index.html left unchanged.')
    updated = updated.replace(OLD_RULE, NEW_RULE, 1)

if updated != text:
    INDEX.write_text(updated, encoding='utf-8')
    print('Pixel pricing updated: deduction is now 50% of model screen repair market average.')
else:
    print('Pixel pricing is already up to date.')
