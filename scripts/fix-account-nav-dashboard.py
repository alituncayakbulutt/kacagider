from pathlib import Path
import re

TARGET = Path('assets/account-session-nav.js')
text = TARGET.read_text(encoding='utf-8')
original = text

# Logged-in users should see only "Hesabım" outside the account page.
# The dedicated /hesabim/ page already owns its own Çıkış button.
pattern = re.compile(r'function renderFallback\(user,api\)\{.*?\n\}\nasync function sync\(\)', re.S)
replacement = '''function renderFallback(user,api){\n  if(useHeaderOwnedButton())return;var host=actionsHost();if(!host)return;installStyle();var button=document.getElementById("kgAccountSessionAction");\n  if(user){\n    if(button)button.remove();\n    var dashboard=ensureDashboardAction(user);\n    if(dashboard)placeAfterSell(dashboard);\n    return;\n  }\n  ensureDashboardAction(null);\n  if(!button){button=document.createElement("button");button.type="button";button.id="kgAccountSessionAction";button.className="kg-account-session";}\n  button.className="kg-account-session";button.textContent="Giriş Yap";button.setAttribute("aria-label","KaçaGider hesabına giriş yap veya üye ol");button.onclick=function(){openLogin(api,"login");};button.disabled=false;if(button.parentNode!==host)host.appendChild(button);placeAfterSell(button);\n}\nasync function sync()'''

if not pattern.search(text):
    raise SystemExit('renderFallback block not found')
text = pattern.sub(replacement, text, count=1)

if text == original:
    print('account-session-nav.js already uses account-only logged-in navigation')
else:
    TARGET.write_text(text, encoding='utf-8')
    print('patched assets/account-session-nav.js: logged-in users now see only Hesabım')

# Cache-bust every tracked textual reference so the browser does not keep the old nav behavior.
version = '20260904-account-only-fix2'
changed_refs=[]
for path in Path('.').rglob('*'):
    if not path.is_file() or path == TARGET or '.git' in path.parts:
        continue
    if path.suffix.lower() not in {'.html','.md','.js','.yml','.yaml'}:
        continue
    try:
        s=path.read_text(encoding='utf-8')
    except Exception:
        continue
    old=s
    s=re.sub(r'(/assets/account-session-nav\.js)(?:\?v=[^"\'\s<]+)?', r'\1?v='+version, s)
    if s!=old:
        path.write_text(s,encoding='utf-8')
        changed_refs.append(str(path))

print('cache-busted refs:', len(changed_refs))
for p in changed_refs:
    print(' -',p)
