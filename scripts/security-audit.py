from pathlib import Path
import re
import sys

ROOT = Path('.')
TEXT_SUFFIXES = {'.html', '.js', '.css', '.json', '.md', '.txt', '.yml', '.yaml', '.py', '.toml', '.sql', '.sh'}
SKIP_DIRS = {'.git', '.jekyll-cache', '_site', 'node_modules'}

errors = []
checked_files = 0

# Sensitive files must never be tracked. Example/template env files are allowed.
for path in ROOT.rglob('*'):
    if not path.is_file():
        continue
    if any(part in SKIP_DIRS for part in path.parts):
        continue
    name = path.name.lower()
    if name in {'.env', '.env.local', '.env.production', '.env.development'}:
        errors.append(f'{path}: sensitive environment file is tracked')
    if path.suffix.lower() in {'.pem', '.key', '.p12', '.pfx'} or name in {'id_rsa', 'id_ed25519'}:
        errors.append(f'{path}: private credential file is tracked')

secret_patterns = {
    'Supabase secret API key': re.compile(r'sb_secret_[A-Za-z0-9_-]{16,}'),
    'Supabase service role assignment': re.compile(r'(?i)(SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY)\s*[:=]\s*["\']?[A-Za-z0-9._-]{20,}'),
    'GitHub classic token': re.compile(r'ghp_[A-Za-z0-9]{30,}'),
    'GitHub fine-grained token': re.compile(r'github_pat_[A-Za-z0-9_]{30,}'),
    'private key block': re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
    'OpenAI secret key': re.compile(r'sk-(?:proj-)?[A-Za-z0-9_-]{20,}'),
}

for path in ROOT.rglob('*'):
    if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
        continue
    if any(part in SKIP_DIRS for part in path.parts):
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    checked_files += 1
    for label, pattern in secret_patterns.items():
        if pattern.search(text):
            errors.append(f'{path}: possible {label} detected')

# Browser code is expected to use only a low-privilege Supabase publishable key.
supabase_client = Path('assets/supabase-marketplace.js')
if not supabase_client.exists():
    errors.append('assets/supabase-marketplace.js: missing')
else:
    text = supabase_client.read_text(encoding='utf-8')
    if 'sb_publishable_' not in text:
        errors.append('assets/supabase-marketplace.js: publishable key marker missing')
    if 'SUPABASE_PUBLISHABLE_KEY' not in text:
        errors.append('assets/supabase-marketplace.js: publishable key constant missing')

# Admin UI must never be indexable and must enforce the server-backed is_admin() check
# before loading management data.
admin_html = Path('admin/index.html')
if not admin_html.exists():
    errors.append('admin/index.html: missing')
else:
    text = admin_html.read_text(encoding='utf-8').casefold()
    if 'name="robots" content="noindex,nofollow"' not in text:
        errors.append('admin/index.html: noindex,nofollow missing')

admin_js = Path('assets/admin-panel.js')
if not admin_js.exists():
    errors.append('assets/admin-panel.js: missing')
else:
    text = admin_js.read_text(encoding='utf-8')
    if 'await api.isAdmin()' not in text:
        errors.append('assets/admin-panel.js: admin authorization guard missing')

if errors:
    print(f'SECURITY AUDIT: FAIL ({len(errors)} issue(s))')
    for item in errors:
        print(' -', item)
    sys.exit(1)

print(f'SECURITY AUDIT: PASS ({checked_files} text files scanned)')
print(' - no tracked production env/private-key files')
print(' - no high-privilege key/token patterns detected')
print(' - browser Supabase client uses publishable-key marker')
print(' - admin page is noindex,nofollow and keeps authorization guard')
