from pathlib import Path
import re

TARGET = Path('assets/account-session-nav.js')
text = TARGET.read_text(encoding='utf-8')
original = text

# 1) Add logged-in account/dashboard button styles and a compact mobile logout treatment.
style_anchor = '    .kg-account-session:hover,.kg-v4-action.account:hover{background:rgba(255,255,255,.11)!important;border-color:#718198!important}\n'
style_add = '''    .kg-account-session.dashboard{background:rgba(255,255,255,.075)!important;border-color:#64748b!important;text-decoration:none!important}\n    .kg-account-session.dashboard:hover{background:rgba(255,255,255,.14)!important;border-color:#8492a6!important}\n    .kg-account-session.logout::before{\n      -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M9 18H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4m7 8 4-4-4-4m4 4H9'/%3E%3C/svg%3E") center/contain no-repeat;\n      mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M9 18H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4m7 8 4-4-4-4m4 4H9'/%3E%3C/svg%3E") center/contain no-repeat;\n    }\n'''
if '.kg-account-session.dashboard' not in text:
    if style_anchor not in text:
        raise SystemExit('style anchor not found')
    text = text.replace(style_anchor, style_anchor + style_add, 1)

mobile_anchor = '    @media(max-width:640px){\n'
mobile_add = '''      .kg-account-session.logout{width:42px!important;min-width:42px!important;padding:0!important;font-size:0!important;gap:0!important}\n      .kg-account-session.logout::before{width:17px!important;height:17px!important;flex-basis:17px!important}\n'''
if '.kg-account-session.logout{width:42px' not in text:
    if mobile_anchor not in text:
        raise SystemExit('mobile style anchor not found')
    text = text.replace(mobile_anchor, mobile_anchor + mobile_add, 1)

# 2) Add helpers that create/remove and correctly order the dashboard button.
helper_anchor = 'function waitForBackend(tries){'
helper = '''function ensureDashboardAction(user){\n  var old=document.getElementById("kgAccountDashboardAction");\n  if(!user){if(old)old.remove();return null;}\n  var host=actionsHost();if(!host)return null;\n  var button=old;\n  if(!button){button=document.createElement("button");button.type="button";button.id="kgAccountDashboardAction";button.className="kg-account-session dashboard";}\n  button.textContent="Hesabım";button.setAttribute("aria-label","KaçaGider hesabımı aç");button.onclick=function(){window.location.href="/hesabim/";};button.disabled=false;\n  if(button.parentNode!==host)host.appendChild(button);\n  placeAfterSell(button);\n  return button;\n}\nfunction placeLoggedInActions(dashboard,logout){\n  var host=actionsHost();if(!host)return;\n  if(dashboard)placeAfterSell(dashboard);\n  if(logout){\n    if(dashboard&&dashboard.parentNode===host){if(dashboard.nextSibling!==logout)host.insertBefore(logout,dashboard.nextSibling);}\n    else placeAfterSell(logout);\n  }\n}\n'''
if 'function ensureDashboardAction(user)' not in text:
    idx = text.find(helper_anchor)
    if idx < 0:
        raise SystemExit('helper anchor not found')
    text = text[:idx] + helper + text[idx:]

# 3) Header-owned account controls should remove both fallback controls to prevent duplicates.
old_owned = 'function useHeaderOwnedButton(){var headerButton=document.getElementById("kgHeaderAccountAction");if(!headerButton)return false;var fallback=document.getElementById("kgAccountSessionAction");if(fallback)fallback.remove();headerButton.classList.add("account");installStyle();placeAfterSell(headerButton);return true;}'
new_owned = 'function useHeaderOwnedButton(){var headerButton=document.getElementById("kgHeaderAccountAction");if(!headerButton)return false;var fallback=document.getElementById("kgAccountSessionAction");if(fallback)fallback.remove();var dashboard=document.getElementById("kgAccountDashboardAction");if(dashboard)dashboard.remove();headerButton.classList.add("account");installStyle();placeAfterSell(headerButton);return true;}'
if old_owned in text:
    text = text.replace(old_owned, new_owned, 1)
elif new_owned not in text:
    raise SystemExit('useHeaderOwnedButton block not found')

# 4) Replace fallback rendering: logged-in users get both Hesabım and Çıkış Yap.
pattern = re.compile(r'function renderFallback\(user,api\)\{.*?\n\}\nasync function sync\(\)', re.S)
replacement = '''function renderFallback(user,api){\n  if(useHeaderOwnedButton())return;var host=actionsHost();if(!host)return;installStyle();var button=document.getElementById("kgAccountSessionAction");if(!button){button=document.createElement("button");button.type="button";button.id="kgAccountSessionAction";button.className="kg-account-session";}\n  if(user){\n    var dashboard=ensureDashboardAction(user);button.className="kg-account-session logout";button.textContent="Çıkış Yap";button.setAttribute("aria-label","KaçaGider hesabından çıkış yap");\n    button.onclick=async function(){button.disabled=true;button.textContent="Çıkılıyor…";try{var result=await api.signOut();if(result&&result.error)throw result.error;try{sessionStorage.removeItem("kg-pending-listing-auth-v1");}catch(_e){}cachedUser=null;renderFallback(null,api);}catch(error){console.error("KaçaGider çıkış:",error);button.disabled=false;button.textContent="Çıkış Yap";alert("Çıkış işlemi tamamlanamadı. Lütfen tekrar dene.");}};\n    button.disabled=false;if(button.parentNode!==host)host.appendChild(button);placeLoggedInActions(dashboard,button);\n  }else{\n    ensureDashboardAction(null);button.className="kg-account-session";button.textContent="Giriş Yap";button.setAttribute("aria-label","KaçaGider hesabına giriş yap veya üye ol");button.onclick=function(){openLogin(api,"login");};button.disabled=false;if(button.parentNode!==host)host.appendChild(button);placeAfterSell(button);\n  }\n}\nasync function sync()'''
if not pattern.search(text):
    raise SystemExit('renderFallback block not found')
text = pattern.sub(replacement, text, count=1)

if text == original:
    print('account-session-nav.js already patched')
else:
    TARGET.write_text(text, encoding='utf-8')
    print('patched assets/account-session-nav.js')

# 5) Cache-bust every tracked textual reference to account-session-nav.js.
version = '20260904-account-dashboard-fix1'
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
for p in changed_refs: print(' -',p)
