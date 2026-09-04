from pathlib import Path
import re,sys

errors=[]

def read(path):
    p=Path(path)
    if not p.exists():
        errors.append(f'missing file: {path}')
        return ''
    return p.read_text(encoding='utf-8',errors='ignore')

main=read('index.html')
seo=read('_layouts/seo.html')
analytics=read('assets/analytics-events.js')
list_js=read('assets/marketplace-v2-list.js')
detail_js=read('assets/marketplace-v2-detail.js')
market_js=read('assets/marketplace-test.js')
result_js=read('assets/result-v2.js')
growth_js=read('assets/growth-leads.js')

# Exactly one GA4 config in each page template that owns page_view.
for name,text in [('index.html',main),('_layouts/seo.html',seo)]:
    count=len(re.findall(r'gtag\(["\']config["\']\s*,\s*["\']G-078JHH25LH["\']',text))
    if count!=1: errors.append(f'{name}: expected exactly 1 GA config, found {count}')

# Shared event layer must never emit GA config/page_view by itself.
if re.search(r'gtag\(["\']config["\']',analytics): errors.append('analytics-events.js must not call gtag config')
if re.search(r'gtag\(["\']event["\']\s*,\s*["\']page_view["\']',analytics): errors.append('analytics-events.js must not manually emit page_view')

# Core funnel events must stay present.
required={
  'valuation_completed':analytics,
  'price_alert_created':result_js,
  'listing_published':market_js,
  'favorite_added':list_js+detail_js,
  'growth_lead_submitted':growth_js,
}
for event,text in required.items():
    if event not in text: errors.append(f'missing core analytics event: {event}')

# Favorite event should be available from both list and detail surfaces.
if 'favorite_added' not in list_js: errors.append('favorite_added missing from marketplace list')
if 'favorite_added' not in detail_js: errors.append('favorite_added missing from marketplace detail')

if errors:
    print('ANALYTICS AUDIT: FAIL')
    for e in errors: print(' -',e)
    sys.exit(1)
print('ANALYTICS AUDIT: PASS')
print(' - GA4 config/page_view ownership: single source per page template')
print(' - Funnel events: valuation_completed -> price_alert_created/listing_published -> favorite_added/growth_lead_submitted')
