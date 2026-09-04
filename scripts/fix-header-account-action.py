from pathlib import Path
import re

TARGET=Path('assets/marketplace-nav-test.js')
text=TARGET.read_text(encoding='utf-8')
original=text

# Logged-in header state: show Hesabım, never Çıkış Yap.
text=text.replace(
    'button.dataset.authMode=user?"logout":"login";\n    button.textContent=user?"Çıkış Yap":"Giriş Yap";',
    'button.dataset.authMode=user?"account":"login";\n    button.textContent=user?"Hesabım":"Giriş Yap";\n    button.setAttribute("aria-label",user?"KaçaGider hesabımı aç":"KaçaGider hesabına giriş yap veya üye ol");'
)
text=text.replace(
    'var logged=Boolean(session&&session.user);b.dataset.authMode=logged?"logout":"login";b.textContent=logged?"Çıkış Yap":"Giriş Yap";b.disabled=false;',
    'var logged=Boolean(session&&session.user);b.dataset.authMode=logged?"account":"login";b.textContent=logged?"Hesabım":"Giriş Yap";b.setAttribute("aria-label",logged?"KaçaGider hesabımı aç":"KaçaGider hesabına giriş yap veya üye ol");b.disabled=false;'
)

# Clicking the header while logged in opens Hesabım. Sign-out remains only inside /hesabim/.
pattern=re.compile(r'''    if\(user\)\{\n      button\.textContent="Çıkılıyor…";\n      var result=await api\.signOut\(\);\n      if\(result&&result\.error\)throw result\.error;\n      try\{sessionStorage\.removeItem\("kg-pending-listing-auth-v1"\);\}catch\(_e\)\{\}\n      button\.dataset\.authMode="login";\n      button\.textContent="Giriş Yap";\n      button\.disabled=false;\n      return;\n    \}''')
text,n=pattern.subn('''    if(user){\n      window.location.href="/hesabim/";\n      return;\n    }''',text,count=1)
if n==0 and 'window.location.href="/hesabim/";' not in text:
    raise SystemExit('logged-in account action block not found')

text=text.replace(
    'account.setAttribute("aria-label","KaçaGider hesabına giriş yap veya çıkış yap");',
    'account.setAttribute("aria-label","KaçaGider hesabına giriş yap veya hesabımı aç");'
)

if 'button.textContent=user?"Çıkış Yap":"Giriş Yap";' in text or 'logged?"Çıkış Yap":"Giriş Yap"' in text:
    raise SystemExit('old logout header state still present')

if text!=original:
    TARGET.write_text(text,encoding='utf-8')
    print('patched assets/marketplace-nav-test.js')
else:
    print('marketplace-nav-test.js already patched')

# Bust every page/script reference, but never rewrite workflow files.
version='20260904-account-only-fix3'
changed=[]
for path in Path('.').rglob('*'):
    if not path.is_file() or path==TARGET or '.git' in path.parts or '.github' in path.parts:
        continue
    if path.suffix.lower() not in {'.html','.md','.js'}:
        continue
    try:
        s=path.read_text(encoding='utf-8')
    except Exception:
        continue
    old=s
    s=re.sub(r'(/assets/marketplace-nav-test\.js)(?:\?v=[^"\'\s<]+)?',r'\1?v='+version,s)
    if s!=old:
        path.write_text(s,encoding='utf-8')
        changed.append(str(path))
print('cache-busted refs:',len(changed))
for p in changed: print(' -',p)
