#!/usr/bin/env python3
from pathlib import Path
import re

MIN_DESCRIPTION = 90
MAX_DESCRIPTION = 180
SHORT_SUFFIX = " Adımları, önemli uyarıları ve ilgili cihaz kontrollerini KaçaGider'da inceleyin."
SHORTER_SUFFIX = " Önemli adımları ve uyarıları KaçaGider'da inceleyin."

# One intentionally long hub description needs a tighter, search-focused rewrite.
OVERRIDES = {
    "bilgi-merkezi/index.md": (
        "Fiyat hesaplama, ilan verme, telefon sorunları, cihaz kondisyonu, IMEI, hesap doğrulama "
        "ve güvenli ikinci el satış çözümlerini KaçaGider Bilgi Merkezi'nde bulun."
    ),
}


def split_frontmatter(text: str):
    if not text.startswith("---\n"):
        return None
    marker = text.find("\n---", 4)
    if marker == -1:
        return None
    return text[4:marker].splitlines(), text[marker + 4:]


def quoted_value(lines, key: str):
    prefix = key + ":"
    for line in lines:
        if not line.startswith(prefix):
            continue
        raw = line[len(prefix):].strip()
        if len(raw) >= 2 and raw[0] == raw[-1] == '"':
            return raw[1:-1]
    return None


def replace_quoted(lines, key: str, value: str):
    escaped = value.replace('\\', '\\\\').replace('"', '\\"')
    prefix = key + ":"
    for index, line in enumerate(lines):
        if line.startswith(prefix):
            lines[index] = f'{key}: "{escaped}"'
            return True
    return False


def extend_short(description: str):
    base = description.strip()
    if not base.endswith((".", "!", "?")):
        base += "."
    candidate = base + SHORT_SUFFIX
    if len(candidate) <= MAX_DESCRIPTION:
        return candidate
    candidate = base + SHORTER_SUFFIX
    if len(candidate) <= MAX_DESCRIPTION:
        return candidate
    # Last-resort compact wording; keeps the original search intent intact.
    suffix = " Adımları ve önemli uyarıları KaçaGider'da inceleyin."
    candidate = base + suffix
    if len(candidate) <= MAX_DESCRIPTION:
        return candidate
    return candidate[:MAX_DESCRIPTION - 1].rstrip(" ,;:-") + "."


def main():
    changed = []
    for path in sorted(Path('.').rglob('index.md')):
        if any(part.startswith('.') for part in path.parts):
            continue
        text = path.read_text(encoding='utf-8')
        parsed = split_frontmatter(text)
        if not parsed:
            continue
        lines, rest = parsed
        canonical = quoted_value(lines, 'seo_canonical')
        description = quoted_value(lines, 'seo_description')
        if not canonical or description is None:
            continue

        rel = path.as_posix()
        new_description = OVERRIDES.get(rel, description)
        if rel not in OVERRIDES and len(description) < MIN_DESCRIPTION:
            new_description = extend_short(description)

        if new_description == description:
            continue
        if not (MIN_DESCRIPTION <= len(new_description) <= MAX_DESCRIPTION):
            raise RuntimeError(
                f'{rel}: generated description length {len(new_description)} is outside '
                f'{MIN_DESCRIPTION}-{MAX_DESCRIPTION}'
            )
        if not replace_quoted(lines, 'seo_description', new_description):
            raise RuntimeError(f'{rel}: seo_description could not be replaced')

        rebuilt = "---\n" + "\n".join(lines) + "\n---" + rest
        path.write_text(rebuilt, encoding='utf-8')
        changed.append((rel, len(description), len(new_description)))

    print(f'SEO Phase 6 cleanup: {len(changed)} description(s) updated')
    for rel, before, after in changed:
        print(f' - {rel}: {before} -> {after}')


if __name__ == '__main__':
    main()
